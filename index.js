require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {createServer} = require('http');
const bodyParser = require('body-parser');
// const fileUpload = require('express-fileupload');
const path = require('path');
const mongoose = require('mongoose');
const {Server} = require('socket.io');

const axios = require('axios');

const app = express();
const server = createServer(app);
const io = new Server(server,{
  cors:{
    // origin:"https://megaminds-admin-panel.vercel.app",
    origin:"http://localhost:3000",
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

// EAAPhjBDnUQwBOwpyxVZCxOcKvLOOAyItHnaVmrtgiVKybAXXGT7Ajf3Vjzxhk7mmQ8fJN2C5qhbr5Ww0ZCVMCBqHQuS19z2cZCNGVLS0yFZC0PfrlZCMFDEXmoqZCM4oq3CWUliK0gYFmbi6jguJt5UXnNFxTEritiIgyaNbuod4GzL1wx5IaHEM29IukcIZCeiY0EZCqbdYYuMUKRSpxaKCxz15F37ARDMrin8ZD



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







app.get('/webhook' , async(req,res)=>{
  try{
    console.log("get webookk triggered");
    let mode = req.query['hub.mode'];
    let chalenge = req.query['hub.challenge'];
    let token = req.query["hu.verify_token"];

    const mytoken = 'applemango';
    res.status(200).send(chalenge);
  }catch(err){
    console.log(err);
  }

})

app.post('/webhook', async(req, res) => {
  try {
    console.log("post webhook triggered");
    const body = req.body;
    console.log("body:", body);
    
    // Add a check to make sure body has the expected structure
    if (!body || !body.entry || !body.entry[0] || !body.entry[0].changes || 
        !body.entry[0].changes[0] || !body.entry[0].changes[0].value) {
      console.log("Received invalid webhook payload");
      return res.status(200).send("ok"); // WhatsApp expects 200 OK even for invalid payloads
    }
    
    console.log("messages arr:", body.entry[0].changes[0].value.messages);
    console.log("phone number id:", body.entry[0].changes[0].value.metadata.phone_number_id);
    
    const from_number_id = body.entry[0].changes[0].value.metadata.phone_number_id; // Removed extra parenthesis
    console.log("from:", body.entry[0].changes[0].value.messages[0].from);
    
    const from = body.entry[0].changes[0].value.messages[0].from;
    console.log("msg text:", body.entry[0].changes[0].value.messages[0].text);
    console.log("msg body:", body.entry[0].changes[0].value.messages[0].text.body);

    // Add await for the axios call and proper error handling
   const response =  await axios({
      method: 'post',
      url: `https://graph.facebook.com/v22.0/${from_number_id}/messages`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer EAAPhjBDnUQwBOy7fpid4DpbJVkxbou94O4HXkNy52jWDrbpMdQzO9wZCRAT6SkZCnCbzLH05HBHdZBwfRGvzZCYhPo53TaXtfp0qkzE4sz8xsdS5RBqnaYquzkRKRrdF7dwyMZCSz0L3ZAsQp0biNMUGO9ZCaFPSUOIUTMJ1WRYxDZBJlZCZAWJSNHVoSZBb9p3666Bu89ovEHWp0NGZCqS9H1ZAcvFP8Bst4CAKcBwcZD' // Add your actual token here
      },
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: from,
        type: 'text',
        text: {
          // preview_url: true,
          body: "Hello, How Are You!"
        }
      }
    });

    console.log("response:" , response);
    
    res.status(200).send("ok");
  } catch(err) {
    console.error("Error:", err);
    res.status(200).send("ok"); // Still return 200 to WhatsApp even if there's an error
  }
});

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



  socket.on('call-user' , (data)=>{
    
    const {from , to , offer} = data;
    console.log('call request from' , from , ' to ' , to);
    const recieverSocketId = connectedUsers.get(to);
    if(!recieverSocketId){
      socket.to(from).emit('offline' , {message:'User is Not Online'});
       console.log('user not online');
    }
    // console.log("offer" , offer);
    socket.to(recieverSocketId).emit('incoming-call' , {from , to , offer});
    
  })

  socket.on('call-accepted' , (data)=>{
    const {from , to, answer} = data;
    console.log('call accepted by' , from , ' of ' , to);
    const  senderSocketId = connectedUsers.get(to);
    socket.to(senderSocketId).emit('call-accepted' , {answer});

  })

  socket.on('icecandidate' , (data)=>{
    const {candidate , from ,to} = data;
    const recieverSocketId = connectedUsers.get(to);
    socket.to(recieverSocketId).emit('icecandidate' , {from , candidate})
  })

  socket.on('end-call' , (data)=>{
    const {to} = data;
    console.log("to to" , to);
    const reciepentSocketId = connectedUsers.get(to);

    if(!reciepentSocketId) return;
    socket.to(reciepentSocketId).emit('end-call' , {});
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
