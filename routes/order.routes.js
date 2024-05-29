const express = require("express");
const { orderController } = require("../controller/order");
const Auth = require("../middlewares/Auth");
const router = express.Router();

router.post("/create-checkout-session", Auth, orderController.create);

module.exports.orderRouter = router;
