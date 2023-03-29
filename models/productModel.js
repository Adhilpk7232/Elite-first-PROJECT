const mongoose = require('mongoose')


const productSchema = new mongoose.Schema({
    // _id:mongoose.Schema.Types.ObjectId,
    product_name:{
        type:String,
        require:true
    },
    image:{
        type:Array,
        require:true
    },
    category:{
        type:mongoose.Types.ObjectId,
        ref:'category',
        require:true
    },
    description:{
        type:String,
        require:true
    },
    stock:{
        type:Boolean,
        require:true
    },
    quantity:{
        type:Number,
        require:true
    },
    price:{
        
        type:Number,
        require:true
    },
    material:{
        type:mongoose.Types.ObjectId,
        ref:'Wood',
        require:true
    },
    list:{
        type:Boolean,
        require:true,
        default:false,
    },
    createdAt:{
        type:Date
    }
})

module.exports=mongoose.model('Product',productSchema)