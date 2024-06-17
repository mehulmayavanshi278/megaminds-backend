const { categoryService } = require("../Services/services");


class categoryController{
    getCategories = async(req , res)=>{
        try{
          let data = await categoryService.find();
          return res.status(200).send(data);
        }catch(err){
            console.log(err);
        }
    }

    create = async(req , res)=>{
        try{
          let newCategory= req.body;
          let data = await categoryService.create(newCategory);
          return res.status(200).send(data);

        }catch(err){
            console.log(err);
        }
    }


}

module.exports.categoryController = new categoryController();