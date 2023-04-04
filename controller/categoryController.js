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
const loadCategory = async(req,res)=>{
    try{
        const categoryData =await Category.find({})
        res.render('admin/categoryManagement',{categoryData})

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const AddCategorry =(req,res)=>{
    try{
        res.render('addCategory')
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const insertCategory = async (req,res)=>{
    try{
        if(req.body.categoryName=='' || req.body.description==''){
            res.render('admin/addCategory',{message:'fill all field'})

        }else{
        const cat = req.body.categoryName
        const catUP = cat.toUpperCase()
        let exist = await Category.findOne({categoryName:catUP})
        if(exist){
            res.render('admin/addCategory',{message:'This Category already Exist'})
            exist=null
        }else{
            const filename=req.file.filename
            const category = new Category({
                categoryName:catUP,
                description:req.body.description,
                image:req.file.filename
            })
            const categoryData = await category.save()
            if(categoryData){
                res.render('admin/addCategory',{message2:'category insert successfully'})
            }else{
                res.render('admin/addCategory',{message:'category did not inserted'})
            }
        }
    }
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const DeleteCategory = async (req,res)=>{
    try{
        const id = req.query.id
        await Category.deleteOne({_id:id})
        res.redirect('/admin/category')
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const UpdateCategory = async(req,res)=>{
    try{
        const id =req.query.id
        const categoryData = await Category.findById({_id:id})
        if(categoryData){
            res.render('admin/updateCategory',{category:categoryData})
        }else{
            res.render('admin/category')
        }

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const UpdatedCategory=async(req,res)=>{
    try{
        const cat =req.body.categoryName
        const catUP= cat.toUpperCase()
        const UpdatedCategory=await Category.findByIdAndUpdate({_id:req.body.id},{$set:{categoryName:catUP,description:req.body.description}})
        if(UpdatedCategory){
            res.redirect('/admin/category')
        }
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
module.exports={
    loadCategory,
    AddCategorry,
    insertCategory,
    DeleteCategory,
    UpdateCategory,
    UpdatedCategory,
}