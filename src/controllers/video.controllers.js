import { Video } from "../models/video.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
    console.log(thumbnail.secure_url)
    console.log(video.thumbnail)
    return resp.status(200).json(
        new apiResponse(200,video,"Video Created Successfully")
    );

})

export {uploadVideo}