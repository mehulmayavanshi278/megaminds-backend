// const mongoose = require("mongoose");

// const CartSchema = mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Product",
//   },
//   customerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
//   quantity: {
//     type: String,
//   },
//   shippingAddress: {
//     type: String,
//   },
//   country: {
//     type: String,
//   },
//   state: {
//     type: String,
//   },
//   city: {
//     type: String,
//   },
//   pinCode: {
//     type: String,
//   },
// });

// module.exports.Cart = mongoose.model("Cart", CartSchema);



const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    }
});

const cartSchema = new Schema({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    shippingAddress: String,
    country: String,
    state: String,
    city: String,
    pinCode: String
});

module.exports.Cart = mongoose.model('Cart', cartSchema);
