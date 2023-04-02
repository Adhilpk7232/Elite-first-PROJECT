const mongoose = require('mongoose')

const offerSchema = mongoose.Schema({
    offerPercentage:{
        type:Number,
        required:true
    },
    offerItem:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }
})

module.exports = mongoose.model('Offer',offerSchema)