




const Razorpay = require('razorpay');
const User = require("../models/userModel")
const Category =require('../models/categoryModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const Coupon = require('../models/couponModel')
const Address = require('../models/addressModel')
const Banner = require('../models/bannerModel')
const Material = require('../models/metirealModel')
const fs = require('fs')
const path = require('path')
const ObjectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt')
const { log } = require("console")
const mongoose = require('mongoose')
const { disable } = require("../routes/adminRoute")



// USER SIDE 
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
// user side 
const loadOrderHistory = async(req,res) => { 
    try{
        const userId = req.session.user_id
        const userData = await User.findOne({_id:userId})
        const orderData = await Order.find({userId:userId})
        res.render('users/profileOrder',{orderData,userData})

    }catch(error){
        res.render('uses/500')
        console.log(error.message);
    }
}
const orderList = async (req,res) => { 
    try{
        const id = req.session.user_id
        const orders = await Order.find({userId:id}).populate({path:'items',populate:{path:'productId',model:'Product'}})
        res.render('users/orderList',{orders})
    }catch(error){
        res.render('uses/500')
        console.log(error.message);
    }
}
const orderedProducts = async(req,res) => { 
     try{
        const orderId  =req.query.id
        const orderProduct = await Order.findOne({_id:orderId}).populate({path:'items',populate:{path:'productId',model:'Product'}})
        res.render('users/orderedProductView',{orderProduct})

     }catch(error){
        res.render('uses/500')
        console.log(error.message);
     }
}
const cancelOrder =  async(req,res) => { 
     try{
        const orderId = req.query.id
        const order = await Order.findById(orderId)
        if(order.paymentMethod == "Online Payment" && order.orderStatus == 'placed'){
            const refund = await User.findOneAndUpdate({_id:order.userId},{$inc:{wallet:order.totalAmount}})
            order.orderStatus = 'cancelled'
            order.save()
            const itemsData = order.items
            for(let i=0;i< itemsData.length;i++){
                const productStock = await Product.updateOne({_id:itemsData[i].productId},{$inc:{quantity:itemsData[i].qty}})
                res.redirect('/profile-order')
            }
            
        }else{
            order.orderStatus = 'cancelled'
            order.save()
            const itemsData = order.items
            for(let i=0;i< itemsData.length;i++){
                const productStock = await Product.updateOne({_id:itemsData[i].productId},{$inc:{quantity:itemsData[i].qty}})
                res.redirect('/profile-order')
            }
            res.redirect('/profile-order')
        }
     }catch(error){
        res.render('uses/500')
        console.log(error.message);
     }
}
const returnOrder =  async(req,res) => { 
    try{
       const orderId = req.query.id
       const order = await Order.findById(orderId)
       order.orderStatus = 'return requested'
       order.save()
       res.redirect('/profile-order')

    }catch(error){
        res.render('uses/500')
       console.log(error.message);
    }
}
const loadCheckout = async(req,res) => {
    try{
        const userId = req.session.user_id
        const userData = await User.findOne({_id:userId}).populate('cart.productId').exec()
        const addressData = await Address.findOne({userId:userId})
        res.render('users/checkout',{userData,addressData})

    }catch(error){
        res.render('uses/500')
        console.log(error.message);
    }

}



const placeOrder = async(req,res) => {
    try{
        const userId = req.session.user_id
        const index = req.body.address
        const discount = req.body.couponDiscount
        const totel = req.body.total1
        const coupon = req.body.couponC
        console.log(coupon);
        if(coupon){
        const couponUpdate = await Coupon.updateOne({couponCode:coupon},{$push:{used:userId}},{$inc:{limit:-1}}) 
        console.log(couponUpdate,"c");    
        }
        const address= await Address.findOne({userId:userId})
        const userAddress = address.userAddresses[index]
        const cartData = await User.findOne({_id:userId}).populate('cart.productId')
        const total = cartData.cartTotalPrice
        const payment = req.body.payment
        let status  =payment === 'COD'?'placed':'pending'
        let orderObj = { 
            userId:userId,
            address:{
                fullName:userAddress.fullname,
                mobileNumber:userAddress.mobileNumber,
                pincode:userAddress.pincode,
                houseAddress:userAddress.houseAddress,
                streetAddress:userAddress.streetAddress,
                landMark:userAddress.landMark,
                cityName:userAddress.cityName,
                state:userAddress.state
            },
            paymentMethod:payment,
            orderStatus:status,
            items:cartData.cart,
            totalAmount:total,
            discount:discount
        }
         await Order.create(orderObj)
        .then(async(data) => {
            const orderId = data._id.toString()
            if(payment == 'COD'){
                const userData = await User.findOne({_id:userId})
                const cartData = userData.cart
                for(let i=0;i<cartData.length;i++){
                    const productStock = await Product.findById(cartData[i].productId)
                    productStock.quantity -= cartData[i].qty
                    await productStock.save()
                }
                await User.updateOne({_id:userId},{$set:{cart:[],cartTotalPrice:0}})
                res.json({status:true})
            }else if(payment == 'WALLET'){

                const userData = await User.findOne({_id:userId})
                if(userData.wallet >= total){
                    const cartData = userData.cart
                for(let i=0;i<cartData.length;i++){
                    const productStock = await Product.findById(cartData[i].productId)
                    productStock.quantity -= cartData[i].qty
                    await productStock.save()
                }
                const walletBalance = userData.wallet - userData.cartTotalPrice ;
                await User.updateOne({_id:userId},{$set:{wallet:walletBalance,cart:[],cartTotalPrice:0}})
                await Order.updateOne({_id:orderId},{$set:{paymentMethod:'Wallet',orderStatus:'placed'}})
                res.json({status:true})

                }else{
                    res.json({walletBalance:true})
                }
            }else{
                var instance = new Razorpay({
                    key_id: process.env.KEY_ID,
                    key_secret: process.env.KEY_SECRET,
                })
                let amount  = total
                instance.orders.create({
                    amount:amount*100,
                    currency:"INR",
                    receipt:orderId,
                },(err,order) => {
                    console.log(order);
                    res.json({status:false,order})
                })
            }
        })

    }catch(error){
        res.render('uses/500')
        console.log(error.message);
    }
}
const verifyPayment = async(req,res)=>{
    try{
        const userId = req.session.user_id
            const details = req.body
            let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET);
            hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
            hmac = hmac.digest('hex')   
            const orderId = details.order.receipt
            if (hmac == details.payment.razorpay_signature) {
                const userData = await User.findOne({_id:userId})
                const cartData = userData.cart
                console.log(cartData);
                for(let i=0;i<cartData.length;i++){
                    const productStock = await Product.findById(cartData[i].productId)
                    productStock.quantity -= cartData[i].qty
                    await productStock.save()
                }
                await User.updateOne({_id:userId},{$set:{cart:[],cartTotalPrice:0}})
                await Order.findByIdAndUpdate(orderId, { $set: { orderStatus: 'placed' } }).then((data) => {
                    res.json({ status: true, data })
                }).catch((err) => {
                    console.log(err);
                    res.data({ status: false, err })
                })   
            } else {
                res.json({ status: false })
                console.log('payment failed');
            }
    }catch(error){
        res.render('uses/500')
        console.log(error.message);
    }
}
const orderSuccess = async(req,res) => {
    try{
        const userId = req.session.user_id
        const userData = await User.findOne({_id:userId})
        const catrData  = await User.findOne({_id:userId})
        const orderData = await Order.findOne({userId:userId}).populate({path:'items',populate:{path:'productId',model:'Product'}}).sort({createdAt:-1}).limit(1)
        res.render('users/orderSuccess',{orderData})
    }catch(error){
        res.render('uses/500')
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
    loadCheckout,
    placeOrder,
    verifyPayment,
    orderSuccess,
    loadOrderHistory,
    orderList,
    orderedProducts,
    cancelOrder,
    returnOrder,
}
