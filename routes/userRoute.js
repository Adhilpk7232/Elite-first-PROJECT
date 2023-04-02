const express= require('express')
const route = express()
const path = require('path')
const bodyparser = require('body-parser')
route.use(bodyparser.json())
route.use(bodyparser.urlencoded({extended:true}))

route.set('view engine','ejs')
route.set('views','./views/users')
const auth = require('../middleware/auth')
const config = require('../config/config')

const nocache =require('nocache')
route.use(nocache())
const session = require('express-session')

route.use(session({secret:config.sessionSecret,
    saveUninitialized:true,
    cookie:{maxAge:60000*1000},
    resave:false    
}))

const userController = require('../controller/userController')
const  sessionSecret  = require('../config/config')

//Landing Page
route.get('/',auth.isLogout,userController.loadLandingPage)
//user registeration
route.get('/register',auth.isLogout ,userController.loadSignup)
route.post('/register',userController.insertUser)
route.get('/verify',userController.verifyMail)


///otp mobile verification
route.get('/mobileCheck',auth.isLogout,userController.mobileCheck)
route.post('/mobileCheck',userController.verifyPhone)
route.post('/otp',userController.verifyOtp)
//user login
route.get('/login',auth.isLogout,userController.loginLoad)
route.post('/login',userController.verifyLogin)

///login OTP
route.get('/loginOtp',userController.loginOtp)
route.post('/loginOtp',userController.verifyNum)
route.get('/loginOtpverify',userController.loadOtp)
route.post('/loginOtpverify',userController.verifyNumOtp)

route.get('/logout',userController.userLogout)
//user forgot password
route.get('/forget',auth.isLogout,userController.forgetLoad)
route.post('/forget',userController.forgetVerify)
route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad)
route.post('/forget-password',userController.resetPassword)
// Render Home Page dynamically
route.get('/home',auth.isLogin,userController.loadHome)

route.post('/getProducts',userController.searchProducts)
///Cart
route.post('/add-to-cart',auth.isLogin,userController.AddToCart)
route.get('/cart',auth.isLogin,userController.loadCart)
route.post('/delete-cart-product',userController.deleteCartProduct)
route.post('/change-quantity',userController.change_Quantities)
//Wishlist
route.get('/wishlist',auth.isLogin,userController.loadWhishlist)
route.post('/add-to-wishlist',auth.isLogin,userController.AddToWishlist)
route.post('/remove-wishlist',auth.isLogin,userController.deleteWishlistProduct)
route.post('/wishlistToCart',auth.isLogin,userController.wishlistToCart)
///produvt views
route.get('/shop',userController.loadShop)
route.get('/material-shop/:id',userController.loadMaterialShop)

route.get('/shopCategory/:id',userController.loadShopCategory)
route.get('/single-product/:id',auth.isLogin,userController.loadSingleProduct)
//user profile 
route.get('/profile',auth.isLogin,userController.loadProfile)
route.post('/updateUserData',auth.isLogin,userController.updateUserData)
//profile address
route.get('/profile-address',auth.isLogin,userController.loadProfileAddress)
route.post('/add-address',auth.isLogin,userController.insertAddress)
route.post('/edit-update-address/:addressIndex',auth.isLogin,userController.updateAddress)
route.get('/delete-address/:id/:adrsId',userController.DeleteAddress)

route.get('/edit-address/:id/:adrsId',auth.isLogin,auth.isLogin,userController.editAddress)
route.post('/add-address-checkOut',auth.isLogin,userController.addAddressCheckout)
//profile order
route.get('/profile-order',auth.isLogin,userController.loadOrderHistory)
route.get('/orderlist',auth.isLogin,userController.orderList)
route.get('/ordered-products',auth.isLogin,userController.orderedProducts)
route.get("/cancel",auth.isLogin,userController.cancelOrder)
route.get("/return",auth.isLogin,userController.returnOrder)
///order
route.get('/checkout',auth.isLogin,userController.loadCheckout)
route.post('/coupon-apply',auth.isLogin,userController.couponApply)
route.post('/place-order',auth.isLogin,userController.placeOrder)
route.post('/verify-payment',auth.isLogin,userController.verifyPayment)
route.get('/ordersuccess',auth.isLogin,userController.orderSuccess)

route.get('/img',function(req,res){
    res.render('img')
})



        
module.exports = route