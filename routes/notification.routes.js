const express = require('express');
const Auth = require('../middlewares/Auth');
const { notificationController } = require('../controller/notification');
const router = express.Router();


router.get("/get" , Auth , notificationController.get);
router.post("/create" , Auth , notificationController.create);
router.post("/update" , Auth , notificationController.update);

module.exports.notificationRouter = router;