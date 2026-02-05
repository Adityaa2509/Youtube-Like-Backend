import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"


const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique: true,
        required:  [true,"Username is required"],
        lowercase: true,
        trim: true,
        index: true
    },
    email:{
        type:String,
        unique: true,
        required:  [true,"Email is required"],
        lowercase: true,
        trim: true,
    },
    fullName:{
        type:String,
        required:  [true,"Full name is required"],
        trim: true,
        index: true
    },
    avatar:{
        type:String,//Cloudinary URL
        required:[true,"Avatar is required"]
    },
    coverImage:{
        type:String,

    },
    password:{
        type:String,
        required: [true,"Password is required"]
    },
    refreshToken:{
        type:String,
        
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ]

},{timestamps: true});

userSchema.pre("save",async function (next){

    if(!this.isModified("password"))return ;
    
    this.password = await bcrypt.hash(this.password,10);
    next();
    
})

userSchema.methods.isPasswordMatch = async function (password){
    return await bcrypt.compare(password,this.password) 
}

userSchema.methods.generateAccessToken = async function(){
    const payload = {
        _id : this._id,
        email : this.email,
        username : this.username,
        fullName : this.fullName
    } 
    
    return jwt.sign(payload,
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY});
}

userSchema.methods.generateRefreshToken  = async function(){

    return jwt.sign({
        _id: this._id
    },process.env.REFRESH_TOKEN_SECRET,
{expiresIn: process.env.REFRESH_TOKEN_EXPIRY})
}

export const User = mongoose.model("User",userSchema);
