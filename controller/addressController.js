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

// USER SIDE 
const loadProfileAddress = async (req,res) => {
    try{
        const userId = req.session.user_id
        const userData = await User.findOne({_id:userId})
        const address = await Address.findOne({userId:userId})
        res.render('users/profileAdress',{address,userData})
        
    }catch(error){
        res.render('uses/500')
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
                const newAddress=await Address.findOne({userId:userId}).populate('userId').exec()
                newAddress.userAddresses.push(AddressObj)
                await newAddress .save().then((resp)=>{
                    res.redirect('/profile')
                }).catch((err) => { 
                    res.send(err)
                })
                console.log(userAdrs);
                
            }else{
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
        res.render('uses/500')
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
        res.render('users/profileAddressEdit',{editAddress,addressIndex})


    }catch(error){
        res.render('uses/500')
        console.log(error.message);
    }
}
const updateAddress = async(req,res) =>{
    try{
        const addressIndex = req.params.addressIndex
        const editData = { ...req.body }
        const userId = req.session.user_id
        const updateAdrs = await Address.findOne({userId})
        updateAdrs.userAddresses[addressIndex]= {...editData}
        await updateAdrs.save()
        res.redirect('/profile')

    
    }catch(error){
        res.render('uses/500')
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
        res.render('uses/500')
        console.log(error.message);
    }
}
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
                const userAdrs=await Address.findOne({userId:userId}).populate('userId').exec()
                userAdrs.userAddresses.push(AddressObj)
                await userAdrs .save().then((resp)=>{
                    res.redirect('/checkout')
                }).catch((err) => { 
                    res.send(err)
                })
                console.log(userAdrs);
                
            }else{
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
        res.render('uses/500')
        console.log(error.message);
    }
}

module.exports = {
    insertAddress,
    editAddress,
    updateAddress,
    DeleteAddress,
    addAddressCheckout,
    loadProfileAddress,
} 