const express = require("express");
const { userController } = require("../controller/users");
const upload = require("../startup/multer.startup");
const router = express.Router();
const Auth = require("../middlewares/Auth");

router.get("/getuser/:id", Auth, userController.getUsers);  //for Admin
router.get("/getuser", Auth, userController.getUsers);
router.post("/create", userController.create);
router.post("/login", userController.login);
router.post("/loginWithGoogle" , userController.loginWithGoogle);
router.post("/loginWithGoogle" , userController.loginWithGoogle);
router.post("/update", Auth ,userController.update);
router.post("/delete/:id", userController.delete);

module.exports.userRouter = router;
