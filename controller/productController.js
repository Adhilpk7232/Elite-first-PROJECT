
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

const AddProduct = async(req,res)=>{
    try{
        const categoryData=await Category.find()
        const materialData = await Material.find()
        res.render('admin/addProduct',{categoryData,materialData})
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const InertProduct = async (req,res)=>{
    try{
        const images = []
        for(file of req.files){
            images.push(file.filename)
        }
        const productData = new Product({
            product_name:req.body.product_name,
            category:req.body.category,
            description:req.body.description,
            quantity:req.body.quantity,
            image:images,
            price:req.body.price,
            material:req.body.material
        })
        const result =await productData.save()
        if(result){
            res.redirect('/admin/product')
        }else{
            console.log("not save product");
        }

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const loadProduct = async (req,res)=>{
    try{
    const productData= await Product.find({}).populate('category').exec()
    res.render("admin/products",{productData})

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const EditProduct = async (req,res)=>{
    try{
        const productData = await  Product.findOne({_id:req.params.id}).populate('category')
        const categoryData = await  Category.find()
        res.render("admin/edit-product",{productData,categoryData})
   
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const UpdateProduct = async (req,res)=>{
    try{
        const id = req.params.id
        const productData = await Product.updateOne({_id:id},{$set:{
            product_name:req.body.productname,
            category:req.body.categoryName,
            description:req.body.description,
            quantity:req.body.quantity,
            price:req.body.price
        }})
        if(productData){
            res.redirect('/admin/product')
        }
   
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const updateImage = async(req,res)=>{
    try{
        const id =req.params.id
        const proData = await Product.findOne({_id:id})
        const imglength = proData.image.length
        if(imglength <=4){
            let images=[]
            for(file of req.files){
                images.push(file.filename)
            }
            if(imglength +images.length <= 4){
                const updateData = await Product.updateOne({_id:id},{$addToSet:{image:{$each:images}}})
                res.redirect('/admin/edit-product/'+id)
            }else{
                const productData = await  Product.findOne({_id:id})
                const categoryData = await  Category.find()
                res.render("admin/edit-product",{productData,categoryData,imgFull:true})
            }
        }else{
            res.redirect('/admin/edit-product/')
        }
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const deleteImage = async(req,res) =>{
    try{
        const imgid = req.params.imgid
        const prodid = req.params.prodid
        fs.unlink(path.join(__dirname,'../public/products',imgid),()=>{})
        const productImg = await Product.updateOne({_id:prodid},{$pull:{image:imgid}})
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const DeleteProduct = async (req,res)=>{
    try{
        
        const imgId =req.query.id
   fs.unlink(path.join(__dirname,'../public/products',imgId),()=>{})
    Product.deleteOne({_id:req.query.id}).then(()=>{
        res.redirect('/admin/product')
    })
   
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}
const ViewProduct = async (req,res)=>{
    try{
        const id = req.query.id
        const data = await Product.findOne({_id:id})
        res.render('admin/view-product',{data})
   
    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}

module.exports = {
    AddProduct,
    InertProduct,
    loadProduct,
    EditProduct,
    UpdateProduct,
    DeleteProduct,
    ViewProduct,
    updateImage,
    deleteImage,
}