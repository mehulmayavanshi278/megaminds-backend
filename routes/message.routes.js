const express = require("express");

const Auth = require("../middlewares/Auth");

const { messageController } = require("../controller/Message");
const router = express.Router();



router.get('/getAllMessage' , Auth ,messageController.getAllMessage);
router.post('/create' , messageController.create)




module.exports.messageRouter = router;
