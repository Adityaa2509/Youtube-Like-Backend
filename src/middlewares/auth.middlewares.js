import { User } from "../models/user.models.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
export const verifyJWT = asyncHandler(async(req,response,next)=>{
     
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
         console.log("Authentication middleware: ",token); 
         console.log(req.cookies)
        if(!token){
            throw new apiError(401,"unauthorized access, token is missing");
        }
       
        //verify the token
        const decodedTokenInformation = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedTokenInformation?._id).
                                select("-password -refreshToken");
    
        if(!user){
            throw new apiError(401,"Invalid access token");
        }
    
        req.user = user;
        next();
    
    } catch (error) {
        throw new apiError(401,error?.message || "Invalid Access token");
    }
})