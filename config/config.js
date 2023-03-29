const sessionSecret = "mysessionsecertajfuipehoanl"
require('dotenv').config()
const mongoose = require('mongoose')
function mongooseconnection(){
    mongoose.set('strictQuery',true)
    mongoose.connect(process.env.MONGOOSE_CONNECTION)
}

module.exports = {
    sessionSecret,
    mongooseconnection
    
}