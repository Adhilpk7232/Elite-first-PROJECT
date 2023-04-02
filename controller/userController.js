const User = require('../models/userModel')
const Category =require('../models/categoryModel')
const Product =require('../models/productModel')
const Address = require('../models/addressModel')
const Order = require('../models/orderModel')
const Coupon  = require('../models/couponModel')
const Banner  = require('../models/bannerModel')
const Material =require('../models/metirealModel')
const bcrypt = require('bcrypt')
const randormstring = require('randomstring')
const nodemailer = require('nodemailer')
const Razorpay = require('razorpay');
const crypto = require('crypto')
const config = require('../config/config')
const mongoose = require('mongoose')
const { response } = require('../routes/userRoute')
const { Play } = require('twilio/lib/twiml/VoiceResponse')
// const fs=require('fs')
//----------------------------------
const {TWILIO_SERVICE_SID,TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN} = process.env
const client = require('twilio')(TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN,{
    lazyLoading:true
})

const {emailUser,emailPassword} = process.env


  
//-----------------------------------

const securePassword = async (password) => {
    try{
        const passwordHash =  await bcrypt.hash(password,10)
        return passwordHash

    }catch(error){
        console.log(error.message);
    }
}
///for send mail
const sendVerifyMail = async(name,email,user_id)=>{
    try{
        const transporter  = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            tls:true,
            auth: {
                user: emailUser,
                pass: emailPassword
            }
        })
        const mailOptions = {
            from: emailUser,
            to: email,
            subject:'for verification mail',
            html:'<h1>ELITE SHOPIE</h1><p>Hii '+name+',please click here to <a href ="https://eliteshopie.online/verify?id='+user_id+'">verify</a>your mail .</p>'
        
        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
                console.log("Mail transporter in send mail section");
            }else{
                console.log("Email has been sent:- ",info.response);
            }
        })
        console.log(name);
        console.log(user_id);
        console.log(email);
    }catch(error){
        console.log(error.message);
        console.log("send mail section");
    }
}

// for reset password and email

const sendResetMail = async(name, email,token)=>{
    try{
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            tls:true,
            auth:{
                user: emailUser,
                pass:emailPassword
            }
        })
        const mailOptions ={
            from: emailUser,
            to:email,
            subject:'For reset Password',
            html:'<h1>ELITE SHOPIE</h1> <p>Hii '+name+',please click here to <a href ="https://eliteshopie.online/forget-password?token='+token+'">reset</a>your password .</p>'

        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log("Email has been sent:- ",info.response);
            }
        })

    }catch(error){
        console.log(error.message);
    }

}
const loadSignup = async(req,res)=>{
    try{        res.render('register')

    }catch(error){
        console.log(error.message);
    }
}
const insertUser = async(req,res)=>{
    try{
        const spassword = await securePassword(req.body.password)
        const userEmail =req.body.email
        const usermobile =req.body.mno
        const checkData = await User.findOne({email:userEmail})
        if(checkData){
             res.render('register',{message:'Email is already exist'})
        }else{
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno,
            password:spassword,
            is_admin:0,
        })
        const userData = await user.save()
        if(userData){
            sendVerifyMail(req.body.name,req.body.email,userData._id);
            res.render('register',{message:"your registration succseeful please verify your email"})
        }else{
            res.render('register',{message:"registration failed"})
        }
        }

    }catch(erorr){
    console.log(erorr.message);
    }
}
const verifyMail = async(req,res)=>{
    try{
        const updateInfo = await User.updateOne({_id:req.query.id},{$set:{is_verified:1}})
        res.render('email-verified')
    }catch(error){
        console.log(error.message);
    }
    
}
//landing page

const loadLandingPage = async(req,res)=>{
    try{
        const user = false
        const categoryData = await Category.find()
        const productData = await Product.find()
        const bannerData = await Banner.find({status:true})
        const materialData = await Material.find()
        console.log(bannerData);
        res.render('home1',{categoryData,productData,user,bannerData,materialData})
    }catch(error){
        console.log(error.message);
    }
}

const loadHome = async (req,res)=>{
    try{
        if(req.session.user_id){
        const user=true
        const userId = req.session.user_id
        const userData = await User.findOne({_id:userId})
        const categoryData = await Category.find()
        const productData = await Product.find()
        const bannerData = await Banner.find({status:true})
        const materialData = await Material.find()
        console.log(bannerData);
        res.render('home1',{categoryData,productData,user,bannerData,materialData,userData})
        }
    }catch(error){
        console.log(error.message);
    }
}

const searchProducts  = async (req,res) => { 
    try{
        let payload = req.body.payload.trim()
        console.log("gate4 = " +payload)

        let search =await Product.find({product_name:{$regex:new RegExp('^'+payload+'.*','i')}}).exec()
        console.log(search);
        search=search.slice(0,10)
        res.send({search})



    }catch(error){
        console.log(error.message);
    }
}
//LOGIN USER METHOD STARTED

const loginLoad = async (req,res)=>{
    try{
        res.render('login1')
    }catch(error){
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try{
    const email = req.body.email
    const password = req.body.password
    const userData = await User.findOne({email:email})
    

    if(userData){
        const passwordMatch = await bcrypt.compare(password,userData.password)
        if(passwordMatch){
            if(userData.is_verified === 0||userData.is_mobileVerified ===0){
                if(userData.is_verified === 0){
                    res.render('login1',{message:"Please verify your mail"})
                    console.log("verified user zero");

                }else{
                    res.render('login1',{message:"Please verify your Mobile Number"})
                    console.log("Mobile verified user zero");
                }    
            }else{
                req.session.user_id = userData._id;
                console.log(req.session.user_id);
                res.redirect('/home') 
            }
        }else{
            res.render('login1',{message:"Email and password id incorrect"})
        }

    }else{
        res.render('login1',{message:"Email and Password is incorrect"})
    }
    }catch(error){
        console.log(error.message);
    }
    
}

const mobileCheck = async(req,res)=>{
    try{
        res.render('mobileCheck',{message:""})
    }catch(error){
        console.log(error.message);
    }
}

const verifyPhone = async(req,res)=>{

    try{
        const num= await req.body.mno
        console.log(num);
        const check = await User.findOne({mobile:num})
        console.log(check);
        if(check){
            const otpResponse  = await client.verify.
                v2.services(TWILIO_SERVICE_SID)
                .verifications.create({
                    to: `+91${num}`,
                    channel:"sms"
                })
               
            res.render('loginMobileOtp',{message:num})

        }else{
            res.render('mobileCheck',{message:"Did not register this mobile number"})
        }
    }catch(error){
        console.log(error.message);
        console.log("from error of phone verify");
    }
}

const verifyOtp = async(req,res)=>{
    try{
        const num = req.body.mno
        const otp = req.body.otp
        console.log(otp+""+num);
        const verifiedResponse = await client.verify.
            v2.services(TWILIO_SERVICE_SID)
            .verificationChecks.create({
                to:`+91${num}`,
                code:otp,
            })
                if(verifiedResponse.status=='approved'){
                    const userDetails = await User.find({mobile:num})
                    console.log(userDetails);
                    const updateInfo = await User.updateOne({mobile:num},{$set:{is_mobileVerified:1}})
                    req.session.user_id = userDetails._id
                    res.redirect('/home')
                    console.log("true otp");
                }else{
                    res.render('loginMobileOtp',{message:'incorect otp'})
                    console.log("false otp");
                }
    }catch(error){
        console.log(error.message);
        console.log("veriftotp section");
    }
}
const loginOtp = async(req,res) => {
    try{
        res.render('loginMobile1')

    }catch(error){
        console.log(error.message);
    }
}
const verifyNum = async(req,res) => {
    try{
        const num= await req.body.mno
        const check = await User.findOne({mobile:num})
        if(check){
            const otpResponse  = await client.verify.
                v2.services(TWILIO_SERVICE_SID)
                .verifications.create({
                    to:`+91${num}`,
                    channel:"sms"
                })
               
            res.render('loginMobileOtp',{message:num})

        }else{
            res.render('loginMobile1',{message:"Did not register this mobile number"})
        }

    }catch(error){
        console.log(error.message);
    }
}
const loadOtp = async(req,res) => { 
    try{
        res.render('loginMobileOtp',{message:8086386842})

    }catch(error){
        console.log(error.message);
    }
}
const verifyNumOtp = async(req,res)=>{
    try{
        const num = req.body.mno
        const otp = req.body.otp
        console.log(otp+""+num);
        const verifiedResponse = await client.verify.
            v2.services(TWILIO_SERVICE_SID)
            .verificationChecks.create({
                to:`+91${num}`,
                code:otp,
            })
                if(verifiedResponse.status=='approved'){
                    // const num = req.body.mno
                    const userDetails =await User.findOne({mobile:num})
                    req.session.user_id = userDetails._id
                    console.log(req.session.user_id);
                    res.redirect('/home')
                    console.log("true otp");
                }else{
                    res.render('loginMobileOtp',{message2:'incorect otp',message:num})
                    console.log("false otp");
                }
    }catch(error){
        console.log(error.message);
        console.log("veriftotp section");
    }
}
const userLogout = async (req,res)=>{
    try{
        req.session.user_id=null
        res.redirect('/');

    }catch(error){
        console.log(error.message);
    }
}
const forgetLoad = async(req,res)=>{
    try{
        res.render('forgotpassword')
    }catch(error){
        console.log(error.message);
    }
}
const forgetVerify = async(req,res)=>{
    try{
        const email=req.body.email

        const userData = await User.findOne({email:email})
        if(userData){
            
            if(userData.is_verified === 0){
                res.render('forgotpassword',{message:"please verify your mail"})
            }else{
                const randomstring = randormstring.generate()
                const updatedData = await User.updateOne({email:email},{$set:{token:randomstring}})
                sendResetMail(userData.name,userData.email,randomstring)
                res.render('forgotpassword',{message2:'Please check your mail to rest your password'})
            }

        }else{
            res.render('forgotpassword',{message:'User email is incorrect'})
        }

    }catch(error){
        console.log(error.message);
    }
}

const forgetPasswordLoad = async(req,res)=>{
    try{
        const token = req.query.token
        const tokenData = await User.findOne({token:token})
        if(tokenData){
            res.render('resetPassword',{user_id:tokenData._id})

        }else{
            res.render('404',{message:"token is invalid"})
        }

    }catch(error){
        console.log(error.message);

    }
}


const resetPassword = async (req,res)=>{
    try{
        const password = req.body.password
        const user_id = req.body.user_id
        const secure_password = await securePassword(password)

        const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}})
        // console.log(updatedData);
        res.redirect('/login')

    }catch(error){
        console.log(error.message);
    }
}


const AddToCart = async(req,res) => {
    try{ 
        const productId = req.body.productId
        const _id = req.session.user_id
        let exist =await User.findOne({id:req.session.user_id,'cart.productId':productId})
        console.log(exist);
        if(exist){
            
              res.send(false)
        }else{
            const product =await Product.findOne({_id:req.body.productId})
            
            const userData = await User.findOne({_id})
            const result = await User.updateOne({_id},{$push:{cart:{productId:product._id,qty:1,price:product.price,productTotalPrice:product.price}}})
            if(result){
                res.send(true)
                console.log('added to cart');
            }else{
                console.log('not addeed to cart');
            }
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadCart = async(req,res) => {
    try{
        console.log("showing cart....");
        const userId = req.session.user_id
        const temp = mongoose.Types.ObjectId(req.session.user_id)
        const usercart =  await User.aggregate([ { $match: { _id: temp } }, { $unwind: '$cart' },{ $group: { _id: null, totalcart: { $sum: '$cart.productTotalPrice' } } }])
        console.log(usercart);
        if(usercart.length >0){
            const cartTotal =usercart[0].totalcart
        const cartTotalUpdate = await User.updateOne({_id:userId},{$set:{cartTotalPrice:cartTotal}})
        const userData = await User.findOne({_id:userId}).populate('cart.productId').exec()
        res.render('cart1',{userData})

        }else{
            const userData = await User.findOne({userId})
            res.render('cart1',{userData})
        }
        

    }catch(error){
        console.log(error.message);
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
    }
}
const loadWhishlist = async(req,res) => { 
    try{
        const id = req.session.user_id
        const userData = await User.findOne({_id:id}).populate('whishlist.product').exec()
        // console.log(userData);
        // console.log(userData.whishlist);
        res.render('wishlist1',{userData})

    }catch(error){
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
            console.log("item allready exist in whishlist");
            res.json({status:false})
        }else{
            const product =await Product.findOne({_id:req.body.productId})
            const _id = req.session.user_id
            const userData = await User.findOne({_id})
            const result = await User.updateOne({_id},{$push:{whishlist:{product:product._id}}})
            if(result){
                res.json({status:true})
                console.log('added to whislist');
            }else{
                console.log('not addeed to wishlist');
            }
        }

    }catch(error){
        console.log(error.message);
    }
}
const wishlistToCart = async(req,res)=>{
    try{
        const productId = req.body.productId
        console.log(req.session.user_id);
        const _id = req.session.user_id
        let exist =await User.findOne({id:req.session.user_id,'cart.productId':productId})
        console.log(exist);
        if(exist){
            const user = await User.findOne({_id:req.session.user_id})
            const index =await user.cart.findIndex(data=>data.productId._id == req.body.productId );
            // console.log(index);
                 user.cart[index].qty +=1;
                user.cart[index].productTotalPrice= user.cart[index].qty * user.cart[index].price
                await user.save();
                const remove = await User.updateOne({_id},{$pull:{whishlist:{product:productId}}})
              res.send(true)
        }else{
            const product =await Product.findOne({_id:req.body.productId})
            
            // console.log(_id);
            const userData = await User.findOne({_id})
            // console.log(userData);
            const result = await User.updateOne({_id},{$push:{cart:{productId:product._id,qty:1,price:product.price,productTotalPrice:product.price}}})
            if(result){
                const remove = await User.updateOne({_id},{$pull:{whishlist:{product:productId}}})
                res.redirect('/home')
                console.log('added to cart');
            }else{
                console.log('not addeed to cart');
            }
        }

    }catch(error){
        console.log(error.message);
    }
}
const deleteWishlistProduct = async(req,res) => { 
    try{
        const id = req.session.user_id
        console.log("adhilp"+id);
        const deleteProId=req.body.productId
        console.log(deleteProId);
        const deleteWishlist = await User.findByIdAndUpdate({_id:id},{$pull:{whishlist:{product:deleteProId}}})
        console.log("deeehunf"+deleteWishlist);
        if(deleteWishlist){
            res.json({success:true})
        }
    }catch(error){
        console.log(error.message);
    }
}
const loadCheckout = async(req,res) => {
    try{
        const userId = req.session.user_id
        console.log(userId);
        const userData = await User.findOne({_id:userId}).populate('cart.productId').exec()
        const addressData = await Address.findOne({userId:userId})
        res.render('check',{userData,addressData})

    }catch(error){
        console.log(error.message);
    }

}

const couponApply = async (req, res) => {
    try {
        
        
        const userId = req.session.user_id
        console.log(userId);
        const user = await User.findOne({ _id:userId });
        console.log(user);
        let cartTotal = user.cartTotalPrice;
        console.log("cart");
        console.log(cartTotal);
        console.log(req.body.code);
    const exist = await Coupon.findOne(
        { couponCode: req.body.code, used: userId },
        { used: { $elemMatch: { $eq: userId } } }
      );
        console.log(exist);
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
                console.log(`must purchase above ${couponData.minCartAmount}`);
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
      console.log(error.message);
    }
  };




const addAddressCheckout = async(req,res) => { 
    try{
        if(req.session.user_id){
            const userId =req.session.user_id
            let AddressObj ={
                fullname:req.body.fullname,
                mobileNumber:req.body.number,
                pincode:req.body.zip,
                houseAddress:req.body.houseAddress,
                streetAddress:req.body.streetAddress,
                landMark:req.body.landmark,
                cityName:req.body.city,
                state:req.body.state
            }
            const userAddress= await Address.findOne({userId:userId})
            if(userAddress){
                console.log("addred to exist address");
                const userAdrs=await Address.findOne({userId:userId}).populate('userId').exec()
                userAdrs.userAddresses.push(AddressObj)
                await userAdrs .save().then((resp)=>{
                    res.redirect('/checkout')
                }).catch((err) => { 
                    res.send(err)
                })
                console.log(userAdrs);
                
            }else{
                console.log("added to new address ");
                let userAddressObj ={
                    userId:userId,
                    userAddresses:[AddressObj]
                }
                await Address.create(userAddressObj).then((resp)=>{
                    res.redirect('/checkout')
                })
            }
        
        }

    }catch(error){
        console.log(error.message);
    }
}
const loadShop = async(req,res) => { 
    try{
        if(req.session.user_id){
            const user = true
            let page = 1
        if(req.query.page){
            page = req.query.page
        }
        let limit = 3

        const categoryData = await Category.find()
        const productData = await Product.find()
            .limit(limit*1)
            .skip((page - 1)* limit)
            .exec()
        const productCount = await Product.find().countDocuments()
        let countProduct = Math.ceil(productCount/limit)
        const materialData = await Material.find()



        
        res.render('shop1',{categoryData,productData,materialData,countProduct,user})
        }else{
            const user = false
            let page = 1
        if(req.query.page){
            page = req.query.page
        }
        let limit = 3

        const categoryData = await Category.find()
        const productData = await Product.find()
            .limit(limit*1)
            .skip((page - 1)* limit)
            .exec()
        const productCount = await Product.find().countDocuments()
        let countProduct = Math.ceil(productCount/limit)
        const materialData = await Material.find()
        res.render('shop1',{categoryData,productData,materialData,countProduct,user})
        }
        

    }catch(error){
        console.log(error.mesage);
    }
}
const loadMaterialShop= async (req,res) =>{
    try{
        if(req.session.user_id){
            const user = true
            const materialId=req.params.id
        let page = 1
        if(req.query.page){
            page = req.query.page
        }
        let limit = 3

        
        const productMaterial = await Product.find({material:materialId})
            .limit(limit*1)
            .skip((page - 1)* limit)
            .exec()
        const productCount = await Product.find({material:materialId}).countDocuments()
        let countProduct = Math.ceil(productCount/limit)
        const categoryData = await Category.find()
        const materialData = await Material.find()
        res.render('materialShop',{productMaterial,categoryData,materialData,countProduct,user})
        }else{
            const user = false
            const materialId=req.params.id
        let page = 1
        if(req.query.page){
            page = req.query.page
        }
        let limit = 3

        
        const productMaterial = await Product.find({material:materialId})
            .limit(limit*1)
            .skip((page - 1)* limit)
            .exec()
        const productCount = await Product.find({material:materialId}).countDocuments()
        let countProduct = Math.ceil(productCount/limit)
        const categoryData = await Category.find()
        const materialData = await Material.find()
        res.render('materialShop',{productMaterial,categoryData,materialData,countProduct,user})
        }
        

    }catch(error){
        console.log(error.message);
    }
}
const loadShopCategory = async (req,res) =>{
    try{
        if(req.session.user_id){
            const user = true
            const catId=req.params.id
                let page = 1
            if(req.query.page){
                page = req.query.page
            }
            let limit = 3

            
            const productCate = await Product.find({category:catId})
                .limit(limit*1)
                .skip((page - 1)* limit)
                .exec()
            const productCount = await Product.find({category:catId}).countDocuments()
            let countProduct = Math.ceil(productCount/limit)
            const categoryData = await Category.find()
            const materialData = await Material.find()
            res.render('categoryShop',{productCate,categoryData,materialData,user,countProduct})

        }else{
            const user = false
            const catId=req.params.id
            let page = 1
            if(req.query.page){
                page = req.query.page
            }
            let limit = 3

            
            const productCate = await Product.find({category:catId})
                .limit(limit*1)
                .skip((page - 1)* limit)
                .exec()
            const productCount = await Product.find({category:catId}).countDocuments()
            let countProduct = Math.ceil(productCount/limit)
        const categoryData = await Category.find()
        const materialData = await Material.find()
        res.render('categoryShop',{productCate,categoryData,materialData,user,countProduct})

        }
        

    }catch(error){
        console.log(error.message);
    }
}
const loadProfile = async (req,res) => {
    try{
        const userId = req.session.user_id
        const userData = await User.findOne({_id:userId})
        const address = await Address.findOne({userId:req.session.user_id})
        console.log(userData);
        res.render('profile1',{userData})
        
    }catch(error){
        console.log(error.message);
    }
}
const loadProfileAddress = async (req,res) => {
    try{
        const userId = req.session.user_id
        const userData = await User.findOne({_id:userId})
        const address = await Address.findOne({userId:userId})
        console.log(address)
        res.render('profileAdress',{address,userData})
        
    }catch(error){
        console.log(error.message);
    }
}
const updateUserData = async(req,res) => { 
    try{
        const userId = req.session.user_id
        const name = req.body.name
        const email = req.body.email
        const mobileNumber = req.body.phone
        const updateUser = await User.updateOne({userId},{$set:{name:name,email:email,mobile:mobileNumber}})
        console.log(updateUser);
        res.redirect('/profile')

    }catch(error){ 
        console.log(error.message);
    }
}
const orderList = async (req,res) => { 
    try{
        const id = req.session.user_id
        const orders = await Order.find({userId:id}).populate({path:'items',populate:{path:'productId',model:'Product'}})
        console.log("hai"+orders);
        res.render('orderList',{orders})
    }catch(error){
        console.log(error.message);
    }
}
const orderedProducts = async(req,res) => { 
     try{
        const orderId  =req.query.id
        const orderProduct = await Order.findOne({_id:orderId}).populate({path:'items',populate:{path:'productId',model:'Product'}})
        res.render('orderedProductView',{orderProduct})

     }catch(error){
        console.log(error.message);
     }
}
const cancelOrder =  async(req,res) => { 
     try{
        const orderId = req.query.id
        const order = await Order.findById(orderId)
        if(order.paymentMethod == "Online Payment" && order.orderStatus == 'placed'){
            const refund = await User.findOneAndUpdate({_id:order.userId},{$inc:{wallet:order.totalAmount}})
            console.log(refund,"refund");
            order.orderStatus = 'cancelled'
            order.save()
            res.redirect('/profile-order')
        }else{
            order.orderStatus = 'cancelled'
            order.save()
            res.redirect('/profile-order')
        }
     }catch(error){
        console.log(error.message);
     }
}
const returnOrder =  async(req,res) => { 
    try{
       const orderId = req.query.id
       const order = await Order.findById(orderId)
       order.orderStatus = 'return requested'
       order.save()
       res.redirect('/profile-order')

    }catch(error){
       console.log(error.message);
    }
}
const insertAddress = async(req,res) => { 
    try{
        if(req.session.user_id){
            const userId =req.session.user_id
            let AddressObj ={
                fullname:req.body.fullname,
                mobileNumber:req.body.number,
                pincode:req.body.zip,
                houseAddress:req.body.houseAddress,
                streetAddress:req.body.streetAddress,
                landMark:req.body.landmark,
                cityName:req.body.city,
                state:req.body.state
            }
            const userAddress= await Address.findOne({userId:userId})
            if(userAddress){
                console.log("addred to exist address");
                const newAddress=await Address.findOne({userId:userId}).populate('userId').exec()
                newAddress.userAddresses.push(AddressObj)
                await newAddress .save().then((resp)=>{
                    res.redirect('/profile')
                }).catch((err) => { 
                    res.send(err)
                })
                console.log(userAdrs);
                
            }else{
                console.log("added to new address ");
                let userAddressObj ={
                    userId:userId,
                    userAddresses:[AddressObj]
                }
                await Address.create(userAddressObj).then((resp)=>{
                    res.redirect('/profile')
                })
            }
        
        }
    }catch(error){
        console.log(error.message);
    }
}
const editAddress = async(req,res) => {
    try{
        const adrsSchemaId = req.params.id
        const adrsId = req.params.adrsId
        const address=mongoose.Types.ObjectId(adrsSchemaId)
        const addresses=mongoose.Types.ObjectId(adrsId)
        const addressData = await Address.findOne({address})
        const addressIndex = await addressData.userAddresses.findIndex(data=> data.id == addresses)
        const editAddress = addressData.userAddresses[addressIndex]
        res.render('profileAddressEdit',{editAddress,addressIndex})


    }catch(error){
        console.log(error.message);
    }
}
const updateAddress = async(req,res) =>{
    try{
        // const userAddresses = req.params.id
        const addressIndex = req.params.addressIndex
        const editData = { ...req.body }
        const userId = req.session.user_id
        const updateAdrs = await Address.findOne({userId})
        updateAdrs.userAddresses[addressIndex]= {...editData}
        await updateAdrs.save()
        res.redirect('/profile')

    
    }catch(error){
        console.log(error.message);
    }
}
const DeleteAddress = async(req,res)=>{
    try{
        const adrsSchemaId = req.params.id
        const adrsId = req.params.adrsId
        const addressId=mongoose.Types.ObjectId(adrsSchemaId)
        const addresses=mongoose.Types.ObjectId(adrsId)
        const addressData = await Address.findOne({addressId})
        const addressIndex = await addressData.userAddresses.findIndex(data=> data.id == addresses)
        addressData.userAddresses.splice(addressIndex,1)
        await addressData.save()
        res.redirect('/profile')
        

    }catch(error){
        console.log(error.message);
    }
}
const loadOrderHistory = async(req,res) => { 
    try{
        const userId = req.session.user_id
        const userData = await User.findOne({_id:userId})
        const orderData = await Order.find({userId:userId})
        res.render('profileOrder',{orderData,userData})

    }catch(error){
        console.log(error.message);
    }
}
const loadSingleProduct = async(req,res) => {
    try{
        if(req.session.user_id){
            const user = true
            const id=req.params.id
            const product = await Product.findOne({_id:id}).populate('category').exec()
            const categoryId = product.category
            const relatedProduct = await Product.find({category:categoryId})
            console.log(relatedProduct);
            res.render('singleProductView',{product,relatedProduct,user})
        }else{
            const user = false
            const id=req.params.id
        const product = await Product.findOne({_id:id}).populate('category').exec()
        const categoryId = product.category
        const relatedProduct = await Product.find({category:categoryId})
        console.log(relatedProduct);
        res.render('singleProductView',{product,relatedProduct,user})
        }
        

    }catch(error){
        console.log(error.message); 
    }
}
const placeOrder = async(req,res) => {
    try{
        console.log("get place order");
        const userId = req.session.user_id
        const index = req.body.address
        const discount = req.body.couponDiscount
        const totel = req.body.total1
        const coupon = req.body.couponC
        const couponUpdate = await Coupon.updateOne({couponCode:coupon},{$push:{used:userId}})     
        const address= await Address.findOne({userId:userId})
        const userAddress = address.userAddresses[index]
        const cartData = await User.findOne({_id:userId}).populate('cart.productId')
        const total = cartData.cartTotalPrice
        const payment = req.body.payment
        let status  =payment === 'COD'?'placed':'pending'
        let orderObj = { 
            userId:userId,
            address:{
                fullName:userAddress.fullname,
                mobileNumber:userAddress.mobileNumber,
                pincode:userAddress.pincode,
                houseAddress:userAddress.houseAddress,
                streetAddress:userAddress.streetAddress,
                landMark:userAddress.landMark,
                cityName:userAddress.cityName,
                state:userAddress.state
            },
            paymentMethod:payment,
            orderStatus:status,
            items:cartData.cart,
            totalAmount:total,
            discount:discount
        }
         await Order.create(orderObj)
        .then(async(data) => {
            const orderId = data._id.toString()
            if(payment == 'COD'){
                const userData = await User.findOne({_id:userId})
                const cartData = userData.cart
                console.log(cartData);
                for(let i=0;i<cartData.length;i++){
                    const productStock = await Product.findById(cartData[i].productId)
                    productStock.quantity -= cartData[i].qty
                    await productStock.save()
                }
                await User.updateOne({_id:userId},{$set:{cart:[],cartTotalPrice:0}})
                console.log(data);
                res.json({status:true})
            }else if(payment == 'WALLET'){

                const userData = await User.findOne({_id:userId})
                if(userData.wallet >= total){
                    const cartData = userData.cart
                for(let i=0;i<cartData.length;i++){
                    const productStock = await Product.findById(cartData[i].productId)
                    productStock.quantity -= cartData[i].qty
                    await productStock.save()
                }
                await User.updateOne({_id:userId},{$set:{cart:[],cartTotalPrice:0}})
                await Order.updateOne({_id:orderId},{$set:{paymentMethod:'Wallet',orderStatus:'placed'}})
                console.log(data);
                res.json({status:true})

                }else{
                    res.json({walletBalance:true})
                }
            }else{
                var instance = new Razorpay({
                    key_id: process.env.KEY_ID,
                    key_secret: process.env.KEY_SECRET,
                })
                let amount  = total
                instance.orders.create({
                    amount:amount*100,
                    currency:"INR",
                    receipt:orderId,
                },(err,order) => {
                    console.log(order);
                    res.json({status:false,order})
                })
            }
        })

    }catch(error){
        console.log(error.message);
    }
}
const verifyPayment = async(req,res)=>{
    try{
        console.log("inside verifypayment ");
        console.log(req.body);
        const userId = req.session.user_id
            const details = req.body
            console.log(details.payment); 
            let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET);
            hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
            hmac = hmac.digest('hex')   
            const orderId = details.order.receipt
            console.log(orderId);
            if (hmac == details.payment.razorpay_signature) {
                console.log('order Successfull')
                const userData = await User.findOne({_id:userId})
                const cartData = userData.cart
                console.log(cartData);
                for(let i=0;i<cartData.length;i++){
                    const productStock = await Product.findById(cartData[i].productId)
                    productStock.quantity -= cartData[i].qty
                    await productStock.save()
                }
                await User.updateOne({_id:userId},{$set:{cart:[],cartTotalPrice:0}})
                await Order.findByIdAndUpdate(orderId, { $set: { orderStatus: 'placed' } }).then((data) => {
                    res.json({ status: true, data })
                }).catch((err) => {
                    console.log(err);
                    res.data({ status: false, err })
                })   
            } else {
                res.json({ status: false })
                console.log('payment failed');
            }
    }catch(error){
        console.log(error.message);
    }
}
const orderSuccess = async(req,res) => {
    try{
        const userId = req.session.user_id
        const userData = await User.findOne({_id:userId})
        const catrData  = await User.findOne({_id:userId})
        const orderData = await Order.findOne({userId:userId}).populate({path:'items',populate:{path:'productId',model:'Product'}}).sort({createdAt:-1}).limit(1)
        res.render('orderSuccess',{orderData})
    }catch(error){
        console.log(error.message);
    }
}
module.exports={
    loadLandingPage,
    loadSignup,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    mobileCheck,
    verifyPhone,
    verifyOtp,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    AddToCart,
    loadCart,
    loadCheckout,
    loadShopCategory,
    loginOtp,
    verifyNum,
    verifyNumOtp,
    loadProfile,loadSingleProduct,
    insertAddress,
    editAddress,
    updateAddress,
    DeleteAddress,
    change_Quantities,
    deleteCartProduct,
    AddToWishlist,
    loadWhishlist,
    deleteWishlistProduct,
    placeOrder,
    addAddressCheckout,
    orderList,
    cancelOrder,
    verifyPayment,
    orderSuccess,
    couponApply,
    wishlistToCart,
    loadShop,
    orderedProducts,
    updateUserData,
    loadProfileAddress,
    loadOrderHistory,
    loadMaterialShop,
    returnOrder,
    loadOtp,
    searchProducts
}