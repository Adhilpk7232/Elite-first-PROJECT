const express = require("express")
const router = express.Router()
// const path = require('path')
const auth = require('../middleware/adminAuth')
// const config = require("../config/config")
// const multer =require('multer')
const{upload,categoryMulter,bannerMult}=require('../multers/multer')
// const fs = require('fs')
const adminController = require("../controller/adminController")
const brandController = require('../controller/brandController')
const categoryController = require('../controller/categoryController')
const productController = require('../controller/productController')
const bannerController = require('../controller/bannerController')
const orderConstroller = require('../controller/orderController')
const couponController = require('../controller/couponController')

router.get('/',auth.isLogout,adminController.loadLogin)
router.post('/',adminController.verifyLogin)
router.get('/home',auth.isLogin,adminController.loadDashboard)
router.get('/logout',adminController.adminLogout)
/////brand
router.get('/brand',auth.isLogin,brandController.loadBrand)
router.get('/addBrand',auth.isLogin,brandController.addBrand)
router.put('/addBrand',auth.isLogin,categoryMulter.single('image'),brandController.insertBrand)
router.delete('/deleteBrand',auth.isLogin,brandController.deleteBrand)
router.get('/updateBrand',auth.isLogin,brandController.loadEditBrand)
router.post('/updateBrand',auth.isLogin,brandController.UpdatedBrand)

router.get('/user',auth.isLogin,adminController.loadUserManagement)
router.patch('/block-user',auth.isLogin,auth.isLogin,adminController.blockUser)
// category 
router.get('/category',auth.isLogin,categoryController.loadCategory)
router.get('/addCategory',auth.isLogin,categoryController.AddCategorry)
router.put('/addcategory',auth.isLogin,categoryMulter.single('image'),categoryController.insertCategory)
router.delete('/deleteCategory',auth.isLogin,categoryController.DeleteCategory)
router.get('/updateCategory',auth.isLogin,categoryController.UpdateCategory)
router.post('/updateCategory',auth.isLogin,categoryController.UpdatedCategory)
// product 
router.get('/addProduct',auth.isLogin,productController.AddProduct)
router.post('/addProduct',auth.isLogin,upload.array('image'),productController.InertProduct)
router.get('/product',auth.isLogin,productController.loadProduct)
router.get('/edit-product/:id',auth.isLogin,productController.EditProduct)
router.post('/edit-product/:id',auth.isLogin,productController.UpdateProduct)

router.post('/edit-image/:id',auth.isLogin,upload.array('image'),productController.updateImage)
router.get('/delete-product-image/:imgid/:prodid',auth.isLogin,productController.deleteImage)
router.delete('/delete-product',auth.isLogin,productController.DeleteProduct)
router.get('/view-product',auth.isLogin,productController.ViewProduct)
// offer banner 
router.get('/offer-banner',auth.isLogin,bannerController.loadOfferBanner)
router.post('/addbanner',auth.isLogin,bannerMult.single('bannerimage'),bannerController.insertBanner)
router.get('/edit-banner',auth.isLogin,bannerController.editBanner)
router.post('/edit-banner',auth.isLogin,bannerMult.single('bannerimage'),bannerController.updateBanner)
router.delete('/delete-banner',auth.isLogin,bannerController.deleteBanner)
///order
router.get('/order',auth.isLogin,orderConstroller.loadOrderlist)
router.get('/order-view',auth.isLogin,orderConstroller.loadOrderProduct)
router.get('/orderStatus-placed',auth.isLogin,orderConstroller.placedOrder)
router.get('/orderStatus-shiped',auth.isLogin,orderConstroller.shipedOrder)
router.get('/orderStatus-delivered',auth.isLogin,orderConstroller.deliveredOrder)
router.get('/orderStatus-returnSuccess',auth.isLogin,orderConstroller.orderReturnSuccess)
router.get('/orderStatus-returnCancelled',auth.isLogin,orderConstroller.orderReturnCancelled)
///coupon
router.get('/coupon',auth.isLogin,couponController.loadcoupon)
router.post('/add-coupon',auth.isLogin,couponController.addCoupon)
router.get('/editCoupon/:id',auth.isLogin,couponController.editCoupon)
router.post('/editCoupon/:id',auth.isLogin,couponController.updateCoupon)
router.delete('/deleteCoupon',auth.isLogin,couponController.DeleteCoupon)
///sales report
router.get('/sales-report',auth.isLogin,adminController.loadSales)
router.post('/show-salesreprot',auth.isLogin, adminController.listSalesReport)

// OFFER MANAGEMENT
router.get('/offerManagement',auth.isLogin,productController.loadOfferManagement)
router.post('/addOfferManagement/:id',auth.isLogin,productController.addOfferManagement)
router.delete('/deleteOfferManagement',auth.isLogin,productController.deleteOfferManagement)
router.get('/editOfferManagement/:id',auth.isLogin,productController.editOfferManagement)
router.post('/updateOffermanagement/:id',auth.isLogin,productController.updatedOfferManagement)



module.exports = router