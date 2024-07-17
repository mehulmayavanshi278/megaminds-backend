const mongoose =   require("mongoose");


const replySchema = (
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        reply:{
            type:String
        },
        createdAt:{
            type:Date,
            default:Date.now
        },
        reviewId:{
           type:mongoose.Schema.Types.ObjectId,
            ref:'User' 
        }
    }
)

const reviewSchema = ({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    review:{
        type:String
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reply'
    }],
    createdAt:{
        type:Date,
        default:Date.now
    }
});

const productSchema = mongoose.Schema({
    name:{
        type:String
    },
    category:[],
    price:{
        type:Number
    },
    dummyPrice:{
        type:Number
    },
    description:{
        type:String
    },
    features:[],
    manufacturer:{
        name:{
            type:String
        },
        location:{
            type:String
        }
    },
    dosage:{
        amount:{
            type:Number
        },
        unit:{
            type:String
        }  
    },
    packaging:{
        from:{
            type:String
        },
        quantity:{
            type:Number
        }
    },
    sold:{
      type:Number,
    },
    images:[],
    ratings:{
        avarage:{
            type:Number,
            default:0
        },
        total:{
            type:Number,
            default:0
        },
        count:{
            type:Number,
            default:0
        }
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    tags:[],
    additionalInformation:{
        weight:{
            type:String
        },
        dimension:{
            type:String
        }
    },
    vendorInfo:{
        vendorName:{
            type:String
        },
        vendorContact:{
            type:Number
        }
    },
    inventory:{
        stock:{
            type:Number
        },
        status:{
            type:String,
        }
    },
createdAt: {
    type: Date,
    default: Date.now
}
})

const ratingSchma = mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    rate:{
        type:Number
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports.Product = mongoose.model('Product', productSchema);
module.exports.Review = mongoose.model('Review', reviewSchema);
module.exports.Reply = mongoose.model('Reply', replySchema);
module.exports.Ratings = mongoose.model('Rating', ratingSchma);