const mongoose = require('mongoose')

const bannerShema = new mongoose.Schema({
    
    bannerImage:{
        type:String,
        require:true
    },
    subTitle:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    offerName:{
        type:String,
        require:true
    },
    status:{
        type:Boolean,
        default:true
    }
})
module.exports = mongoose.model('banner',bannerShema)