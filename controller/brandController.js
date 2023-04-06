
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
const loadBrand  = async (req,res) => {
    try{
        const materialData =await Material.find({})
        res.render('admin/brandManagement',{materialData})

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const addBrand  = async (req,res) => {
    try{
        res.render('admin/addBrand')

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const insertBrand  = async (req,res) => {
    try{
        if(req.body.name =='' ){
            res.render('admin/addBrand',{message:'fill all field'})
        }else{
        const cat = req.body.name
        const catUP = cat.toUpperCase()
        let exist = await Material.findOne({materialName:catUP})
        if(exist){
            res.render('admin/addBrand',{message:'This Category already Exist'})
            exist=null
        }else{
            const filename=req.file.filename
            let material = {
                materialName:catUP,
                image:filename
            }
            const materialData =await Material.create(material)
            if(materialData){
                res.render('admin/addBrand',{message2:'type insert successfully'})
            }else{
                
                res.render('admin/addBrand',{message:'type did not inserted'})
            }
        }
    }

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const loadEditBrand  = async (req,res) => {
    try{
        const id =req.query.id
        const materialData = await Material.findById({_id:id})
        if(materialData){
            res.render('admin/updateBrand',{category:materialData})
        }else{
            res.render('admin/brandManagement')
        }

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const UpdatedBrand  = async (req,res) => {
    try{
        const cat =req.body.categoryName
        const catUP= cat.toUpperCase()
        const UpdatedCategory=await Material.findByIdAndUpdate({_id:req.body.id},{$set:{categoryName:catUP,description:req.body.description}})
        if(UpdatedCategory){
            res.redirect('/admin/brand')
        }

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const deleteBrand  = async (req,res) => {
    try{
        const id = req.body.brandId
        await Material.deleteOne({_id:id})
        res.json({success:true})

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}

module.exports = {
    loadBrand,
    addBrand,
    insertBrand,
    loadEditBrand,
    UpdatedBrand,
    deleteBrand,
}
