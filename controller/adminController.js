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
        const id = req.query.id
        const userData = await User.findOne({_id:id})
        if(userData.block == false){
            const wait = await User.updateOne({_id:id},{$set:{block:true}})
            req.session.user_id=false
            res.redirect('/admin/user')
        }else{
            const wait = await User.updateOne({_id:id},{$set:{block:false}})
            req.session.user_id=true
            res.redirect('/admin/user')

        }
        

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}

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
        const id = req.query.id
        await Material.deleteOne({_id:id})
        res.redirect('/admin/brand')

    }catch(error){
        res.render('admin/500')
        console.log(error.message);
    }
}

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
        const id = req.query.id
        const bannerData = await Banner.findOne({_id:id},{status:1,_id:id})
        if(bannerData.status == false){
            const wait = await Banner.updateOne({_id:id},{$set:{status:true}})
            
            res.redirect('/admin/offer-banner')
        }else{
            const wait = await Banner.updateOne({_id:id},{$set:{status:false}})
            
            res.redirect('/admin/offer-banner')

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
        const newDate = new Date(currentDate)
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
    loadCategory,
    AddCategorry,
    insertCategory,
    DeleteCategory,
    UpdateCategory,
    UpdatedCategory,
    AddProduct,
    InertProduct,
    loadProduct,
    EditProduct,
    UpdateProduct,
    DeleteProduct,
    ViewProduct,
    updateImage,
    deleteImage,
    loadOrderlist,
    loadcoupon,
    addCoupon,
    editCoupon,
    updateCoupon,
    DeleteCoupon,
    placedOrder,
    shipedOrder,
    deliveredOrder,
    orderReturnSuccess,
    orderReturnCancelled,
    loadOfferBanner,
    insertBanner,
    editBanner,
    updateBanner,
    deleteBanner,
    loadSales,
    listSalesReport,
    loadOrderProduct,
    loadBrand,
    addBrand,
    insertBrand,
    loadEditBrand,
    UpdatedBrand,
    deleteBrand,
    adminLogout
}    