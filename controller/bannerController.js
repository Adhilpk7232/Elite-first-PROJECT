

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
const loadOfferBanner = async(req,res) => {
    try{
        const banner =await Banner.find()
        res.render('admin/OfferBanner',{banner})

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
 }
 const insertBanner = async(req,res) => { 
    try{
        const filename=req.file.filename
        const bannerData = new Banner({
            offerName:req.body.offername,
            subTitle:req.body.subTitle,
            description:req.body.description,
            bannerImage:filename,
        })
        const result =await bannerData.save()
        if(result){
            res.redirect('/admin/offer-banner')
        }else{
            console.log("not save banner");
        }

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
 }
 const editBanner = async(req,res) => {
    try{
        const bannerId  = req.query.id
        const banner  = await Banner.findOne({_id:bannerId})
        res.render('admin/edit-banner',{banner})
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
 }
 const updateBanner = async(req,res) => { 
    try{
        const bannerId = req.query.id
        const filename=req.file.filename
        const bannerData = await Banner.updateOne({_id:bannerId},{$set:{
            offerName:req.body.offername,
            subTitle:req.body.subTitle,
            description:req.body.description,
            bannerImage:filename,
        }})
        if(bannerData){
            res.redirect('/admin/offer-banner')
        }

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
 }
 const deleteBanner = async(req,res) => { 
    try{
        const id = req.body.bannerId
        const bannerData = await Banner.findOne({_id:id},{status:1,_id:id})
        if(bannerData.status == false){
            const wait = await Banner.updateOne({_id:id},{$set:{status:true}})
            
            res.json({success:true})
        }else{
            const wait = await Banner.updateOne({_id:id},{$set:{status:false}})
            
            res.json({success:true})

        }
        

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
 }
 module.exports ={
    loadOfferBanner,
    insertBanner,
    editBanner,
    updateBanner,
    deleteBanner,
 }