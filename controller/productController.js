
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

// admin side  
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
        const imgId =req.body.productId
   fs.unlink(path.join(__dirname,'../public/products',imgId),()=>{})
    Product.deleteOne({_id:imgId}).then(()=>{
        res.json({success:true})
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

const loadOfferManagement = async(req,res) => { 
    try{
        const productData= await Product.find({}).populate('category').exec()
        res.render("admin/offermanagement",{productData})


    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}

const addOfferManagement = async(req,res) => { 
    try{
        const productId = req.params.id
        const offerPercentage = req.body.offerPercentage
        const productData = await Product.findOne({_id:productId})
        let amount = productData.price -((productData.price/ 100)* offerPercentage)
        const update = await Product.findOneAndUpdate({_id:productId},{$set:{
            offer:{
                offerStatus:true,
                offerPercentage:offerPercentage
            },
            offerPrice:productData.price,
            price:amount
        }})
        res.redirect('/admin/offerManagement')

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}

const deleteOfferManagement = async(req,res) => { 
    try{
        const productId = req.body.productId
        const productData = await Product.findOne({_id:productId})
        if(productData.offer.offerStatus == false){
            const wait = await Product.updateOne({_id:productId},{$set:{'offer.offerStatus':true}})
            res.json({success:true})
        }else{
            const wait = await Product.updateOne({_id:productId},{$set:{'offer.offerStatus':false}})
            res.json({success:true})

        }

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}

const editOfferManagement = async(req,res) => { 
    try{
        const productId = req.params.id
        console.log(productId);
        const productData = await Product.findOne({_id:productId})
        res.render("admin/editOfferManagement",{productData})

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}

const updatedOfferManagement = async(req,res) => { 
    try{
        const productId = req.params.id
        const offerPercentage = req.body.offerPercentage
        const productData = await Product.findOne({_id:productId})
        const originalPrice = productData.offerPrice
        let amount = productData.offerPrice -((productData.offerPrice/ 100)* offerPercentage)
        const update = await Product.findOneAndUpdate({_id:productId},{$set:{
            offer:{
                offerStatus:true,
                offerPercentage:offerPercentage
            },
            offerPrice:originalPrice,
            price:amount
        }})
        res.redirect('/admin/offerManagement')

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}



// user side 
const AddToCart = async(req,res) => {
    try{ 
        const productId = req.body.productId
        const _id = req.session.user_id
        let exist =await User.findOne({id:req.session.user_id,'cart.productId':productId})
        if(exist){
            
              res.send(false)
        }else{
            const product =await Product.findOne({_id:req.body.productId})        
            const userData = await User.findOne({_id})
            const result = await User.updateOne({_id},{$push:{cart:{productId:product._id,qty:1,price:product.price,productTotalPrice:product.price}}})
            if(result){
                res.send(true)
            }else{
                console.log('not addeed to cart');
            }
        }
    }catch(error){
        console.log(error.message);
        res.render('uses/500')
    }
}

const loadCart = async(req,res) => {
    try{
        const userId = req.session.user_id
        const temp = mongoose.Types.ObjectId(req.session.user_id)
        const usercart =  await User.aggregate([ { $match: { _id: temp } }, { $unwind: '$cart' },{ $group: { _id: null, totalcart: { $sum: '$cart.productTotalPrice' } } }])
        if(usercart.length >0){
            const cartTotal =usercart[0].totalcart
            const cartTotalUpdate = await User.updateOne({_id:userId},{$set:{cartTotalPrice:cartTotal}})
            const userData = await User.findOne({_id:userId}).populate('cart.productId').exec()
            res.render('users/cart',{userData})

        }else{
            const userData = await User.findOne({userId})
            res.render('users/cart',{userData})
        }
        

    }catch(error){
        console.log(error.message);
        res.render('uses/500')
    }
}
const deleteCartProduct = async(req,res) => { 
    try{
        const userId = req.body.userId
        const deleteProId = req.body.deleteProId
        const userData = await User.findByIdAndUpdate({_id:userId},{$pull:{cart:{productId:deleteProId}}})
        if(userData){
            res.json({success:true})
        }
    }catch(error){
        console.log(error.message);
        res.render('uses/500')
    }
}
const change_Quantities = async(req,res) => {
    try{
        const {user,product,count,Quantity,proPrice} =req.body
        const producttemp=mongoose.Types.ObjectId(product)
        const usertemp=mongoose.Types.ObjectId(user)
        const updateQTY = await User.findOneAndUpdate({_id:usertemp,'cart.productId':producttemp},{$inc:{'cart.$.qty':count}})
        const currentqty = await User.findOne({_id:usertemp,'cart.productId':producttemp},{_id:0,'cart.qty.$':1})
        const qty = currentqty.cart[0].qty
        const productSinglePrice =proPrice*qty
        await User.updateOne({_id:usertemp,'cart.productId':producttemp},{$set:{'cart.$.productTotalPrice':productSinglePrice}})
        const cart = await User.findOne({_id:usertemp})
        let sum=0
        for(let i=0;i<cart.cart.length;i++){
            sum=sum + cart.cart[i].productTotalPrice
        }
        const update =await User.updateOne({_id:usertemp},{$set:{cartTotalPrice:sum}})
        .then(async(response)=>{
            res.json({ response: true,productSinglePrice,sum })
            })
                
    }catch(error){
        console.log(error.message);
        res.render('uses/500')
    }
}
const loadWhishlist = async(req,res) => { 
    try{
        const id = req.session.user_id
        const userData = await User.findOne({_id:id}).populate('whishlist.product').exec()
        res.render('users/wishlist',{userData})

    }catch(error){
        res.render('uses/500')
        console.log(error.message);
    }
}

const AddToWishlist  =async(req,res) => { 
    try{
        const productId = req.body.productId
        // console.log(req.session.user_id);
        let exist =await User.findOne({id:req.session.user_id,'whishlist.product':productId})
        // console.log(exist);
        if(exist){
            res.json({status:false})
        }else{
            const product =await Product.findOne({_id:req.body.productId})
            const _id = req.session.user_id
            const userData = await User.findOne({_id})
            const result = await User.updateOne({_id},{$push:{whishlist:{product:product._id}}})
            if(result){
                res.json({status:true})
            }else{
                console.log('not addeed to wishlist');
            }
        }

    }catch(error){
        res.render('uses/500')
        console.log(error.message);
    }
}
const wishlistToCart = async(req,res)=>{
    try{
        const productId = req.body.productId
        const _id = req.session.user_id
        let exist =await User.findOne({id:req.session.user_id,'cart.productId':productId})
        if(exist){
            const user = await User.findOne({_id:req.session.user_id})
            const index =await user.cart.findIndex(data=>data.productId._id == req.body.productId );
                user.cart[index].qty +=1;
                user.cart[index].productTotalPrice= user.cart[index].qty * user.cart[index].price
                await user.save();
                const remove = await User.updateOne({_id},{$pull:{whishlist:{product:productId}}})
              res.send(true)
        }else{
            const product =await Product.findOne({_id:req.body.productId})
            const userData = await User.findOne({_id})
            const result = await User.updateOne({_id},{$push:{cart:{productId:product._id,qty:1,price:product.price,productTotalPrice:product.price}}})
            if(result){
                const remove = await User.updateOne({_id},{$pull:{whishlist:{product:productId}}})
                res.redirect('/home')
            }else{
                console.log('not addeed to cart');
            }
        }

    }catch(error){
        res.render('uses/500')
        console.log(error.message);
    }
}
const deleteWishlistProduct = async(req,res) => { 
    try{
        const id = req.session.user_id
        const deleteProId=req.body.productId
        const deleteWishlist = await User.findByIdAndUpdate({_id:id},{$pull:{whishlist:{product:deleteProId}}})
        if(deleteWishlist){
            res.json({success:true})
        }
    }catch(error){
        res.render('uses/500')
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
    AddToCart,
    loadCart,
    change_Quantities,
    deleteCartProduct,
    AddToWishlist,
    loadWhishlist,
    deleteWishlistProduct,
    wishlistToCart,
    loadOfferManagement,
    addOfferManagement,
    deleteOfferManagement,
    editOfferManagement,
    updatedOfferManagement
}