





const User = require("../models/userModel")
const Category =require('../models/categoryModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const Coupon = require('../models/couponModel')
const Banner = require('../models/bannerModel')
const Material = require('../models/metirealModel')
const fs = require('fs')
const path = require('path')
const ObjectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt')
const { log } = require("console")
const mongoose = require('mongoose')
const { disable } = require("../routes/adminRoute")




const loadOrderlist = async(req,res) => { 
    try{
        const order = await Order.find()
        res.render('admin/order',{order})

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const loadOrderProduct = async (req,res) => { 
    try{
        const orderId = req.query.id
        const orderProduct = await Order.findOne({_id:orderId}).populate({path:'items',populate:{path:'productId',model:'Product'}})
        res.render('admin/orderProductView',{orderProduct})
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const placedOrder  = async(req,res) => { 
    try{
        const orderId = req.query.id
        const update = await Order.updateOne({_id:orderId},{$set:{orderStatus:'placed'}})
        res.redirect('/admin/order')

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const shipedOrder  = async(req,res) => { 
    try{
        const orderId = req.query.id
        const update = await Order.updateOne({_id:orderId},{$set:{orderStatus:'shiped'}})
        res.redirect('/admin/order')

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const deliveredOrder  = async(req,res) => { 
    try{
        const orderId = req.query.id
        const update = await Order.updateOne({_id:orderId},{$set:{orderStatus:'delivered'}})
        res.redirect('/admin/order')

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const orderReturnSuccess  = async(req,res) => { 
    try{
        const orderId = req.query.id
        const update = await Order.updateOne({_id:orderId},{$set:{orderStatus:'return success'}})
        const orderData = await Order.findOne({_id:orderId})
        if(orderData.paymentMethod == 'Online Payment'){
            const refund = await User.updateOne({_id:orderData.userId},{$inc:{wallet:orderData.totalAmount}})
        }
        const itemsData = orderData.items
            for(let i=0;i< itemsData.length;i++){
                const productStock = await Product.updateOne({_id:itemsData[i].productId},{$inc:{quantity:itemsData[i].qty}})
                res.redirect('/admin/order')
            }

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const orderReturnCancelled  = async(req,res) => { 
    try{
        const orderId = req.query.id
        const update = await Order.updateOne({_id:orderId},{$set:{orderStatus:'return cancelled'}})
        res.redirect('/admin/order')

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}

module.exports = {
    loadOrderlist,
    placedOrder,
    shipedOrder,
    deliveredOrder,
    orderReturnSuccess,
    orderReturnCancelled,
    loadOrderProduct,
}