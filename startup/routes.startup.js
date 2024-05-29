const { cartRouter } = require("../routes/cart.routes");
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

  app.use(ErrorHandler);

  app.get("/", (req, res) => res.send("Welcome megaminds!"));

  app.get("*", (req, res) => {
    res.status(400).send({ error: true, message: "Route not Found" });
  });
};
