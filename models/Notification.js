const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  title: { type: String,  },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports.Notification = mongoose.model(
  "Notification",
  notificationSchema
);
