import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getComment = asyncHandler(async(req,resp)=>{
    
   const commentId = req.params?.commentId;
   
    if(!commentId || commentId.trim() === ""){
        throw new apiError(400,"commentId is required");
    }
    if(!mongoose.isValidObjectId(commentId)){
        throw new apiError(400,"commentId VideoId");
    }

    const comment = await Comment.findOne({_id:commentId});

    if(!comment){
        throw new apiError(500,"Comment not found");
    }

    return resp.status(200).json(
        new apiResponse(200,{
            comment,     
        },"Comment fetched successfully")
    );

});

const getComments = asyncHandler(async(req,resp)=>{

    const videoId = req.params?.videoId;
    console.log(req.params?.videoId);
    console.log(videoId.trim());
    if(!videoId || videoId.trim() === ""){
        throw new apiError(400,"VideoId is required");
    }
    if(!mongoose.isValidObjectId(videoId)){
        throw new apiError(400,"Invalid VideoId");
    }

    const comments = await Comment.find({video:videoId});

    if(!comments){
        throw new apiError(500,"Something went wrong while fetching All Comments");
    }

    return resp.status(200).json(
        new apiResponse(200,{
            comments,
            numberOfComments:comments.length
        },"Comments fetched successfully")
    );

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
   
    const userId = req?.user._id;
    if(!userId){
        throw new apiError(400,"Unauthorized Access");
    }

    const commentId = req.params?.commentId;
    if(!commentId){
         throw new apiError(402,"CommentId is required");
    }
    if(!mongoose.isValidObjectId(commentId)){
        throw new apiError(402,"Invalid Comment Id");
    }

    const {content} = req.body;
    if(!content || content.trim() === ""){
        throw new apiError(402,"Content is required to update the Comment");
    }

    const comment = await Comment.findOne({_id:commentId});
    if(!comment){
        throw new apiError(404,"Comment Not Found");
    }

    if(userId.toString() !== comment.owner.toString()){
        throw new apiError(400,"User is Invalid to update comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId,{
        $set:{
            content
        }
    },{new: true});
    
    if(!updatedComment){
        throw new apiError(500,"Something went wrong while updating Comment");
    }

    return resp.status(200).json(
        new apiResponse(200,updatedComment,"Comment Updated Successfully")
    );


})

const updateLikeOnComment = asyncHandler(async(req,resp)=>{

})

const deleteComment = asyncHandler(async(req,resp)=>{

    const userId = req?.user._id;
    if(!userId){
        throw new apiError(400,"Unauthorized Access inside Controller");
    }

    const commentId = req.params?.commentId;
    if(!commentId){
        throw new apiError(402,"Comment Id is required");
    }
    if(!mongoose.isValidObjectId(commentId)){
        throw new apiError(402,"Invalid Comment Id");
    }

    const user = await User.findOne({_id:userId});
    if(!user){
        throw new apiError(404,"User not found");
    }

    const comment = await Comment.findOne({_id:commentId});
    if(!comment){
        throw new apiError(404,"Comment Not Found");
    }

    if(!user.isAdmin && (userId.toString() !== comment.owner.toString())){
        throw new apiError(401,"User is not valid to delete Comment");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if(!deletedComment){
        throw new apiError(500,"Something went wrong while deleting Comment");
    }

    let respMsg = "Comment deleted successfully by Owner"
    if(user.isAdmin && (userId.toString() !== comment.owner.toString())){
        respMsg = "Comment deleted successfully By Admin"
    }

    return resp.status(200).json(
        new apiResponse(200,{},respMsg)
    );



})

const getCommentsOfUserOnVideo = asyncHandler(async(req,resp)=>{

    const loggedInUser = req?.user;

    if(!loggedInUser){
        throw new apiError(404,"Login is required");
    }

    const videoId = req.params?.videoId;
    if(!videoId){
        throw new apiError(402,"VideoId is required");
    }
    if(!mongoose.isValidObjectId(videoId)){
        throw new apiError(401,"VideoId is invalid");
    }

    const userId = req.params?.userId;
    if(!userId){
        throw new apiError(402,"UserId is required");
    }
    if(!mongoose.isValidObjectId(userId)){
        throw new apiError(401,"UserId is not valid");
    }

    const video = await Video.findOne({_id:videoId});
    if(!video){
        throw new apiError(400,"Video not found");
    }
    console.log(loggedInUser._id);
    console.log(video.owner);
    if(loggedInUser._id.toString() !== video.owner.toString()){
        throw new apiError(404,"You are not valid to fetch API");
    }

    const user = await User.findOne({_id:userId});
    if(!user){
        throw new apiError(400,"User not found");
    }

    const comments = await Comment.find({
        $and:[{
            video:videoId,
            owner:userId
        }]
    })

    if(!comments){
        throw new apiError(500,"Something went wrong while fetching Comments");
    }

    return resp.status(200).json(
        new apiResponse(200,{
            data:comments,
            numberOfCommentsOnVideo:comments.length
        },"Comments fetched successully")
    );

})

const getCommentOfUser = asyncHandler(async(req,resp)=>{
    const userId = req?.user._id;
    if(!userId){
        throw new apiError(400,"Login is required");
    }

    const loggedInUser = await User.findOne({_id:userId});

    if(!loggedInUser){
        throw new apiError(402,"Admin not found");
    }

    if(!loggedInUser.isAdmin){
        throw new apiError(402,"User not Valid to access API");
    }

    const reqUserId = req.params?.userId;
    if(!reqUserId){
        throw new apiError(402,"Userid is required");
    }

    if(!mongoose.isValidObjectId(reqUserId)){
        throw new apiError(401,"UserId is not valid");
    }

    const user = await User.findOne({_id:reqUserId});
    if(!user){
        throw new apiError(404,"User not found");
    }

    const comments = await Comment.find({owner:user._id});

    if(!comments){
        throw new apiError(500,"Something went wrong while fetching Comment");
    }

    return resp.status(200).json(
        new apiResponse(200,{
            data:comments,
            numberOfComments:comments.length
        },
    "Comments fetched Successfully")
    );

   

})


export {getComment,getComments,postComment,updateComment,updateLikeOnComment,deleteComment,getCommentOfUser,getCommentsOfUserOnVideo};