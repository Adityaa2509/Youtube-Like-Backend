import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { apiError } from "../utils/apiError.js";
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";

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
    resp.status(200).json({
        message: "Ok"
    })
})

export {registerUser,loginUser}