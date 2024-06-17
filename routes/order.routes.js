const express = require("express");
const { orderController } = require("../controller/order");
const Auth = require("../middlewares/Auth");
const router = express.Router();


router.get('/all' , orderController.getAllOrders);

router.get("/topCustomer" , orderController.getTopCustomer);
router.get("/recentOrder" , orderController.recentOrder);
router.get("/orderChat" , orderController.orderChat);

router.get('/:id' , orderController.getSingleOrder);
router.post("/create-checkout-session", Auth, orderController.create);
router.post("/updateOrder/:id" ,orderController.update);
router.post('/webhook', orderController.webhook);





module.exports.orderRouter = router;
