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
        res.render('login')
    }catch(error){
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
                    res.render('login',{message:"Email and Password Is Inccorect"})
                }else{
                    req.session.admin_id = userData._id
                    console.log(req.session.admin_id);
                    res.redirect('/admin/home')
                }

            }else{
                res.render('login',{message:"Email and Password is Inccorect"})
            }

        }else{
            res.render('login',{message:"Email and Password is Inccorect"})
        }

    }catch(error){
        console.log(error.message);
    }
}

const loadDashboard = async (req,res)=>{
    try{
        const salesCount = await Order.find({}).count()
        console.log(salesCount);
        const users = await User.find({}).count()
        console.log(users);
        const online = await Order.find({paymentMethod:'Online Payment'}).count()
        console.log(online);
        const cod = await Order.find({paymentMethod:'COD'}).count()
        console.log(cod);
        const wallet = await Order.find({paymentMethod:'WALLET'}).count()
        console.log(wallet,"wallwt");

        const ord = await Order.find().populate({path:'items',populate:{path:'productId',model:'Product',populate:{path:'category'}}})
        console.log(ord);
        const categoryCount  = {};
        ord.forEach(order => { 
            order.items.forEach(product => { 
                const category = product.productId.category.categoryName

                console.log(category);
                if(category in categoryCount){
                    categoryCount[category] += 1
                }else{
                    categoryCount[category] = 1
                }
            })
        })
        console.log(categoryCount);
        const sortedCategoryCount  = Object.entries(categoryCount).sort((a,b) => b[1]-a[1])
        const numbersOnly  = sortedCategoryCount.map(innerArray => innerArray[1])
        const categoryNames = sortedCategoryCount.map((categoryCount) => { 
            return categoryCount[0]
        })
        console.log(numbersOnly);
        console.log(categoryNames);



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
        console.log(weeklyRevenueOf);
        const weeklyRevenue = weeklyRevenueOf.map((item) => {
            return item.Revenue
        });
        console.log("aaaa");
        console.log(weeklyRevenue);

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
        console.log(weeklySales);
        const date = weeklySales.map((item) => { 
            return item._id
        })
        const Sales = weeklySales.map((item) => { 
            return item.sales
        })


        // const userData = await User.find({is_admin:0})
        res.render('home',{
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
        console.log(error.message);
    }
}
const loadUserManagement = async(req,res)=>{
    try{
        const userData = await User.find({is_admin:0})
        res.render('userManagement',{users:userData})

    }catch(error){
        console.log(error.message);
    }
}
const blockUser = async(req,res)=>{
    try{
        console.log(req.query.id);
        const id = req.query.id
        const userData = await User.findOne({_id:id},{block:1,_id:id})
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
        console.log(error.message);
    }
}

const loadBrand  = async (req,res) => {
    try{
        const materialData =await Material.find({})
        res.render('brandManagement',{materialData})

    }catch(error){
        console.log(error.messaeg);
    }
}
const addBrand  = async (req,res) => {
    try{
        res.render('addBrand')

    }catch(error){
        console.log(error.messaeg);
    }
}
const insertBrand  = async (req,res) => {
    try{
        
        console.log("helllodjsb");
        if(req.body.name =='' ){
            res.render('addBrand',{message:'fill all field'})

        }else{
        const cat = req.body.name
        console.log(cat);
        const catUP = cat.toUpperCase()
        console.log(catUP);
        let exist = await Material.findOne({materialName:catUP})
        console.log(exist);
        if(exist){
            res.render('addBrand',{message:'This Category already Exist'})
            exist=null
        }else{
            console.log(catUP);
            const filename=req.file.filename
            let material = {
                materialName:catUP,
                image:filename
            }
            const materialData =await Material.create(material)
            console.log(materialData);
            if(materialData){
                res.render('addBrand',{message2:'type insert successfully'})
                // console.log("sucsess added");
                
            }else{
                
                res.render('addBrand',{message:'type did not inserted'})
                // console.log(brandData);
            }
        }
        
    }

    }catch(error){
        console.log(error.messaeg);
    }
}
const loadEditBrand  = async (req,res) => {
    try{
        const id =req.query.id
        const materialData = await Material.findById({_id:id})
        if(materialData){
            res.render('updateBrand',{category:materialData})
        }else{
            res.render('brandManagement')
        }

    }catch(error){
        console.log(error.messaeg);
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
        console.log(error.messaeg);
    }
}
const deleteBrand  = async (req,res) => {
    try{
        const id = req.query.id
        await Material.deleteOne({_id:id})
        res.redirect('/admin/brand')

    }catch(error){
        console.log(error.messaeg);
    }
}

const loadCategory = async(req,res)=>{
    try{
        const categoryData =await Category.find({})
        res.render('categoryManagement',{categoryData})

    }catch(error){
        console.log(error.message);
    }
}
const AddCategorry = async (req,res)=>{
    try{
        res.render('addCategory')
    }catch(error){
        console.log(error.message);
    }
}
const insertCategory = async (req,res)=>{
    try{
        if(req.body.categoryName=='' || req.body.description==''){
            res.render('addCategory',{message:'fill all field'})

        }else{
        const cat = req.body.categoryName
        const catUP = cat.toUpperCase()
        let exist = await Category.findOne({categoryName:catUP})
        if(exist){
            res.render('addCategory',{message:'This Category already Exist'})
            exist=null
        }else{
            console.log(catUP);

            const filename=req.file.filename
            console.log(filename);
            const category = new Category({
                categoryName:catUP,
                description:req.body.description,
                image:req.file.filename
                
                
            })
            const categoryData = await category.save()
            if(categoryData){
                res.render('addCategory',{message2:'category insert successfully'})
                console.log("sucsess fullsdfahwescvfuylwH;O");
            }else{
                res.render('addCategory',{message:'category did not inserted'})
            }
        }
        
        
        // const categoryData = await category.save()

        
        
    }
    }catch(error){
        console.log(error.message);
    }
}
const DeleteCategory = async (req,res)=>{
    try{
        const id = req.query.id
        await Category.deleteOne({_id:id})
        res.redirect('/admin/category')



    }catch(error){
        console.log(error.message);
    }
}
const UpdateCategory = async(req,res)=>{
    try{
        const id =req.query.id
        const categoryData = await Category.findById({_id:id})
        if(categoryData){
            res.render('updateCategory',{category:categoryData})
        }else{
            res.render('category')
        }

    }catch(error){
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
        console.log(error.message);
    }
}

const AddProduct = async(req,res)=>{
    try{
        const categoryData=await Category.find()
        const materialData = await Material.find()
        // if(req.session.admin){
        res.render('addProduct',{categoryData,materialData})
        // }else{
        //     res.redirect('/admin')
        // }

    }catch(error){
        console.log(error.message);
    }
}
const InertProduct = async (req,res)=>{
    try{
        const images = []
        for(file of req.files){
            images.push(file.filename)
        }
        console.log("haiii");
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
        console.log(error.message);
    }
}
const loadProduct = async (req,res)=>{
    try{
    const productData= await Product.find({}).populate('category').exec()
    console.log(productData);
  
    res.render("products",{productData})

    }catch(error){
        console.log(error.message);
    }
}
const EditProduct = async (req,res)=>{
    try{
        const productData = await  Product.findOne({_id:req.params.id})
        const categoryData = await  Category.find()
        res.render("edit-product",{productData,categoryData})
   
    }catch(error){
        console.log(error.message);
    }
}
const UpdateProduct = async (req,res)=>{
    try{
        const id = req.params.id
        // const id = mongoose.Types.ObjectId(idTemp)
        // console.log("product"+id);
        const productData = await Product.updateOne({_id:id},{$set:{
            product_name:req.body.productname,
            category:req.body.categoryName,
            description:req.body.description,
            quantity:req.body.quantity,
            price:req.body.price
        }})
        // console.log("udpdate"+productData);
        if(productData){
            res.redirect('/admin/product')
        }
   
    }catch(error){
        console.log(error.message);
    }
}
const updateImage = async(req,res)=>{
    try{
        const id =req.params.id
        console.log(id);
        const proData = await Product.findOne({_id:id})
        console.log(proData);
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
                res.render("edit-product",{productData,categoryData,imgFull:true})
            }

        }else{
            res.redirect('/admin/edit-product/')
        }

    }catch(error){
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
        console.log(error.message);
    }
}
const DeleteProduct = async (req,res)=>{
    try{
        // const id = req.query.id
        // const productData=await Product.deleteOne({_id:id})
        // if(productData){
        //     res.redirect('/admin/product')
        // }
        const proId = req.query.id
        const productdelete = await Product.updateOne({_id:proId},{$set:{list:true}})
        if(productdelete){
            res.redirect('/admin/product')
        }
//         const imgId =req.query.id
//    fs.unlink(path.join(__dirname,'../public/products',imgId),()=>{})
//     Product.deleteOne({_id:req.query.id}).then(()=>{
//         res.redirect('/admin/product')
//     })
   
    }catch(error){
        console.log(error.message);
        console.log("from delete product");
    }
}
const ViewProduct = async (req,res)=>{
    try{
        const id = req.query.id
        const data = await Product.findOne({_id:id})
        res.render('view-product',{data})
   
    }catch(error){
        console.log(error.message);
    }
}
const loadOrderlist = async(req,res) => { 
    try{
        const order = await Order.find()
        console.log(order);
        res.render('order',{order})

    }catch(error){
        console.log(error.message);
        console.log("hellojksnx");
    }
}
const loadOrderProduct = async (req,res) => { 
    try{
        const orderId = req.query.id
        const orderProduct = await Order.findOne({_id:orderId}).populate({path:'items',populate:{path:'productId',model:'Product'}})
        res.render('orderProductView',{orderProduct})
    }catch(error){
        console.log(error.messaeg);
    }
}
const placedOrder  = async(req,res) => { 
    try{
        const orderId = req.query.id
        console.log(orderId);
        const update = await Order.updateOne({_id:orderId},{$set:{orderStatus:'placed'}})
        console.log(update);
        res.redirect('/admin/order')

    }catch(error){
        console.log(error.message);
    }
}
const shipedOrder  = async(req,res) => { 
    try{
        const orderId = req.query.id
        const update = await Order.updateOne({_id:orderId},{$set:{orderStatus:'shiped'}})
        console.log(update);
        res.redirect('/admin/order')

    }catch(error){
        console.log(error.message);
    }
}
const deliveredOrder  = async(req,res) => { 
    try{
        const orderId = req.query.id
        const update = await Order.updateOne({_id:orderId},{$set:{orderStatus:'delivered'}})
        console.log(update);
        res.redirect('/admin/order')

    }catch(error){
        console.log(error.message);
    }
}
const orderReturnSuccess  = async(req,res) => { 
    try{
        const orderId = req.query.id
        const update = await Order.updateOne({_id:orderId},{$set:{orderStatus:'return success'}})
        const orderData = await Order.findOne({_id:orderId})
        console.log(orderData,"oredrDAta");
        if(orderData.paymentMethod == 'Online Payment'){
            const refund = await User.updateOne({_id:orderData.userId},{$inc:{wallet:orderData.totalAmount}})
            console.log(refund,"refund");
        }
        const itemsData = orderData.items
        console.log(itemsData,"items");
            for(let i=0;i< itemsData.length;i++){
                const productStock = await Product.updateOne({_id:itemsData[i].productId},{$inc:{quantity:itemsData[i].qty}})
                console.log(productStock,"productUpdate");
                res.redirect('/admin/order')
            }


       

    }catch(error){
        console.log(error.message);
    }
}
const orderReturnCancelled  = async(req,res) => { 
    try{
        const orderId = req.query.id
        const update = await Order.updateOne({_id:orderId},{$set:{orderStatus:'return cancelled'}})
        console.log(update);
        res.redirect('/admin/order')

    }catch(error){
        console.log(error.message);
    }
}
const loadcoupon = async(req,res) => {
    try{
        const couponsData  = await Coupon.find({disable:false})
        res.render('coupon',{couponsData})

    }catch(error){
        console.log(error.message);
    }
}
const addCoupon = async(req,res) => { 
    try{
        console.log(req.body);
        const couponData = {...req.body}
        console.log( "asim"+couponData.radeemamount);
        console.log( "adhil"+couponData.expirydate);
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
        console.log(couponAdd);
        console.log(insert);
        res.send('success')

    }catch(error){
        console.log(error.message);
    }
}
const editCoupon = async(req,res) => { 
    try{
        const couponId = req.params.id
        const couponData = await Coupon.findOne({_id:couponId})
        res.render('editCoupon',{couponData})

    }catch(error){
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
        console.log(update);
        res.redirect('/admin/coupon')
        

    }catch(error){
        console.log(error.message);
    }
}
const DeleteCoupon = async(req,res) => { 
    try{
        const couponId = req.params.id
        const update = await Coupon.updateOne({_id:couponId},{$set:{disable:true}})
        res.redirect('/admin/coupon')

    }catch(error){
        console.log(error.message);
    }
}
 const loadOfferBanner = async(req,res) => {
    try{
        const banner =await Banner.find()
        res.render('OfferBanner',{banner})

    }catch(error){
        console.log(error.message);
    }
 }
 const insertBanner = async(req,res) => { 
    try{
        const filename=req.file.filename
        const bannerData = new Banner({
            // prodName:req.body.prodname,
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
        console.log(error.message);
    }
 }
 const editBanner = async(req,res) => {
    try{
        const bannerId  = req.query.id
        const banner  = await Banner.findOne({_id:bannerId})
        res.render('edit-banner',{banner})
    }catch(error){
        console.log(error.message);
    }
 }
 const updateBanner = async(req,res) => { 
    try{
        const bannerId = req.query.id
        const filename=req.file.filename
        const bannerData = await Banner.updateOne({_id:bannerId},{$set:{
            // prodName:req.body.prodname,
            offerName:req.body.offername,
            subTitle:req.body.subTitle,
            description:req.body.description,
            bannerImage:filename,
        }})
        if(bannerData){
            res.redirect('/admin/offer-banner')
        }

    }catch(error){
        console.log(error.message);
    }
 }
 const deleteBanner = async(req,res) => { 
    try{
        // console.log(req.query.id);
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
        console.log(error.message);
    }
 }
 const loadSales = async (req,res) => {
    try{
        res.render('salesReport')
    }catch(error){
        console.log(error.message);
    }
 }
 const listSalesReport = async(req,res) => { 
    try{
        // console.log(req.body);
        
        const currentDate = new Date(req.body.to)
        console.log(currentDate);
        const newDate = new Date(currentDate)
        newDate.setDate(currentDate.getDate() + 1)
        
        // console.log(currentDate);
        console.log("hiiiii");
        console.log(newDate);
        console.log("kooi");
        
        if(req.body.from.trim() == '' ||req.body.to.trim() == ''){
            res.render('salesReport',{message:'all field required'})
        }else{
            const saleData = await Order.find({
                orderStatus:'delivered',
                date:{ $gte:new Date(req.body.from), $lte:new Date(newDate)}
                
            })
            .populate({path:'items',populate:{path:'productId',model:'Product'}})
            console.log(saleData);
            res.render('listSalesReport',{saleData})
        }

    }catch(error){
        console.log(error.messaeg);
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
    deleteBrand
}    