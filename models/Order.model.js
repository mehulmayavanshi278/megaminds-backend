const mongoose = require("mongoose");

const Orderschema = mongoose.Schema({
    customerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product' 
    },
    status:{
        type: String,
    },
    paymentStatus:{
        type: String
    },
    orderDate:{
        type: Date,
        default: Date.now // Removed function invocation
    },
    deliveryDate:{
        type: Date,
    },
});

module.exports.Order = mongoose.model("Order", Orderschema)