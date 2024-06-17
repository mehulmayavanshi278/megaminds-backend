const express = require("express");
const { productController } = require("../controller/products");
const upload = require("../startup/multer.startup");


const router = express.Router();


router.get("/getproduct/:id" , productController.getSingleProduct);
router.get("/getProducts", productController.getProducts);
router.get("/getRandomProducts", productController.getRandomProducts);
router.post("/create", upload.array('images',5) ,productController.create);
router.post("/update/:id", upload.array('images', 5) ,productController.update);
router.post("/delete/:id", productController.delete);


// Admin API
router.get("/topproducts" , productController.getTopProducts);
router.get("/getProductsAdmin" , productController.getProductsAdmin);


module.exports.productRouter = router;
