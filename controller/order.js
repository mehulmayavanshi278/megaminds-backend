const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const YOUR_DOMAIN = "http://localhost:3000";
const { orderServices, productService } = require("../Services/services");
const { Order } = require("../models/Order.model");
const { Product } = require("../models/Product.model");

class orderController {
  getAllOrders = async (req, res) => {
    const data = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$products", // Unwind the products array
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "prodetailspage",
        },
      },
      {
        $unwind: "$prodetailspage",
      },
      {
        $group: {
          _id: "$_id",
          customerId: { $first: "$customerId" },
          customerDetails: { $first: "$customerDetails" },
          totalQuantity: { $first: "$totalQuantity" },
          totalPrice: { $first: "$totalPrice" },
          paymentStatus: { $first: "$paymentStatus" },
          orderDate: { $first: "$orderDate" },
          prodetailspage: { $push: "$prodetailspage" },
        },
      },
      {
        $unwind:"$customerDetails"
      }
    ]);

    // console.log(data);
    return res.status(200).send(data);
  };

  getSingleOrder = async (req, res) => {
    try {
      
      const id = req.params.id;
      console.log(id);
      const order = await orderServices
        .findById(id)
        .populate({
          path: "customerId",
          select: "firstName lastName shippingAddress phoneNo email ",
        })
        .populate({
          path: "products.productId",
        });
      return res.status(200).send(order);
    } catch (err) {
      console.log(err);
    }
  };

  create = async (req, res) => {
    console.log("called");
    const body = req.body.cartItems;
    const totalPrice = req.body.totalPrice.toFixed();
    console.log(totalPrice);
    const line_items = body.map((elm) => {
      return {
        price_data: {
          currency: "INR",
          product_data: {
            name: elm.name,
            images: elm.images,
            description: elm.description,
          },
          unit_amount: Math.floor(elm.price * 100),
        },
        quantity: elm.quantity,
      };
    });

    const customerId = req.user._id;
    const totalQuantity = req.body.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    console.log(req.body.cartItems);
    const newOrderData = {
      customerId,
      products: req.body.cartItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      })),
      totalPrice,
      totalQuantity,
      status: "confirm",
      paymentStatus: "paid",
    };
    let newOrder = await orderServices.create(newOrderData);

    for(const item of req.body.cartItems){
      await productService.findByIdAndUpdate(item._id , {$inc:{sold:item.quantity}} , {new:true});
    }

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/checkout-success/${newOrder._id}`,
      cancel_url: `${YOUR_DOMAIN}/cart`,
      shipping_address_collection: {
        allowed_countries: [
          "US",
          "CA",
          "GB",
          "AU",
          "SG",
          "FR",
          "DE",
          "NZ",
          "IN",
        ],
      },
    });
    console.log(session);

    res.send({ url: session.url });
  };

  webhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Replace with your webhook secret

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed.`);
      return res.sendStatus(400);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Update the order status to Confirmed and payment status to Paid
      console.log()
      await Order.findByIdAndUpdate(session.metadata.orderId, {
        status: "confirm",
        paymentStatus: "Paid",
      });
    } else if (event.type === "payment_intent.payment_failed") {
      const session = event.data.object;

      // Update the order status to Failed and payment status to Failed
      await Order.findByIdAndUpdate(session.metadata.orderId, {
        status: "Failed",
        paymentStatus: "Failed",
      });
    }

    res.sendStatus(200);
  };

  update = async (req, res) => {
    const { id } = req.params;
    let order = await orderServices.findById(id);
    await orderServices.findByIdAndUpdate(id, {
      status: "confirm",
      paymentStatus: "paid",
    });
    const arr = [];

    for (let elm of order.products) {
      const product = await productService.findById(elm.productId);
      if (!product) {
        console.log(`Product with ID ${elm.productId} not found`);
        continue; // Skip to the next cart item
      }
      product.sold += elm.quantity;
      await product.save();
    }

    return res.status(200).send({ message: "updated successfully" });
  };

  getTopCustomer = async (req, res) => {
    // console.log('entered into topcusomer');
    try {
      const result = await Order.aggregate([
        {
          $group: {
            _id: "$customerId",
            orderCount: { $sum: "$totalQuantity" },
            totalPrice: { $sum: "$totalPrice" },
          },
        },
        {
          $sort: { totalPrice: -1 },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "customerDetails",
          },
        },
        {
          $unwind: "$customerDetails",
        },
      ]);

      return res.send(result);
    } catch (err) {
      console.log(err);
    }
  };

  recentOrder = async (req, res) => {
    try {
      //  let data = await orderServices.find().sort({orderDate:-1}).limit(10);
      let data = await Order.aggregate([
        
        {
          $limit: 10,
        },
        {
          $lookup: {
            from: "users",
            localField: "customerId",
            foreignField: "_id",
            as: "customerDetails",
          },
        },
        {
          $unwind:'$products'
        },
          {
            $lookup:{
              from:"products",
              localField:'products.productId',
              foreignField:'_id',
              as:'productDetails'
            }
          },
          {
            $group:{
              _id:'$_id',
              productDetails:{$first:"$productDetails"},
              customerDetails:{$first:"$customerDetails"},
              totalQuantity:{$first:"$totalQuantity"},
              totalPrice:{$first:"$totalPrice"},
              paymentStatus:{$first:"$paymentStatus"},
              status:{$first:"$paymentStatus"},
              orderDate:{$first:"$orderDate"}
            }
          },
          {
            $unwind:"$productDetails"
          },
          {
            $unwind:"$customerDetails"
          },
          {
          $sort: { orderDate: -1 },
        },
        
      ]);
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
    }
  };

  getOrderCountByMonth = async (year) => {
    try {
      // Calculate the start and end dates of the given year
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
      console.log(startOfYear);
      console.log(endOfYear);

      let data = await Order.aggregate([  
        {
          $match: { 
            orderDate: {
              $gte: startOfYear,
              $lte: endOfYear,
            },
            status: "confirm",
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$orderDate" }, // this $month is used to find month from orderDate
            },
            value: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.month": 1 },
        },
        {
          $project: {
            month: "$_id.month",
            _id: 0,
            value: 1,
          },
        },
      ]);

      return data;
    } catch (error) {
      console.error("Error fetching order counts by month:", error);
      throw error;
    }
  };

  orderChat = async (req, res) => {
    try {
      console.log("entered");
      let data = await this.getOrderCountByMonth(2024);
      const months = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];

      for(let elm of data){
        elm.monthName = months[elm.month-1]
      }
      
      console.log(data);
      res.status(200).send(data);
    } catch (err) {
      console.log(err);
    }
  };
}

module.exports.orderController = new orderController();

// This is your test secret API key.
