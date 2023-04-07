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

// secure password encrypted 
const securePassword = async (password) => {
    try{
        const passwordHash =  await bcrypt.hash(password,10)
        return passwordHash

    }catch(error){
        res.render('users/500')
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
        res.render('users/500')
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
        res.render('users/500')

    }

}
// load signup page 
const loadSignup = async(req,res)=>{
    try{        
        res.render('users/register')

    }catch(error){
        console.log(error.message);
        res.render('users/500')

    }
}
// insert new user 
const insertUser = async(req,res)=>{
    try{
        const spassword = await securePassword(req.body.password)
        const userEmail =req.body.email
        const usermobile =req.body.mno
        const checkData = await User.findOne({email:userEmail})
        if(checkData){
             res.render('users/register',{message:'Email is already exist'})
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
            res.render('users/register',{message:"your registration succseeful please verify your email"})
        }else{
            res.render('users/register',{message:"registration failed"})
        }
        }

    }catch(erorr){
    console.log(erorr.message);
    }
}
// mail verification in mail 
const verifyMail = async(req,res)=>{
    try{
        const updateInfo = await User.updateOne({_id:req.query.id},{$set:{is_verified:1}})
        res.render('users/email-verified')
    }catch(error){
        console.log(error.message);
        res.render('users/500')

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
        res.render('users/home',{categoryData,productData,user,bannerData,materialData})
    }catch(error){
        console.log(error.message);
        res.render('users/500')

    }
}
// Home page rendering 
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
        res.render('users/home',{categoryData,productData,user,bannerData,materialData,userData})
        }
    }catch(error){
        console.log(error.message);
        res.render('users/500')

    }
}
// search for products 
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
        res.render('users/500')

    }
}
//LOGIN USER METHOD STARTED
const loginLoad = async (req,res)=>{
    try{
        res.render('users/login')
    }catch(error){
        console.log(error.message);
        res.render('users/500')

    }
}
// VERIFY LOGIN PAGE 
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
                    res.render('users/login',{message:"Please verify your mail"})
                    console.log("verified user zero");

                }else{
                    res.render('users/login',{message:"Please verify your Mobile Number"})
                    console.log("Mobile verified user zero");
                }    
            }else{
                req.session.user_id = userData._id;
                console.log(req.session.user_id);
                res.redirect('/home') 
            }
        }else{
            res.render('users/login',{message:"Email and password id incorrect"})
        }

    }else{
        res.render('users/login',{message:"Email and Password is incorrect"})
    }
    }catch(error){
        console.log(error.message);
        res.render('users/500')

    }
    
}
// FIELD FOR ENTERING MOBILE NO 
const mobileCheck = async(req,res)=>{
    try{
        res.render('users/mobileCheck',{message:""})
    }catch(error){
        console.log(error.message);
        res.render('users/500')

    }
}
// VERIFYING MOBILE NO 
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
               
            res.render('users/loginMobileOtp',{message:num})

        }else{
            res.render('users/mobileCheck',{message:"Did not register this mobile number"})
        }
    }catch(error){
        res.render('users/500')
        console.log(error.message);
        console.log("from error of phone verify");
    }
}
// VERIFING OTP 
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
                    res.render('users/loginMobileOtp',{message:'incorect otp'})
                    console.log("false otp");
                }
    }catch(error){
        res.render('users/500')
        console.log(error.message);
        console.log("veriftotp section");
    }
}
// LOGIN OTP 
const loginOtp = async(req,res) => {
    try{
        res.render('users/loginMobile1')

    }catch(error){
        console.log(error.message);
        res.render('users/500')

    }
}
// LOGIN OTP VERIFICATION 
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
               
            res.render('users/loginMobileOtp',{message:num})

        }else{
            res.render('users/loginMobile1',{message:"Did not register this mobile number"})
        }

    }catch(error){
        console.log(error.message);
        res.render('users/500')

    }
}
const loadOtp = async(req,res) => { 
    try{
        res.render('users/loginMobileOtp',{message:8086386842})

    }catch(error){
        console.log(error.message);
        res.render('users/500')

    }
}
// VERIFING OTP ENTERED 
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
                    res.render('users/loginMobileOtp',{message2:'incorect otp',message:num})
                    console.log("false otp");
                }
    }catch(error){
        console.log(error.message);
        res.render('users/500')
        console.log("veriftotp section");
    }
}
const userLogout = async (req,res)=>{
    try{
        req.session.user_id=null
        res.redirect('/');

    }catch(error){
        console.log(error.message);
        res.render('users/500')

    }
}
const forgetLoad = async(req,res)=>{
    try{
        res.render('users/forgotpassword')
    }catch(error){
        console.log(error.message);
        res.render('users/500')
    }
}
const forgetVerify = async(req,res)=>{
    try{
        const email=req.body.email

        const userData = await User.findOne({email:email})
        if(userData){
            
            if(userData.is_verified === 0){
                res.render('users/forgotpassword',{message:"please verify your mail"})
            }else{
                const randomstring = randormstring.generate()
                const updatedData = await User.updateOne({email:email},{$set:{token:randomstring}})
                sendResetMail(userData.name,userData.email,randomstring)
                res.render('users/forgotpassword',{message2:'Please check your mail to rest your password'})
            }

        }else{
            res.render('users/forgotpassword',{message:'User email is incorrect'})
        }

    }catch(error){
        console.log(error.message);
        res.render('users/500')
    }
}

const forgetPasswordLoad = async(req,res)=>{
    try{
        const token = req.query.token
        const tokenData = await User.findOne({token:token})
        if(tokenData){
            res.render('users/resetPassword',{user_id:tokenData._id})

        }else{
            res.render('404',{message:"token is invalid"})
        }

    }catch(error){
        console.log(error.message);
        res.render('users/500')

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
        res.render('users/500')
    }
}
const loadShop = async (req, res) => {
    try {
      const category = req.query.categoryId;
      const search = req.query.search || "";
      const sort = req.query.sort || "";
      console.log(category + " - " + search + " - " + sort);
      let isRender = false;
      let user = false
      if(req.session.user_id){
        user=true
      }
      if (req.query.isRender) {
        isRender = true;
      }
  
      const searchData = new String(search).trim();
  
      const query = {
        is_delete: false,
      };
  
      let sortQuery = { price: 1 };
      if (sort == "high-to-low") {
        sortQuery = { price: -1 };
      }
  
      if (search) {
        query["$or"] = [
          { product_name: { $regex: ".*" + searchData + ".*", $options: "i" } },
        //   { description: { $regex: searchData, $options: "i" } },
        ];
      }
      console.log(category);
      if (category) {
 
            query["$or"] = [{ category: category }];
        
      }
  
      const product = await Product.find(query).sort(sortQuery);
  
      //console.log(product);
  
      const productsPerPage = 3;
      const page = req.query.page || 1;
      const startIndex = (page - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      const pageProducts = product.slice(startIndex, endIndex);
      const totalPages = Math.ceil(product.length / productsPerPage);
      // console.log(
      //   page +
      //     " - " +
      //     startIndex +
      //     " - " +
      //     endIndex +
      //     " - " +
      //     pageProducts +
      //     " - " +
      //     totalPages
      // );
      // -----------Category finding
      const categoryData = await Category.find({});
      const materialData = await Material.find()
  
      // ----------------------
  
      if (isRender == true) {
        res.json({
          pageProducts,
          totalPages,
          currentPage: parseInt(page, 10),
          product,
          user,
          // cartCount,
          // wishListCount
        });
      } else {
        res.render("users/shop1", {
          pageProducts,
          totalPages,
          currentPage: parseInt(page, 10),
          product,
          categoryData,
          materialData,
          user,
        });
      }
    } catch (error) {
        res.render('users/500')
      console.log(error.message);
      console.log("------------------Product Page Section-----------");
    }
  };

// const loadShop = async(req,res) => { 
//     try{
//         console.log("'hai");
//         const category = req.query.categoryId;
//         const search = req.query.search || "";
//         const sort = req.query.sort || "";
//         console.log(category + "-" +search + "-" + sort);
//         console.log("hoi");
//         let isRender = false;

//         if(req.query.isRender) {
//             isRender = true ;
//         }
//         const searchData = new stringify(search).trim()
//         const query = {
//             is_delete:false,
//         };
//         let sortQuery = {price: 1};
//         if(sort == "high-to-low"){
//             sortQuery = { price: -1};
//         }
//         if (search) {
//             query["$or"] = [
//                 {product_name:{ $regex: ".*" + searchData + ".*", $options: "i"} },
//                 {description:{$regex: searchData , $options: "i"} },
//             ];
//         }

//         if(category) {
//             query["$or"] = [{ mainCategory: category }]
//         }
//         const productData = await Product.find(query).sort(sortQuery);

//         const productsPerPage = 5;
//         const page = req.query.page || 1;
//         const startIndex = (page - 1) * productsPerPage;
//         const endIndex = startIndex + productsPerPage;
//         const pageProducts = productData.slice(startIndex,endIndex);
//         const countProduct = Math.ceil(productData.length/productsPerPage)
//         const categoryData = await Category.find({})
//         const materialData = await Material.find()



//         if (isRender == ture){
//             res.json({
//                 pageProducts,
//                 countProduct,
//                 currentPage : parseInt(page,10),
//                 productData
//             })
//         }else{
//             res.render("users/shop",{
//                 pageProducts,
//                 countProduct,
//                 cuurentPage: parseInt(page,10),
//                 productData,
//                 categoryData
//             })
//         }
//         if(req.session.user_id){
//             const user = true
//             let page = 1
//         if(req.query.page){
//             page = req.query.page
//         }
//         let limit = 3

//         const categoryData = await Category.find()
//         const productData = await Product.find()
//             .limit(limit*1)
//             .skip((page - 1)* limit)
//             .exec()
//         const productCount = await Product.find().countDocuments()
//         let countProduct = Math.ceil(productCount/limit)
//         const materialData = await Material.find()
//         res.render('users/shop1',{categoryData,productData,materialData,countProduct,user})
//         }else{
//             const user = false
//             let page = 1
//         if(req.query.page){
//             page = req.query.page
//         }
//         let limit = 3

//         const categoryData = await Category.find()
//         const productData = await Product.find()
//             .limit(limit*1)
//             .skip((page - 1)* limit)
//             .exec()
//         const productCount = await Product.find().countDocuments()
//         let countProduct = Math.ceil(productCount/limit)
//         const materialData = await Material.find()
//         res.render('users/shop1',{categoryData,productData,materialData,countProduct,user})
//         }
        

//     }catch(error){
//         res.render('users/500')
//         console.log(error.mesage);
//     }
// }
const loadMaterialShop= async (req,res) =>{
    try{
        const material = req.query.categoryId;
        const search = req.query.search || "";
        const sort = req.query.sort || "";
        const materialId = req.params.id
        console.log(materialId);
        console.log(material + " - " + search + " - " + sort);
        let isRender = false;
        let user = false
        if(req.session.user_id){
          user=true
        }
    
        if (req.query.isRender) {
            console.log(isRender);
          isRender = true;
        }
    
        const searchData = new String(search).trim();
        console.log(searchData,"data");
        console.log("hello");
        const query = {
          list: false,
          material:materialId
  
        };
    
        let sortQuery = { price: 1 };
        if (sort == "high-to-low") {
          sortQuery = { price: -1 };
        }
    
        if (search) {
          query["$or"] = [
            { product_name: { $regex: ".*" + searchData + ".*", $options: "i" } }
          //   { description: { $regex: searchData, $options: "i" } },
          ];
        }
        console.log(material);
        if (material) {
   
              query["$or"] = [{ material: material }];
          
        }
        console.log(query);
        const product = await Product.find(query).sort(sortQuery);
    
        console.log(product,"h");
    
        const productsPerPage = 3;
        const page = req.query.page || 1;
        const startIndex = (page - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const pageProducts = product.slice(startIndex, endIndex);
        const totalPages = Math.ceil(product.length / productsPerPage);
  
        // -----------Category finding
        const categoryData = await Category.find({});
        const materialData = await Material.find()
    
        // ----------------------
    
        if (isRender == true) {
            console.log("kooi");
          res.json({
            pageProducts,
            totalPages,
            currentPage: parseInt(page, 10),
            product,
            user,
          });
        } else {
          res.render("users/materialShop1", {
            pageProducts,
            totalPages,
            currentPage: parseInt(page, 10),
            product,
            categoryData,
            materialData,
            user,
          });
        }



        // if(req.session.user_id){
        //     const user = true
        //     const materialId=req.params.id
        // let page = 1
        // if(req.query.page){
        //     page = req.query.page
        // }
        // let limit = 3

        
        // const productMaterial = await Product.find({material:materialId})
        //     .limit(limit*1)
        //     .skip((page - 1)* limit)
        //     .exec()
        // const productCount = await Product.find({material:materialId}).countDocuments()
        // let countProduct = Math.ceil(productCount/limit)
        // const categoryData = await Category.find()
        // const materialData = await Material.find()
        // res.render('users/materialShop',{productMaterial,categoryData,materialData,countProduct,user})
        // }else{
        //     const user = false
        //     const materialId=req.params.id
        // let page = 1
        // if(req.query.page){
        //     page = req.query.page
        // }
        // let limit = 3

        
        // const productMaterial = await Product.find({material:materialId})
        //     .limit(limit*1)
        //     .skip((page - 1)* limit)
        //     .exec()
        // const productCount = await Product.find({material:materialId}).countDocuments()
        // let countProduct = Math.ceil(productCount/limit)
        // const categoryData = await Category.find()
        // const materialData = await Material.find()
        // res.render('users/materialShop',{productMaterial,categoryData,materialData,countProduct,user})
        // }
        

    }catch(error){
        res.render('users/500')
        console.log(error.message);
    }
}
const loadShopCategory = async (req,res) =>{
    try{
        const category = req.query.categoryId;
      const search = req.query.search || "";
      const sort = req.query.sort || "";
      const categoryId = req.params.id
      console.log(category + " - " + search + " - " + sort);
      let isRender = false;
      let user = false
      if(req.session.user_id){
        user=true
      }
  
      if (req.query.isRender) {
        isRender = true;
      }
  
      const searchData = new String(search).trim();
  
      const query = {
        list: false,
        category:categoryId

      };
  
      let sortQuery = { price: 1 };
      if (sort == "high-to-low") {
        sortQuery = { price: -1 };
      }
  
      if (search) {
        query["$or"] = [
          { product_name: { $regex: ".*" + searchData + ".*", $options: "i" } },
        //   { description: { $regex: searchData, $options: "i" } },
        ];
      }
      console.log(category);
      if (category) {
 
            query["$or"] = [{ category: category }];
        
      }
  
      const product = await Product.find(query).sort(sortQuery);
  
      //console.log(product);
  
      const productsPerPage = 3;
      const page = req.query.page || 1;
      const startIndex = (page - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      const pageProducts = product.slice(startIndex, endIndex);
      const totalPages = Math.ceil(product.length / productsPerPage);

      // -----------Category finding
      const categoryData = await Category.find({});
      const materialData = await Material.find()
  
      // ----------------------
  
      if (isRender == true) {
        res.json({
          pageProducts,
          totalPages,
          currentPage: parseInt(page, 10),
          product,
          user,
        });
      } else {
        res.render("users/categoryShop1", {
          pageProducts,
          totalPages,
          currentPage: parseInt(page, 10),
          product,
          categoryData,
          materialData,
          user,
        });
      }




        // if(req.session.user_id){
        //     const user = true
        //     const catId=req.params.id
        //         let page = 1
        //     if(req.query.page){
        //         page = req.query.page
        //     }
        //     let limit = 3

            
        //     const productCate = await Product.find({category:catId})
        //         .limit(limit*1)
        //         .skip((page - 1)* limit)
        //         .exec()
        //     const productCount = await Product.find({category:catId}).countDocuments()
        //     let countProduct = Math.ceil(productCount/limit)
        //     const categoryData = await Category.find()
        //     const materialData = await Material.find()
        //     res.render('users/categoryShop',{productCate,categoryData,materialData,user,countProduct})

        // }else{
        //     const user = false
        //     const catId=req.params.id
        //     let page = 1
        //     if(req.query.page){
        //         page = req.query.page
        //     }
        //     let limit = 3

            
        //     const productCate = await Product.find({category:catId})
        //         .limit(limit*1)
        //         .skip((page - 1)* limit)
        //         .exec()
        //     const productCount = await Product.find({category:catId}).countDocuments()
        //     let countProduct = Math.ceil(productCount/limit)
        // const categoryData = await Category.find()
        // const materialData = await Material.find()
        // res.render('users/categoryShop',{productCate,categoryData,materialData,user,countProduct})

        // }
        

    }catch(error){
        res.render('users/500')
        console.log(error.message);
    }
}
const loadProfile = async (req,res) => {
    try{
        const userId = req.session.user_id
        const userData = await User.findOne({_id:userId})
        const address = await Address.findOne({userId:req.session.user_id})
        res.render('users/profile',{userData})
        
    }catch(error){
        res.render('users/500')
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
        res.redirect('/profile')

    }catch(error){ 
        res.render('users/500')
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
            res.render('users/singleProductView',{product,relatedProduct,user})
        }else{
            const user = false
            const id=req.params.id
        const product = await Product.findOne({_id:id}).populate('category').exec()
        const categoryId = product.category
        const relatedProduct = await Product.find({category:categoryId})
        res.render('users/singleProductView',{product,relatedProduct,user})
        }
        

    }catch(error){
        res.render('users/500')
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
    loadShopCategory,
    loginOtp,
    verifyNum,
    verifyNumOtp,
    loadProfile,
    loadSingleProduct,
    loadShop,
    updateUserData,
    loadMaterialShop,
    loadOtp,
    searchProducts
}


