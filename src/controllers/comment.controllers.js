import { Comment } from "../models/comment.models.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getComment = asyncHandler(async(req,resp)=>{

});

const getComments = asyncHandler(async(req,resp)=>{

})

const postComment = asyncHandler(async(req,resp)=>{

    const userId = req?.user._id;
    if(!userId){
        throw new apiError(401,"Unauthorized Access inside Controller");
    }

    const videoId = req.params?.videoId;
    if(!videoId){
        throw new apiError(400,"VideoId is required to Post Comment");
    }

    const {content} = req.body;
    if(!content || content.trim() === ""){
        throw new apiError(400,"Content is required to Post Comment");
    }

    const comment = await Comment.create({
        content,
        video:videoId,
        owner:userId,
    })

    if(!comment){
        throw new apiError(500,"Something went wrong while Posting Comment");
    }

    return resp.status(200).json(
        new apiResponse(200,comment,"Comment Created Successfully")
    );

})

const updateComment = asyncHandler(async(req,resp)=>{
   
})

const updateLikeOnComment = asyncHandler(async(req,resp)=>{

})

const deleteComment = asyncHandler(async(req,resp)=>{

})

export {getComment,getComments,postComment,updateComment,updateLikeOnComment,deleteComment};