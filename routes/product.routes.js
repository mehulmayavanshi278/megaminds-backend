const express = require("express");
const { productController } = require("../controller/products");
const upload = require("../startup/multer.startup");
const Auth = require("../middlewares/Auth");


const router = express.Router();


router.get("/getproduct/:id" , productController.getSingleProduct);
router.get("/getProducts", productController.getProducts);
router.get("/getRandomProducts", productController.getRandomProducts);
router.post("/create", upload.array('images',5) ,productController.create);
router.post("/update/:id", upload.array('images', 5) ,productController.update);
router.post("/delete/:id", productController.delete);
router.get("/getSingleRating/:id", Auth ,productController.getSingleRating);
router.post("/giveRating/:id", Auth ,productController.giveRatings);
router.post("/update-ratings",productController.updatRatings);
router.post("/createReview/:id", Auth ,productController.createReview);
router.get("/getReviews/:id" ,productController.getReviews);
router.get("/getReplies/:id" ,productController.getReplies);
router.post("/addReply/:id", Auth , productController.addReply);
router.post("/deleteReview/:id", productController.deleteReview);
router.post("/deleteReply/:reviewId/:id", productController.deleteReply);


// Admin API
router.get("/topproducts" , productController.getTopProducts);
router.get("/getProductsAdmin" , productController.getProductsAdmin);


module.exports.productRouter = router;
