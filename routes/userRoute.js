const express= require('express')
const route = express.Router()
// const path = require('path')
const auth = require('../middleware/auth')
// const config = require('../config/config')
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const orderController = require('../controller/orderController')
const addressController = require('../controller/addressController')
const couponController = require('../controller/couponController')


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
route.post('/add-to-cart',auth.isLogin,productController.AddToCart)
route.get('/cart',auth.isLogin,productController.loadCart)
route.post('/delete-cart-product',productController.deleteCartProduct)
route.post('/change-quantity',productController.change_Quantities)
//Wishlist
route.get('/wishlist',auth.isLogin,productController.loadWhishlist)
route.post('/add-to-wishlist',auth.isLogin,productController.AddToWishlist)
route.post('/remove-wishlist',auth.isLogin,productController.deleteWishlistProduct)
route.post('/wishlistToCart',auth.isLogin,productController.wishlistToCart)
///produvt views
route.get('/shop',userController.loadShop)
route.get('/material-shop/:id',userController.loadMaterialShop)
route.get('/shopCategory/:id',userController.loadShopCategory)
route.get('/single-product/:id',auth.isLogin,userController.loadSingleProduct)
//user profile 
route.get('/profile',auth.isLogin,userController.loadProfile)
route.post('/updateUserData',auth.isLogin,userController.updateUserData)
//profile address
route.get('/profile-address',auth.isLogin,addressController.loadProfileAddress)
route.post('/add-address',auth.isLogin,addressController.insertAddress)
route.post('/edit-update-address/:addressIndex',auth.isLogin,addressController.updateAddress)
route.get('/delete-address/:id/:adrsId',addressController.DeleteAddress)
route.get('/edit-address/:id/:adrsId',auth.isLogin,auth.isLogin,addressController.editAddress)
route.post('/add-address-checkOut',auth.isLogin,addressController.addAddressCheckout)
//profile order
route.get('/profile-order',auth.isLogin,orderController.loadOrderHistory)
route.get('/orderlist',auth.isLogin,orderController.orderList)
route.get('/ordered-products',auth.isLogin,orderController.orderedProducts)
route.get("/cancel",auth.isLogin,orderController.cancelOrder)
route.get("/return",auth.isLogin,orderController.returnOrder)
///order
route.get('/checkout',auth.isLogin,orderController.loadCheckout)
route.post('/coupon-apply',auth.isLogin,couponController.couponApply)
route.post('/place-order',auth.isLogin,orderController.placeOrder)
route.post('/verify-payment',auth.isLogin,orderController.verifyPayment)
route.get('/ordersuccess',auth.isLogin,orderController.orderSuccess)

// route.get('/500',(req,res) => { 
//     res.render('users/500')
// })

route.get('/img',function(req,res){
    res.render('users/img')
})



        
module.exports = route