const express =  require('express');
const { categoryController } = require('../controller/category');
const router =  express.Router();

router.get("/" , categoryController.getCategories);
router.post("/create" , categoryController.create);



module.exports.categoryRouter = router;