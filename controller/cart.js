// const { default: mongoose } = require("mongoose");
// const { cartServices, userServices } = require("../Services/services");
// const { Cart } = require("../models/Cart.model");

const { default: mongoose } = require("mongoose");
const { cartServices } = require("../Services/services");
const { Cart } = require("../models/Cart.model");

// class cartController {
//   getCartItems = async (req, res) => {
//     const { customerId } = req.query;
//     try {
//       const user = await userServices.findById(customerId).populate("cart");
//       const cartProductIds = user.cart?.map((elm) => elm.productId);
//       let products = await Cart.aggregate([
//         {
//           $match: {
//             productId: { $in: cartProductIds },
//           },
//         },
//         {
//           $lookup: {
//             from: "products",
//             localField: "productId",
//             foreignField: "_id",
//             as: "productDetails",
//           },
//         },
//         { $unwind: "$productDetails" },
//         {
//           $project: {
//             _id: 0,
//           },
//         },
//       ]);
//       console.log(products);
//       return res.status(200).send(products);
//     } catch (err) {
//       console.log(err);
//     }
//   };
//   create = async (req, res) => {
//     try {
//       const body = req.body;
//       const { customerId } = req.query;
//       let isExistInCart = await cartServices.findOne({
//         customerId,
//         productId: req?.body?.productId,
//       });
//       console.log(isExistInCart);
//       if (isExistInCart) {
//         return res.status(200).send({ message: "Already in Cart" });
//       }

//       body["customerId"] = customerId;
//       console.log(body);
//       let data = await cartServices.create(body);
//       await userServices.findByIdAndUpdate(customerId, {
//         $push: { cart: data._id },
//       });
//       return res.status(200).send(data);
//     } catch (err) {
//       console.log(err);
//     }
//   };
//   update = async (req, res) => {};
//   delete = async (req, res) => {
//     const { customerId } = req.query;
//     let { id } = req.params;
//     id = new mongoose.Types.ObjectId(id);

//     try {
//       await userServices.findByIdAndUpdate(customerId, { $pull: { cart: id } });
//       await cartServices.findByIdAndDelete(id);
//       return res.status(200).send({ message: "Deleted successfully" });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).send({ error: "Internal Server Error" });
//     }
//   };
// }

// module.exports.cartController = new cartController();

// Update the path as necessary

// Retrieve cart items for a customer

class cartController {
  getCartItems = async (req, res) => {
    const customerId = req.user._id;
    try {
      const cart = await Cart.findOne({ customerId }).populate({
        path: "items.productId",
        model: "Product",
      });

      if (!cart) {
        return res.status(400).send({ message: "Cart not found" });
      }
      console.log(cart);
      const cartItems = cart.items.map((item) => ({
        productDetails: item.productId,
        quantity: item.quantity,
        _id: item._id,
      }));

      return res.status(200).send(cartItems);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .send({ error: "An error occurred while retrieving the cart items" });
    }
  };

  create = async (req, res) => {
    const customerId = req.user._id;
    const { productId } = req.body;
    console.log(productId)
    try {
      const checkCart = await cartServices.findOne({ customerId });
      const itemExists = checkCart.items.some(
        (cartItem) => cartItem.productId.toString() === productId
      );

      if (!itemExists) {
        checkCart.items.push({ productId, quantity: 1 });
        await checkCart.save();
        return res.status(200).send({ cartItems: checkCart.items });
      } else {
        return res.status(201).send("item already added");
      }
    } catch (err) {
      console.log();
    }
  };

  updateCart = async (req, res) => {
    const customerId = req.params.customerId || req.user._id;
    const { items } = req.body;
    try {
      const cart = await Cart.findOneAndUpdate(
        { customerId },
        { items },
        { new: true }
      );

      if (!cart) {
        return res.status(400).send({ message: "Cart not found" });
      }

      return res
        .status(200)
        .send({ message: "Cart updated successfully", cart });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .send({ error: "An error occurred while updating the cart" });
    }
  };

  removeCartItem = async (req, res) => {
    const cartId = req.params.id;
    console.log(cartId);
    const customerId = req.user._id;
    try {
      let cart = await Cart.findOne({ customerId });
      if (!cart) {
        return res.status(400).send({ message: "Cart not found" });
      }

      cart.items.pull({ _id: new mongoose.Types.ObjectId(cartId) });
      await cart.save();
      cart = await cart.populate({
        path: "items.productId",
        model: "Product",
      });
      console.log(cart);
      const cartItems = cart.items.map((item) => ({
        productDetails: item.productId,
        quantity: item.quantity,
        _id: item._id,
      }));

      return res.status(200).send(cartItems);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .send({
          error: "An error occurred while removing the item from the cart",
        });
    }
  };
}

module.exports.cartController = new cartController();
