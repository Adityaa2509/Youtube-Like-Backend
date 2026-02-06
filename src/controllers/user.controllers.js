import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { apiError } from "../utils/apiError.js";
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";

const registerUser =  asyncHandler(async(req,resp)=>{

    //fetch data from client 
    const {username,email,fullName,password} = req.body;
    console.log(email,password,username,fullName);

    //validate the data -- not empty
    if([fullName,email,password,username].some((field)=>{
        return field?.trim() === ""
    })){
        throw new apiError(400,"All fields are required");
    }

   

    //check if user already exits:username and email both
    const existingUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existingUser){
        throw new apiError(409,"User with email or username already exits")
    }
    

    //check for images,check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    if(avatarLocalPath){
        throw new apiError(400,"Avatar is requrired");
    }

    //upload images to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    const coverImage="";
    if(coverImageLocalPath)
    coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError(500,"Error while uploading avatar image");
    }
    //create user object -- create entry in db
    const user = await User.create({
        fullName,
        email,
        username:username.toLowerCase(),
        avatar,
        coverImage,
        password
    })
    
    //check for user creation
    const userCreated = await User.findById(user._id).select("-password -refreshToken");
    if(!userCreated){
        throw new apiError(500,"Something went wrong while registering the user");
    }

    //remove password and refresh token field from the response
    //done 
    //return resp
    

    return resp.status(201).json(
        new apiResponse(201,userCreated,"User Registered Successfully",)
    )


})

const loginUser =  asyncHandler(async(req,resp)=>{
    resp.status(200).json({
        message: "Ok"
    })
})

export {registerUser,loginUser}