const mongoose = require('mongoose');


const chatSchema =  mongoose.Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    latestMessage:{
       type:mongoose.Schema.Types.ObjectId,
       ref:'Message'
    }
});

module.exports.Chat = mongoose.model('Chat', chatSchema);
