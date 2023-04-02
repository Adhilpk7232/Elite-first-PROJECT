const express = require("express")
const router = express.Router()
const path = require('path')
const auth = require('../middleware/adminAuth')
const config = require("../config/config")
const multer =require('multer')
const{upload,categoryMulter,bannerMult}=require('../multers/multer')
const fs = require('fs')
const adminController = require("../controller/adminController")

router.get('/',auth.isLogout,adminController.loadLogin)
router.post('/',adminController.verifyLogin)
router.get('/home',auth.isLogin,adminController.loadDashboard)
router.get('/logout',adminController.adminLogout)
/////brand
router.get('/brand',auth.isLogin,adminController.loadBrand)
router.get('/addBrand',auth.isLogin,adminController.addBrand)
router.post('/addBrand',auth.isLogin,categoryMulter.single('image'),adminController.insertBrand)
router.delete('/deleteBrand',auth.isLogin,adminController.deleteBrand)
router.get('/updateBrand',auth.isLogin,adminController.loadEditBrand)
router.post('/updateBrand',auth.isLogin,adminController.UpdatedBrand)

router.get('/user',auth.isLogin,adminController.loadUserManagement)
router.get('/block-user',auth.isLogin,auth.isLogin,adminController.blockUser)
// category 
router.get('/category',auth.isLogin,adminController.loadCategory)
router.get('/addCategory',auth.isLogin,adminController.AddCategorry)
router.post('/addcategory',auth.isLogin,categoryMulter.single('image'),adminController.insertCategory)
router.get('/deleteCategory',auth.isLogin,adminController.DeleteCategory)
router.get('/updateCategory',auth.isLogin,adminController.UpdateCategory)
router.post('/updateCategory',auth.isLogin,adminController.UpdatedCategory)
// product 
router.get('/addProduct',auth.isLogin,adminController.AddProduct)
router.post('/addProduct',auth.isLogin,upload.array('image'),adminController.InertProduct)
router.get('/product',auth.isLogin,adminController.loadProduct)
router.get('/edit-product/:id',auth.isLogin,adminController.EditProduct)
router.post('/edit-product/:id',auth.isLogin,adminController.UpdateProduct)

router.post('/edit-image/:id',auth.isLogin,upload.array('image'),adminController.updateImage)
router.get('/delete-product-image/:imgid/:prodid',auth.isLogin,adminController.deleteImage)
router.get('/delete-product',auth.isLogin,adminController.DeleteProduct)
router.get('/view-product',auth.isLogin,adminController.ViewProduct)
// offer banner 
router.get('/offer-banner',auth.isLogin,adminController.loadOfferBanner)
router.post('/addbanner',auth.isLogin,bannerMult.single('bannerimage'),adminController.insertBanner)
router.get('/edit-banner',auth.isLogin,adminController.editBanner)
router.post('/edit-banner',auth.isLogin,bannerMult.single('bannerimage'),adminController.updateBanner)
router.get('/delete-banner',auth.isLogin,adminController.deleteBanner)

///order
router.get('/order',auth.isLogin,adminController.loadOrderlist)
router.get('/order-view',auth.isLogin,adminController.loadOrderProduct)
router.get('/orderStatus-placed',auth.isLogin,adminController.placedOrder)
router.get('/orderStatus-shiped',auth.isLogin,adminController.shipedOrder)
router.get('/orderStatus-delivered',auth.isLogin,adminController.deliveredOrder)
router.get('/orderStatus-returnSuccess',auth.isLogin,adminController.orderReturnSuccess)
router.get('/orderStatus-returnCancelled',auth.isLogin,adminController.orderReturnCancelled)


///coupon
router.get('/coupon',auth.isLogin,adminController.loadcoupon)
router.post('/add-coupon',auth.isLogin,adminController.addCoupon)
router.get('/editCoupon/:id',auth.isLogin,adminController.editCoupon)
router.post('/editCoupon/:id',auth.isLogin,adminController.updateCoupon)
router.get('/deleteCoupon/:id',auth.isLogin,adminController.DeleteCoupon)
///sales report
router.get('/sales-report',auth.isLogin,adminController.loadSales)
router.post('/show-salesreprot',auth.isLogin, adminController.listSalesReport)



module.exports = router