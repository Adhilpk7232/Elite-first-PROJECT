const express = require("express")
const app = express()
const session = require('express-session')
const mongoose = require('mongoose')
const path = require("path")
const config = require('./config/config')
const cookieparser = require('cookie-parser')
const { dirname } = require('path')
const adminRoute = require('./routes/adminRoute')
const userRoute = require('./routes/userRoute')
const nocache = require('nocache')

require('dotenv').config()
config.mongooseconnection()

app.set('views')
app.set('view engine','ejs')
app.set(cookieparser())
app.use(express.static(path.join(__dirname,'public')))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// session management 
app.use(session({secret:config.sessionSecret,
    saveUninitialized:true,
    cookie:{maxAge:60000*1000},
    resave:false    
}))
// remove cache 
app.use(nocache())
///for user route
app.use('/',userRoute)
app.use('/admin',adminRoute)

app.use((req,res)=>{
    res.status(404).render("404")
})
app.listen(3000,function(){
    console.log("server is running on 3000");
})

module.exports ={
    app
}