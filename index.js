require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {createServer} = require('http');
const bodyParser = require('body-parser');
// const fileUpload = require('express-fileupload');
const path = require('path');
const mongoose = require('mongoose');
const {Server} = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server,{
  cors:{
    origin:"https://megaminds-admin-panel.vercel.app",
    methods:['get' , 'post'],
    credentials:true
  }
});

const tempUploadDirectory = "/var/task/tmp";
// if (!fs.existsSync(tempUploadDirectory)) {
//   fs.mkdirSync(tempUploadDirectory);
// }

// Create directory if it doesn't exist

// app.use(express.static(path.join(__dirname,"/public/Images")));
app.use(express.static("public"));
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials:true
  })
);
app.options("*", cors());

// app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: tempUploadDirectory,
//   })
// );









require("./startup/index.startup")(app , server);
// const Redis = require("ioredis");
const { Chat } = require('./models/Chat.model');
const { chatService, notificationService, userServices } = require('./Services/services');
const { Message } = require('./models/Message.model');
// const redis = new Redis({
//   password: "n0RixKwGVyYjGnhs2D2Lr730w0bKqv4c",
//   host: "redis-16246.c91.us-east-1-3.ec2.redns.redis-cloud.com",
//   port: 16246,
// });


const connectedUsers = new Map();
const connectedUsersOnChatPage = new Map();

io.on('connection', (socket) => {
  console.log('a user connected' , socket.id);

  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  socket.on('cameOnChat' , async(userId)=>{
    connectedUsersOnChatPage.set(userId, socket.id);
    console.log(`User ${userId} came on Chat with socket ID ${socket.id}`);
  })
  socket.on('cameOutOfChat' , async(userId)=>{
    for (let [userId, socketId] of connectedUsersOnChatPage.entries()) {
      if (socketId === socket.id) {
        connectedUsersOnChatPage.delete(userId);
        console.log(`User ${userId} disconnected from chat`);
        break;
      }
    }
  })

  socket.on('joinChat', async (data) => {
    const { senderId, message, chatId, receiverId } = data;
    console.log("New Chat join", senderId);
    let chat;
    
    if (!chatId) {
        chat = new Chat({ users: [senderId, receiverId] });
        await chat.save();
    } else {
        chat = await Chat.findById(chatId);
    }

    


    if (chat) {
        socket.join(chat._id.toString());
    } else {
        console.error("Chat not found or could not be created.");
    }
});




  socket.on('newMessage', async(data)=>{
     try{
      const {chatId , receiverId ,senderId , message} = data;
      const newMessage = await Message.create({chatId,senderId,message});
      await newMessage.save();
       await Chat.findByIdAndUpdate(chatId , {latestMessage:newMessage});
      console.log("new message is" , newMessage);
      console.log(receiverId);
      const receiverSocketId = connectedUsersOnChatPage.get(receiverId);
      console.log("connected on chat page", connectedUsersOnChatPage)
      console.log("connected on register", connectedUsers)
      if (!receiverSocketId) {
        console.log('user is InActive')
        let object = {
          userId:receiverId,
          senderId,
          title:"new Message",
          message
        }
        const receiverSocketId = connectedUsers.get(receiverId);
        console.log('reciever id is ' , receiverSocketId)
        // await notificationService.create(object);
        let user = await userServices.findById(senderId);
        object['name'] = user?.firstName+" "+user?.lastName;
        io.to(receiverSocketId).emit('new notification' , object);
        
      } else {
        console.log('user is Active')
      }
      io.emit('newMessage' , newMessage); 
     }catch(err){
      console.log(err);
     }
  })


  socket.on('disconnect', () => {
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} from register disconnected`);
        break;
      }
    }   
  });
});
// module.exports.redis = redis;
module.exports.io=io;
