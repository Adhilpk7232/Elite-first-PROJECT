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


const securePassword = async (password) => {
    try{
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    }catch (error){
        console.log(error.message)

    }
}     

const loadLogin= async (req,res)=>{
    try{
        res.render('admin/login')
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}

const verifyLogin = async (req,res)=>{
    try{
        const email=req.body.email
        const password=req.body.password;
        const userData=await User.findOne({email:email})
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                if(userData.is_admin === 0){
                    res.render('admin/login',{message:"Email and Password Is Inccorect"})
                }else{
                    req.session.admin_id = userData._id
                    res.redirect('/admin/home')
                }
            }else{
                res.render('admin/login',{message:"Email and Password is Inccorect"})
            }
        }else{
            res.render('admin/login',{message:"Email and Password is Inccorect"})
        }

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const adminLogout = async(req,res) => { 
    try{
        req.session.admin_id=null
        res.redirect('/admin');
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}

const loadDashboard = async (req,res)=>{
    try{
        const salesCount = await Order.find({}).count()
        const users = await User.find({}).count()
        const online = await Order.find({paymentMethod:'Online Payment'}).count()
        const cod = await Order.find({paymentMethod:'COD'}).count()
        const wallet = await Order.find({paymentMethod:'WALLET'}).count()
        const ord = await Order.find().populate({path:'items',populate:{path:'productId',model:'Product',populate:{path:'category'}}})
        const categoryCount  = {};
        ord.forEach(order => { 
            order.items.forEach(product => { 
                const category = product.productId.category.categoryName
                if(category in categoryCount){
                    categoryCount[category] += 1
                }else{
                    categoryCount[category] = 1
                }
            })
        })
        const sortedCategoryCount  = Object.entries(categoryCount).sort((a,b) => b[1]-a[1])
        const numbersOnly  = sortedCategoryCount.map(innerArray => innerArray[1])
        const categoryNames = sortedCategoryCount.map((categoryCount) => { 
            return categoryCount[0]
        })
        const weeklyRevenueOf = await Order.aggregate([
            {
                $match:{
                    date:{
                        $gte:new Date(new Date().setDate(new Date().getDate()-7))
                    },orderStatus:{
                        $eq:'delivered'
                    }
                }
            },
            {
                $group:{
                    _id:null,
                    Revenue:{$sum:'$totalAmount'}
                }
            }
        ]);
        const weeklyRevenue = weeklyRevenueOf.map((item) => {
            return item.Revenue
        });
        const weeklySales = await Order.aggregate([
            {
                $match:{
                    orderStatus:{
                        $eq:'delivered'
                    }
                }
            },
            {
                $group:{
                    _id:
                        { $dateToString:{ format : "%d-%m-%Y", date: "$date"}},
                    sales:{$sum:"$totalAmount"}
                }
            },
            {
                $sort:{_id:1}
            },
            {
                $limit:7
            },
            
        ])
        const date = weeklySales.map((item) => { 
            return item._id
        })
        const Sales = weeklySales.map((item) => { 
            return item.sales
        })
        res.render('admin/home',{
            salesCount:salesCount,
            userCount:users,
            weeklyRevenue:weeklyRevenue,
            upi:online,cash:cod,wallet:wallet,
            weeklySale:weeklySales,
            date:date,
            Sales:Sales,
            categoryName:categoryNames,
            categorySaleCount:numbersOnly
        })
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const loadUserManagement = async(req,res)=>{
    try{
        const userData = await User.find({is_admin:0})
        res.render('admin/userManagement',{users:userData})

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const blockUser = async(req,res)=>{
    try{
        const id = req.body.userId
        const userData = await User.findOne({_id:id})
        if(userData.block == false){
            const wait = await User.updateOne({_id:id},{$set:{block:true}})
            req.session.user_id=false
            res.json({success:true})
        }else{
            const wait = await User.updateOne({_id:id},{$set:{block:false}})
            req.session.user_id=true
            res.json({success:true})

        }
        

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}

 const loadSales =  (req,res) => {
    try{
        res.render('admin/salesReport')
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
 }
 const listSalesReport = async(req,res) => { 
    try{
        const currentDate = new Date(req.body.to);
        console.log(currentDate);
        const newDate = new Date(currentDate)
        console.log(newDate);
        newDate.setDate(currentDate.getDate() + 1)     
        if(req.body.from.trim() == '' ||req.body.to.trim() == ''){
            res.render('admin/salesReport',{message:'all field required'})
        }else{
            const saleData = await Order.find({
                orderStatus:'delivered',
                date:{ $gte:new Date(req.body.from), $lte:new Date(newDate)}
                
            })
            .populate({path:'items',populate:{path:'productId',model:'Product'}})
            res.render('admin/listSalesReport',{saleData})
        }

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
 }
module.exports={
    loadLogin,
    verifyLogin,
    loadDashboard,
    loadUserManagement,
    blockUser,
    loadSales,
    listSalesReport,
    adminLogout
}    