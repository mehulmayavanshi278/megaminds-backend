const { chatService, messageService } = require("../Services/services");
const { Chat } = require("../models/Chat.model");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;


class chatController{
    getAllChatIds = async(req , res)=>{
        try{
        //  const chatIds =  await chatService.find({users:{$in : req.user._id}}).populate({
        //  path:'users'});
        //  console.log(chatIds)
        //  return res.status(200).send(chatIds);
        console.log(req.user._id);
        const chatIds = await Chat.aggregate([
           {
            $match:{
                users: { $in: [new ObjectId(req.user._id)] }      // in aggragation we have to make object id and in find methd automatic it will do 
            }
           },
           {
            $lookup: {
              from: 'messages',
              localField: 'latestMessage',
              foreignField: '_id',
              as: 'latestMessage'
            }
          },
          {
            $unwind: {
              path: '$latestMessage',
              preserveNullAndEmptyArrays: true //  this is used to if some array contains null and empty then it will not give error beacause unwind empty array remove the whole object
            }
          },
           {
            $lookup:{
                from:'users',
                localField:'users',
                foreignField:'_id',
                as:'users'
            }
           },
           {
            $unwind:'$users'
           },
           {
            $match: {
              'users._id': { $ne: new ObjectId(req.user._id) }
            },
           
          },
          {
            $project:{
                'users.password':0,
            }
        },


        
           
        ]);
        // console.log(chatIds);
        return res.status(200).send(chatIds);
        }catch(err){
            console.log(err);
        }
    }


    create = async(req , res)=>{
        try{
         const body = req.body;   
         const newChat =  await chatService.create(body);
         console.log(newChat)
         return res.status(200).send(newChat);
        }catch(err){
            console.log(err);
        }
    }

}




module.exports.chatController = new chatController();

