import { Video } from "../models/video.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const uploadVideo = asyncHandler(async(req,resp)=>{
    const userId = req?.user._id;
    if(!userId){
        throw new apiError(401,"Unauthorized Uploading");
    }

    const {title,description} = req.body;

    if(!title || title.trim() === ""){
        throw new apiError(400,"Title is required to upload Video");
    }
    if(!description || description.trim() === ""){
        throw new apiError(400,"Description is required to upload Video");
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if(!videoFileLocalPath){
        throw new apiError(400,"VideoFile is required");
    }

    if(!thumbnailLocalPath){
        throw new apiError(400,"ThumbNail is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoFile){
        throw new apiError(500,"Something went wrong while uploading videoFile");
    }

    if(!thumbnail){
        throw new apiError(500,"Something went wrong while uploading thumbNail");
    }
    console.log(videoFile);

    const video = await Video.create({
        title,
        description,
        videoFile:videoFile.secure_url,
        thumbnail:thumbnail.secure_url,
        duration:videoFile.duration,
        isPublished:true,
        owner:userId
    })
    if(!video){
        throw new apiError(500,"Something went wrong while uploading the Video");
    }
    return resp.status(200).json(
        new apiResponse(200,video,"Video Created Successfully")
    );

})

const getAllVideos = asyncHandler(async(req,resp)=>{
    
        const userId = req?.user._id;   
        if(!userId){
            throw new apiError(400,"Unauthorized access inside Controller");
        }
    
        const videos = await Video.find({isPublished:true});
    
        if(!videos){
            throw new apiError(400,"No Video Found");
        }
    
        return resp.status(200).json(
            new apiResponse(200,videos,"All videos fetched successfully")
        );
    
   
})

const getVideo = asyncHandler(async(req,resp)=>{
   
        const userId = req?.user._id;
        if(!userId){
            throw new apiError(400,"Unauthorized acces inside controller");
        }
        const videoId = req.params?.id;
        if(!videoId){
            throw new apiError(400,"Video Id is required");
        }
        if(!mongoose.isValidObjectId(videoId)){
            throw new apiError(401,"Invalid Video Id");
        }

        const video = await Video.findOne({_id:videoId,isPublished:true});
    
        if(!video){
            throw new apiError(404,"Video Not Found");
        }
    
        return resp.status(200).json(
            new apiResponse(200,video,"Video fetched successfully")
        );
   


})

const updateVideoFile = asyncHandler(async(req,resp)=>{

})

const updateThumbnail = asyncHandler(async(req,resp)=>{

})

const updateVideoInfo = asyncHandler(async(req,resp)=>{

})

const togglePublishStatus = asyncHandler(async(req,resp)=>{

    
        const userId = req?.user._id;
        if(!userId){
            throw new apiError(400,"Unauthorized access in controller");
        }
    
        const videoId = req.params?.id;
    
        if(!videoId){
            throw new apiError(401,"Video Id is required");
        }
        if(!mongoose.isValidObjectId(videoId)){
            throw new apiError(401,"Video Id is Invalid");
        }
    
        const video = await Video.findOne({_id:videoId});
        if(!video){
            throw new apiError(404,"Video not found");
        }
        console.log(userId);
        console.log(video.owner);
        console.log(userId.toString() === video.owner.toString())
        if(userId.toString() !== video.owner.toString()){
            throw new apiError(401,"You are not valid to update Video");
        }
       // const isPub = 
        const updatedVideo = await Video.findByIdAndUpdate(videoId,{
            $set:{
                isPublished:!video.isPublished
            }
        },{
            new:true
        })
    
        if(!updatedVideo){
            throw new apiError(404,"Video not found");
        }
    
        return resp.status(200).json(
            new apiResponse(200,updatedVideo,"Video is Published Status Toggles Successfully")
        )
   

})

const deleteVideo = asyncHandler(async(req,resp)=>{

})




export {uploadVideo,getAllVideos,getVideo,updateVideoFile,updateThumbnail,updateVideoInfo,togglePublishStatus,deleteVideo}