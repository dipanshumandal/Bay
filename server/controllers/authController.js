const User = require("../models/User")
//json web token
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt");
const { generateAccessToken } = require("../helpers/accessToken");
const { generateRefreshToken } = require("../helpers/refreshToken");

const signup=async(req,res)=>{
    const {username,email,password,accountType} =req.body;

    try{
        let user= await User.findOne({username});
        if(user){
            return res.status(400).json({success:false, message:"Username Already in Use"})
        }
        const securePassword=await bcrypt.hash(password,10)

        user =new User({
            username,
            email,
            password:securePassword,
            accountType,
        });
        await user.save();

        return res.status(201).json({success:true, message:"User Created Success"})
    } catch(error){
        return res.status(500).json({success:false, message:error.message})
    }
};

const login =async(req,res)=>{
    const {email,password}=req.body
    try {
        let user=await User.findOne({email})
        if(!user){
            return res.status(400).json({success:false, message:'Please Signup'})
        }
        const comparePassword =await bcrypt.compare(password,user.password)
        if(!comparePassword) return res.status(400).json({success:false, message:'Invalid Credentials '})
        
        const data={
            id:user._id,
            accountType:user.accountType,
            author:user.username,
        };

        const accessToken=generateAccessToken(data);
        const refreshToken=generateRefreshToken(data);

        // console.log(accessToken);
        // console.log(refreshToken);

        return res.status(200).json({
            success:true,
            message:"Login Successfull",
            accessToken,
            refreshToken,
            role:user.accountType,
            author:user.username,
        })
    } catch (error) {
        return res.status(500).json({success:false,message:error.message})
    }
};


module.exports={login,signup}