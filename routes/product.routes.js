const express = require("express");
const { productController } = require("../controller/products");

const router = express.Router();

router.get("/getProducts", productController.getProducts);
router.post("/create", productController.create);
router.post("/update/:id", productController.update);
router.post("/delete/:id", productController.delete);

module.exports.productRouter = router;
