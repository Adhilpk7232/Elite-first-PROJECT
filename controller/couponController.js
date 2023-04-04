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


// ADMIN SIDE 
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

// USER SIDE  
const couponApply = async (req, res) => {
    try {
        const userId = req.session.user_id
        const user = await User.findOne({ _id:userId });
        let cartTotal = user.cartTotalPrice;
    const exist = await Coupon.findOne(
        { couponCode: req.body.code, used: userId },
        { used: { $elemMatch: { $eq: userId } } }
      );
      if (exist) {
        console.log("ubhayokichu");
        return res.json({ used: true });
      } else {
        const couponData = await Coupon.findOne({ couponCode: req.body.code });
        if (couponData) {
          if (couponData.expiryDate >= new Date()) {
            if (couponData.limit !== 0) {
              if (couponData.minCartAmount <= cartTotal) {
                if (couponData.couponAmountType === "fixed") {
                  let discountValue = couponData.couponAmount;
                  let value = Math.round(cartTotal - couponData.couponAmount);
                  return res.json({
                    amountokey: true,
                    value,
                    discountValue,
                    code: req.body.code,
                  });
                } else if (couponData.couponAmountType === "percentage") {
                  const discountPercentage = (cartTotal * couponData.couponAmount) / 100;
                  if (discountPercentage >= couponData.minRedeemAmount) {
                    let discountValue = discountPercentage;
                    let value = Math.round(cartTotal - discountPercentage);
                    return res.json({
                      amountokey: true,
                      value,
                      discountValue,
                      code: req.body.code,
                    });
                  } else {
                    let discountValue = couponData.minRedeemAmount;
                    let value = Math.round(cartTotal - couponData.minRedeemAmount);
                    return res.json({
                      amountokey: true,
                      value,
                      discountValue,
                      code: req.body.code,
                    });
                  }
                }
              } else {
                res.json({ minimum: true });
              }
            } else {
              res.json({ limit: true });
            }
          } else {
            res.json({ datefailed: true });
          }
        } else {
          res.json({ invalid: true });
        }
      }
    } catch (error) {
        res.render('uses/500')
      console.log(error.message);
    }
  };


module.exports ={
    loadcoupon,
    addCoupon,
    editCoupon,
    updateCoupon,
    DeleteCoupon,
    couponApply,
}