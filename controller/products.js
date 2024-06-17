const { redis } = require("..");
const { productService } = require("../Services/services");
const { Order } = require("../models/Order.model");
const { Product } = require("../models/Product.model");
const { upload } = require("../startup/multer.startup");
const { userController } = require("./users");

class productController {


  getSingleProduct = async(req , res)=>{
    try{
     const {id} = req.params;
     console.log(id);
     const data = await productService.findById(id);
     return res.status(200).send(data);
    }catch(err){
      console.log(err);
    }
  }
  getProducts = async (req, res) => {
    let filter = {};
    let data;

    req.query.type ? (filter["category"] = { $in: [req.query.type] }) : "";
    req.query.tag ? (filter["tags"] = { $in: [req.query.tag] }) : "";
    req.query.search
      ? (filter["$or"] = [
          { name: { $regex: new RegExp(req.query.search, "i") } },
          { description: { $regex: new RegExp(req.query.search, "i") } },
        ])
      : "";

    req.query.price ? (filter["price"] = { $lt: req.query.price }) : "",
      console.log(filter);

    try {
      if (req.query.id) {
        data = await productService.findById(req?.query?.id);
        return res.status(200).send(data);
      }
      data = await productService.find(filter);
      return res.status(200).send({ data: data, length: data.length });
    } catch (err) {
      console.log(err);
    }
  };


  getRandomProducts = async(req , res)=>{
    try{
       let products = await productService.find();
 
       const max = Math.max(products?.length , products?.length-10);
       const min=max-10;
       console.log("max is" , max)
       console.log("min is" , min)
      console.log(Math.floor(Math.random() * (max - min + 1)) + min)
      const data = products?.slice(min,max);
      return res.status(200).send(data);
    }catch(err){
      console.log(err);
    }
  }

  create = async (req, res) => {
    try {
      let {name , category , price , dummyPrice , description , tags , weight , dimension , vendorName , vendorContact , stock , status } = req.body;

      console.log(req?.files);
      let files = req?.files;
      
      let imageUrls = files?.map(file => file.location);
      const newProductData = {
        name,
        category,
        price,
        dummyPrice,
        description,
        tags,
        additionalInformation:{weight , dimension},
        vendorInfo:{vendorName,vendorContact},
        inventory:{stock, status},
        images:imageUrls
      }
      let newProduct = await productService.create(newProductData);


      return res.status(200).send(newProduct);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  update = async (req, res) => {
    try{
      console.log(req.body);
      console.log(req.files);
      const id = req.params.id;
      let {name , category , price , dummyPrice , description , tags , weight , dimension , vendorName , vendorContact , stock , status , img} = req.body;

      console.log(req?.files);
      let files = req?.files;
      
      let imageUrls = files?.map(file => file.location);

      let images = [];
      if(img){
        images = typeof(img)==='string' ?  [img , ...imageUrls] :  [...img , ...imageUrls];
      }else{
       imageUrls ?  images = [...imageUrls] : null;
      }
      console.log(images)
      const newProductData = {
        name,
        category,
        price,
        dummyPrice,
        description,
        tags,
        additionalInformation:{weight , dimension},
        vendorInfo:{vendorName,vendorContact},
        inventory:{stock, status},
        images:images
      }
      await productService.findByIdAndUpdate(id , newProductData);
      return res.status(200).send({message:"updated successfullt"});
    }catch(err){
      console.log(err);
    }
  };
  delete = async (req, res) => {};




  getTopProducts = async(req , res)=>{
    try{
     let data = await productService.find().sort({sold:-1}).limit(10);
     return res.status(200).send(data);
    }catch(err){
      console.log(err);
    }
  }

  getProductsAdmin = async(req , res)=>{
    try{
      let data={};
      let sold = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalSold: {
              $sum: "$sold"
            }
          }
        },
        {
          $project: {
            _id: 0,
            sum: "$totalSold"
          }
        }
      ])
      data['totalSold'] = sold.length>0 ?  sold[0]['sum'] : 0;

      let totalIncome = await Order.aggregate([
        {
          $match:{
            "status":"confirm",
            "paymentStatus":"paid"
          }
        },
        {
          $group:{
            _id:null,
            totalIncome:{$sum:'$totalPrice'}
          }
        },
        {
          $project: {
            _id: 0,
            sum: "$totalIncome"
          }
        }
      ])
      //  console.log(sold);
      // console.log(totalIncome);
      
      data['totalIncome'] =  totalIncome.length >0  ? totalIncome[0]['sum'] : 0;
      data['ordersPaid'] = totalIncome.length >0 ? totalIncome[0]['sum'] : 0;
   
      // console.log(data);
      return res.status(200).send(data);
    }catch(err){
      console.log(err);
    }
  }
}

module.exports.productController = new productController();
