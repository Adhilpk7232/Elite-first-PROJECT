const express = require("express")
const router = express()
const path = require('path')
const auth = require('../middleware/adminauth')
const session = require("express-session")

const config = require("../config/config")
const multer =require('multer')

const{upload,categoryMulter,bannerMult}=require('../multers/multer')
const fs = require('fs')

// const auth = require('../middleware/adminAuth')

const bodyParser = require("body-parser")
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))


router.set('view engine','ejs')
router.set('views','./views/admin')

const adminController = require("../controller/adminController")
// const { verifyLogin } = require("../controllers/userController")

router.get('/',adminController.loadLogin)
router.post('/',adminController.verifyLogin)
router.get('/home',adminController.loadDashboard)
/////brand
router.get('/brand',adminController.loadBrand)
router.get('/addBrand',adminController.addBrand)
router.post('/addBrand',categoryMulter.single('image'),adminController.insertBrand)
router.delete('/deleteBrand',adminController.deleteBrand)
router.get('/updateBrand',adminController.loadEditBrand)
router.post('/updateBrand',adminController.UpdatedBrand)

router.get('/user',adminController.loadUserManagement)
router.get('/block-user',auth.isLogin,adminController.blockUser)
// category 
router.get('/category',adminController.loadCategory)
router.get('/addCategory',adminController.AddCategorry)
router.post('/addcategory',categoryMulter.single('image'),adminController.insertCategory)
router.delete('/deleteCategory',adminController.DeleteCategory)
router.get('/updateCategory',adminController.UpdateCategory)
router.post('/updateCategory',adminController.UpdatedCategory)
// product 
router.get('/addProduct',adminController.AddProduct)
router.post('/addProduct',upload.array('image'),adminController.InertProduct)
router.get('/product',adminController.loadProduct)
router.get('/edit-product/:id',adminController.EditProduct)
router.post('/edit-product/:id',adminController.UpdateProduct)

router.post('/edit-image/:id',upload.array('image'),adminController.updateImage)
router.delete('/delete-product-image/:imgid/:prodid',adminController.deleteImage)
router.get('/delete-product',adminController.DeleteProduct)
router.get('/view-product',adminController.ViewProduct)
// offer banner 
router.get('/offer-banner',adminController.loadOfferBanner)
router.post('/addbanner',bannerMult.single('bannerimage'),adminController.insertBanner)
router.get('/edit-banner',adminController.editBanner)
router.post('/edit-banner',bannerMult.single('bannerimage'),adminController.updateBanner)
router.get('/delete-banner',adminController.deleteBanner)

// router.get('/add-offerBanner',) 
///order
router.get('/order',adminController.loadOrderlist)
router.get('/order-view',adminController.loadOrderProduct)
router.get('/orderStatus-placed',adminController.placedOrder)
router.get('/orderStatus-shiped',adminController.shipedOrder)
router.get('/orderStatus-delivered',adminController.deliveredOrder)
router.get('/orderStatus-returnSuccess',adminController.orderReturnSuccess)
router.get('/orderStatus-returnCancelled',adminController.orderReturnCancelled)


///coupon
router.get('/coupon',adminController.loadcoupon)
router.post('/add-coupon',adminController.addCoupon)
router.get('/editCoupon/:id',adminController.editCoupon)
router.post('/editCoupon/:id',adminController.updateCoupon)
router.get('/deleteCoupon/:id',adminController.DeleteCoupon)
///sales report
router.get('/sales-report',adminController.loadSales)
router.post('/show-salesreprot', adminController.listSalesReport)



module.exports = router