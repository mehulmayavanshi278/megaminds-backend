const express = require("express");
const { cartController } = require("../controller/cart");
const Auth = require("../middlewares/Auth");

const router = express.Router();

router.get("/getcart", Auth ,cartController.getCartItems);
router.post("/create", Auth ,cartController.create);
router.post("/update", Auth , cartController.updateCart);
router.post("/delete/:id", Auth , cartController.removeCartItem);

module.exports.cartRouter = router;
