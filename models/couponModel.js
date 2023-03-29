const mongoose  = require('mongoose')

const couponSchema = new mongoose.Schema({
    couponCode : {
        type:String,
        required:true
    },
    couponAmountType:{
        type:String,
        required:true
    },
    couponAmount:{
        type:Number,
        required:true
    },
    minCartAmount:{
        type:Number
    },
    minRedeemAmount:{
        type:Number,
        requied:true
    },
    startDate:{
        type:Date
    },
    expiryDate:{
        type:Date
    },
    limit:{
        type:Number,
        required:true
    },
    used:{
        type:Array
    },
    disable:{
        type:Boolean,
        default:false,
    }
},{timestamps:true})


module.exports = mongoose.model('Coupon',couponSchema)
