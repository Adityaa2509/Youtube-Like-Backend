import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { apiError } from "../utils/apiError.js";
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async(userId)=>{
    try{

        const user = await User.findById(userId);
        
        const refreshToken = await user.generateRefreshToken();
        const accessToken = await user.generateAccessToken();

        user.refreshToken = refreshToken;
        
        await user.save({validateBeforeSave: false});

        console.log("genrating the token in Login: ",user);
        console.log("Access Token in gNERATE fUNCTION, ",accessToken);
        console.log("Refresh Token in Generate Token: ",refreshToken);
        return {accessToken,refreshToken};

    }catch(err){
        throw new apiError(500,"Error while generating access token and refresh token.");
    }
}




const registerUser =  asyncHandler(async(req,resp)=>{

    //fetch data from client 
    console.log("Requesting: ",req.body)
    if(!req.body){
        throw new apiError(400,"All Fieds are required");
    }
    const {username,email,fullName,password} = req.body;
    console.log(email,password,username,fullName);

    //validate the data -- not empty
    if(!fullName ||fullName.trim() === ""){
        throw new apiError(400,"Full Name is required");
    }
    if(!email || email.trim() === ""){
        throw new apiError(400,"Email is required");
    }
    if(!username || username.trim() === ""){
        throw new apiError(400,"Username is required");
    }
    if(!password || password.trim() === ""){
        throw new apiError(400,"Password is required");
    }

    //check for images,check for avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    console.log(avatarLocalPath)
    if(!avatarLocalPath){
        throw new apiError(400,"Avatar is requrired");
    }
    
    //upload images to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    let coverImage="";
    if(coverImageLocalPath)
    coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log(avatar)
    if(!avatar){
        throw new apiError(500,"Error while uploading avatar image");
    }
   

    //check if user already exits:username and email both
    const existingUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existingUser){
        throw new apiError(409,"User with email or username already exits")
    }
    

    
    //create user object -- create entry in db
    console.log("will be creating user")

    
    const user = await User.create({
        fullName,
        email,
        username:username.toLowerCase(),
        avatar,
        coverImage,
        password
    })
    console.log("user1: ",user);
    
    //check for user creation
    const userCreated = await User.findById(user._id).select("-password -refreshToken");
    if(!userCreated){
        throw new apiError(500,"Something went wrong while registering the user");
    }
    console.log("User2 :",userCreated);
    //remove password and refresh token field from the response
    //done 
    //return resp
    

    return resp.status(201).json(
        new apiResponse(201,userCreated,"User Registered Successfully")
    )


})

const loginUser =  asyncHandler(async(req,resp)=>{
    //fetch data from client--> username/email and password
    if(!req.body){
        throw new apiError(400,"All fields are required");
    }

    const {email,password} = req.body;
    
    //validate the data
    if(!email || email.trim() === ""){
        throw new apiError(400,"Email is required");
    }
    if(!password || password.trim() === ""){
        throw new apiError(400,"Password is required");
    }

    //check user exists
    const user = await User.findOne({email});
    if(!user){
        throw new apiError(404,"User not found with this email");
    }
    
    //match password
    const isMatch = await user.isPasswordMatch(password);
    if(!isMatch){
        throw new apiError(401,"Invalid credentials");
    }

    //generate access token and refresh token
   const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    //store access token in client cookie and db
    const options = {
        httpOnly: true,
        secure: true
    }

    return resp.status(200)
                .cookie("accessToken",accessToken,options)
                .cookie("refreshToken",refreshToken,options)
                .json(new apiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken
                    },
                    "User logged in successfully"
                ))

})

const logoutUser = asyncHandler(async(req,resp)=>{
 
    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(userId,
        {
            $set:{
                refreshToken: ""
            }
        },{
            new:true
        }
    )
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return resp.
           status(200).
           clearCookie("accessToken",options).
           clearCookie("refreshToken",options).
           json(new apiResponse(200,{},"User Loggs out successfully"))
})


const refreshAccessToken = asyncHandler(async(req,resp)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken || req.header("Authorization")?.replace("Bearer ","");

    if(!incomingRefreshToken){
        throw new apiError(401,"Unauthorized Access");
    }


    try {
        const decoded = await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decoded._id);
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new apiError(401,"Invalid refersh Token,expired or used");
        }
    
    
        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
        
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return resp.status(200)
                   .cookie("accessToken",accessToken,options)
                   .cookie("refreshToken",refreshToken,options)
                   .json(new apiResponse(200,{
                    user,
                    accessToken,
                    refreshToken
                   },"Access token refreshed successfully"))
    
    } catch (error) {
        throw new apiError(401,error.message || "Invalid refresh token");
    }

})

export {registerUser,loginUser,logoutUser,refreshAccessToken}