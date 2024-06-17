const { cartRouter } = require("../routes/cart.routes");
const { categoryRouter } = require("../routes/category.routes");
const { chatRouter } = require("../routes/chat.routes");
const { messageRouter } = require("../routes/message.routes");
const { notificationRouter } = require("../routes/notification.routes");
const { orderRouter } = require("../routes/order.routes");
const { productRouter } = require("../routes/product.routes");

module.exports = (app) => {
  const ErrorHandler = require("../middlewares/errorHandler");
  const express = require("express");
  const { userRouter } = require("../routes/user.routes");

  app.use("/user", userRouter);
  app.use("/product", productRouter);
  app.use("/cart", cartRouter);
  app.use("/order", orderRouter);
  app.use("/category", categoryRouter);
  app.use("/chat", chatRouter);
  app.use("/message", messageRouter);
  app.use("/notification", notificationRouter);

  app.use(ErrorHandler);

  app.get("/", (req, res) => res.send("Welcome megaminds!"));

  app.get("*", (req, res) => {
    res.status(400).send({ error: true, message: "Route not Found" });
  });
};
