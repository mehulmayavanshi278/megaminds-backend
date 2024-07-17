const { redis } = require("..");
const { productService } = require("../Services/services");
const { Order } = require("../models/Order.model");
const { Product, Review, Reply, Ratings } = require("../models/Product.model");
const { upload } = require("../startup/multer.startup");
const { userController } = require("./users");

class productController {
  getSingleProduct = async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      const data = await productService.findById(id).populate("reviews");
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
    }
  };
  getProducts = async (req, res) => {
    let filter = {};
    let sort = req.query?.sort || "price";
    if (sort === "ratings") {
      sort = { "ratings.avarage": -1 };
    }
    let data;

    req.query.type ? (filter["category"] = { $in: [req.query.type] }) : "";
    req.query.tag ? (filter["tags"] = { $in: [req.query.tag] }) : "";
    req.query.search
      ? (filter["$or"] = [
          { name: { $regex: new RegExp(req.query.search, "i") } },
          { description: { $regex: new RegExp(req.query.search, "i") } },
        ])
      : "";

    req.query.price ? (filter["price"] = { $lt: req.query.price }) : "",
      console.log(filter);

    try {
      if (req.query.id) {
        data = await productService.findById(req?.query?.id);
        return res.status(200).send(data);
      }
      data = await productService.find(filter).sort(sort);
      return res.status(200).send({ data: data, length: data.length });
    } catch (err) {
      console.log(err);
    }
  };

  getRandomProducts = async (req, res) => {
    try {
      let products = await productService.find();

      const max = Math.max(products?.length, products?.length - 10);
      const min = max - 10;
      console.log("max is", max);
      console.log("min is", min);
      console.log(Math.floor(Math.random() * (max - min + 1)) + min);
      const data = products?.slice(min, max);
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
    }
  };

  create = async (req, res) => {
    try {
      let {
        name,
        category,
        price,
        dummyPrice,
        description,
        tags,
        weight,
        dimension,
        vendorName,
        vendorContact,
        stock,
        status,
      } = req.body;

      console.log(req?.files);
      let files = req?.files;

      let imageUrls = files?.map((file) => file.location);
      const newProductData = {
        name,
        category,
        price,
        dummyPrice,
        description,
        tags,
        additionalInformation: { weight, dimension },
        vendorInfo: { vendorName, vendorContact },
        inventory: { stock, status },
        images: imageUrls,
      };
      let newProduct = await productService.create(newProductData);

      return res.status(200).send(newProduct);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  update = async (req, res) => {
    try {
      console.log(req.body);
      console.log(req.files);
      const id = req.params.id;
      let {
        name,
        category,
        price,
        dummyPrice,
        description,
        tags,
        weight,
        dimension,
        vendorName,
        vendorContact,
        stock,
        status,
        img,
      } = req.body;

      console.log(req?.files);
      let files = req?.files;

      let imageUrls = files?.map((file) => file.location);

      let images = [];
      if (img) {
        images =
          typeof img === "string"
            ? [img, ...imageUrls]
            : [...img, ...imageUrls];
      } else {
        imageUrls ? (images = [...imageUrls]) : null;
      }
      console.log(images);
      const newProductData = {
        name,
        category,
        price,
        dummyPrice,
        description,
        tags,
        additionalInformation: { weight, dimension },
        vendorInfo: { vendorName, vendorContact },
        inventory: { stock, status },
        images: images,
      };
      await productService.findByIdAndUpdate(id, newProductData);
      return res.status(200).send({ message: "updated successfullt" });
    } catch (err) {
      console.log(err);
    }
  };

  getSingleRating = async (req, res) => {
    try {
      const userId = req.user._id;
      const productId = req.params.id;
      let rating = await Ratings.findOne({ userId, productId });
      if (!rating) return res.status(200).send({ rate: 0 });
      return res.status(200).send(rating);
    } catch (err) {
      console.log(err);
    }
  };

  giveRatings = async (req, res) => {
    try {
      console.log("i am in");
      const id = req.user._id;
      const rate = req?.body?.rate;
      const productId = req.params.id;
      let checkRate = await Ratings.findOne({ userId: id, productId });
      let product = await productService.findById(productId);
      if (!product)
        return res.status(400).send({ message: "product not found" });
      if (checkRate) {
        let count = rate - checkRate.rate;
        checkRate.rate = rate;
        product.ratings.total += count;
        product.ratings.avarage = product.ratings.total / product.ratings.count;
      } else {
        checkRate = new Ratings({ userId: id, productId, rate });
        product.ratings.count = product.ratings.count + 1;
        product.ratings.total += rate;
        product.ratings.avarage = product.ratings.total / product.ratings.count;
      }
      await checkRate.save();
      await product.save();
      return res.status(200).send(checkRate);
    } catch (err) {
      console.log(err);
    }
  };

  updatRatings = async (req, res) => {
    try {
      const result = await Product.updateMany(
        { ratings: { $exists: false } }, // if field is not exist in database then to check we exist keyword
        {
          $set: {
            "ratings.avarage": 0,
            "ratings.total": 0,
            "ratings.count": 0,
          },
        }
      );

      res
        .status(200)
        .send({ message: "Ratings field updated for all products", result });
    } catch (error) {
      console.error("Error updating ratings field:", error);
      res.status(500).send("Internal Server Error");
    }
  };

  getReviews = async (req, res) => {
    try {
      const id = req.params.id;
      let reviews = await Review.find({ productId: id })
        .populate([
          {
            path: "userId",
            select: "firstName lastName",
          },
          {
            path: "replies",
          },
        ])
        .sort({ createdAt: -1 });

      return res.status(200).send(reviews);
    } catch (err) {
      console.log(err);
    }
  };

  getReplies = async (req, res) => {
    try {
      const id = req.params.id;
      let replies = await Reply.find({ reviewId: id })
        .populate({
          path: "userId",
          select: "firstName lastName",
        })
        .sort({ createdAt: 1 });
      return res.status(200).send(replies);
    } catch (err) {
      console.log(err);
    }
  };

  createReview = async (req, res) => {
    try {
      const id = req.params.id;
      const userId = req?.user?._id;
      const { review } = req.body;

      let product = await Product.findById(id);
      if (!product) {
        return res.status(400).send({ message: "Product Not Found" });
      }

      let newReview = new Review({
        userId,
        review,
        productId: product._id,
      });

      newReview = await newReview.save();

      product.reviews.push(newReview._id);
      await product.save();

      return res.status(200).send(newReview);
    } catch (err) {
      console.log(err);
    }
  };

  addReply = async (req, res) => {
    try {
      const id = req.params.id;
      const userId = req.user._id;
      const { reply } = req.body;
      let newReplyData = {
        userId,
        reply,
        reviewId: id,
      };
      let newReply = new Reply(newReplyData);
      await newReply.save();
      await Review.findByIdAndUpdate(id, { $push: { replies: newReply._id } });
      return res.status(200).send(newReply);
    } catch (err) {
      console.log(err);
    }
  };

  deleteReview = async (req, res) => {
    try {
      const id = req.params.id;
      const { productId } = req.body;
      let review = await Review.findById(id);

      await productService.findByIdAndUpdate(review.productId, {
        $pull: { reviews: id },
      });
      await Review.findByIdAndDelete(id);

      return res.status(200).send({ message: "Updated Successfully" });
    } catch (err) {
      console.log(err);
    }
  };
  deleteReply = async (req, res) => {
    try {
      const reviewId = req.params.reviewId;
      const id = req.params.id;

      await Review.findByIdAndUpdate(reviewId, { $pull: { replies: id } });
      await Reply.findByIdAndDelete(id);
      return res.status(200).send({ message: "Updated Successfully" });
    } catch (err) {
      console.log(err);
    }
  };
  delete = async (req, res) => {};

  getTopProducts = async (req, res) => {
    try {
      let data = await productService.find().sort({ sold: -1 }).limit(10);
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
    }
  };

  getProductsAdmin = async (req, res) => {
    try {
      let data = {};
      let sold = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalSold: {
              $sum: "$sold",
            },
          },
        },
        {
          $project: {
            _id: 0,
            sum: "$totalSold",
          },
        },
      ]);
      data["totalSold"] = sold.length > 0 ? sold[0]["sum"] : 0;

      let totalIncome = await Order.aggregate([
        {
          $match: {
            status: "confirm",
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: "$totalPrice" },
          },
        },
        {
          $project: {
            _id: 0,
            sum: "$totalIncome",
          },
        },
      ]);
      //  console.log(sold);
      // console.log(totalIncome);

      data["totalIncome"] = totalIncome.length > 0 ? totalIncome[0]["sum"] : 0;
      data["ordersPaid"] = totalIncome.length > 0 ? totalIncome[0]["sum"] : 0;

      // console.log(data);
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
    }
  };
}

module.exports.productController = new productController();
