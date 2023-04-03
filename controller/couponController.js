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



const loadcoupon = async(req,res) => {
    try{
        const couponsData  = await Coupon.find({disable:false})
        res.render('admin/coupon',{couponsData})

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const addCoupon = async(req,res) => { 
    try{
        const couponData = {...req.body}
        const couponAdd = new Coupon({
            couponCode: couponData.coupon_code,
            couponAmountType: couponData.fixedandpercentage,
            couponAmount: couponData.couponamount,
            minRedeemAmount: couponData.radeemamount,
            minCartAmount: couponData.cartamount,
            startDate:couponData.startdate,
            expiryDate: couponData.expirydate,
            limit: couponData.usagelimit,
        })
        const insert  = await couponAdd.save()
        res.redirect('/admin/coupon')

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const editCoupon = async(req,res) => { 
    try{
        const couponId = req.params.id
        const couponData = await Coupon.findOne({_id:couponId})
        res.render('admin/editCoupon',{couponData})

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const updateCoupon = async(req,res) => { 
    try{
        const couponId = req.params.id
        const update = await Coupon.updateOne({_id:couponId},{$set:{
            couponCode: req.body.coupon_code,
            couponAmountType: req.body.fixedandpercentage,
            couponAmount: req.body.couponamount,
            minRedeemAmount: req.body.radeemamount,
            minCartAmount: req.body.cartamount,
            startDate:req.body.startdate,
            expiryDate: req.body.expirydate,
            limit: req.body.usagelimit,
        }})
        res.redirect('/admin/coupon')
        

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const DeleteCoupon = async(req,res) => { 
    try{
        const couponId = req.params.id
        const update = await Coupon.updateOne({_id:couponId},{$set:{disable:true}})
        res.redirect('/admin/coupon')

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
module.exports ={
    loadcoupon,
    addCoupon,
    editCoupon,
    updateCoupon,
    DeleteCoupon,
}