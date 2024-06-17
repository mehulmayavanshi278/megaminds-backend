const { messageService } = require("../Services/services");


class messageController{

    getAllMessage= async(req , res)=>{
        const {chatId} = req.query;
        try{
        let message= await messageService.find({chatId});
        return res.status(200).send(message);
        }catch(err){
            console.log(err);
        }
    }
    create= async(req , res)=>{
        const {chatId , senderId , message} = req.body;
        try{
        let newMessage= await messageService.create({chatId , senderId , message});
        return res.status(200).send(newMessage);
        }catch(err){
            console.log(err);
        }
    }

}

module.exports.messageController = new messageController();