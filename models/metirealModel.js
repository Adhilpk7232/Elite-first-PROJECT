const mongoose= require('mongoose')

const materialSchema = new mongoose.Schema({
    materialName:{
        type:String,
        unique:true,
        require:true
    },
    
    image:{
        type:String,
        require:true
    }
})

module.exports =mongoose.model("Material",materialSchema)