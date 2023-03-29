const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({


    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true
    },
    is_verified:{
        type:Number,
        required:true,
        default:0
    },
    is_mobileVerified:{
        type:Number,
        required:true,
        default:0
    },
    block:{
        type:Boolean,
        default:false
    },
    token:{
        type:String,
        default:''
    },
    cart:[{
        productId:{
            type:mongoose.Types.ObjectId,
            ref:'Product',
            required:true
        },
        price:{
            type:Number
        },
        qty:{
            type:Number,
            required:true,
            default:0
        },
        productTotalPrice:{
            type:Number,
            required:true
        }
    }],
    cartTotalPrice:{
        type:Number,
        // default:0
    },
    whishlist:[{
        product:{
            type:mongoose.Types.ObjectId,
            ref:"Product",
            required:true
        }
    }],
    wallet:{
        type:Number,
        required:true
    }
})

module.exports= mongoose.model('User',userSchema)