const express = require("express");

const Auth = require("../middlewares/Auth");
const { chatController } = require("../controller/Chat");
const router = express.Router();


router.get('/getChatIds' , Auth ,chatController.getAllChatIds);
router.post('/create' , chatController.create)




module.exports.chatRouter = router;
