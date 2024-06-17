const mongoose =   require("mongoose");

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
            type:Number
        },
        total:{
            type:Number
        }
    },
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

module.exports.Product = mongoose.model('Product', productSchema);