const mongoose = require('mongoose')

const path = require("path")
const User =require('./models/userModel')
const config = require('./config/config')
config.mongooseconnection()
const express = require("express")
const app = express()
 require('dotenv').config()

const { dirname } = require('path')

/// admin connetion of js,css etc
app.use(express.static(path.join(__dirname,'public')))

///for user route

const userRoute = require('./routes/userRoute')
app.use('/',userRoute)
const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)
const { sessionSecret } = require('./config/config')
require('dotenv').config()
app.listen(3000,function(){
    console.log("server is running on 3000");
})

module.exports ={
    app
}