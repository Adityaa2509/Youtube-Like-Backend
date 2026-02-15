import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.models.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";

const toogleSubscription = asyncHandler(async(req,resp)=>{
    const user = req?.user;
    if(!user){
        throw new apiError(401,"Unauthorized access inside Controller");
    }

    const {channelId} = req.params;
    if(!channelId || channelId.trim() == ""){
        throw new apiError(400,"Channel Id is required");
    }
    if(!mongoose.isValidObjectId(channelId)){
        throw new apiError(400,"Invalid Channel Id");
    }
    const isChannelIdExists = await User.findById(channelId)
    if(!isChannelIdExists){
        throw new apiError(404,"Channel does not exists");
    }

    if(channelId.toString() === user._id.toString()){
        throw new apiError(400,"You cannot subscribe Yourself");
    }

    const deletedsubscription = await Subscription.findOneAndDelete({
        $and:[
            {
                subscriber:user._id,
            },{
                channel:channelId
            }
        ]
    })
    if(deletedsubscription){
        return resp.status(200).json(
            new apiResponse(200,"Unsubscribed Succesful")
        );
    }

    try {
        const newSubscription = await Subscription.create({
            subscriber:user._id,
            channel:channelId
        });
    
        if(!newSubscription){
            throw new apiError(500,"Something went wrong while subscribing to the channel");
        }
    
        return resp.status(200).json(
            new apiResponse(200,newSubscription,"Channel successfully,subscribed")
        );
    } catch (error) {
            // Handle race condition safely
    if (error.code === 11000) {
      return resp.status(200).json(
        new apiResponse(201, null, "Already subscribed")
      );
    }
    throw error;
    }

})

const getChannelSubscribers = asyncHandler(async(req,resp)=>{
    const user = req?.user;

    if(!user){
        throw new apiError(401,"Unauthorized");
    }
    if((!user.isAdmin) && (req.query?.channelId) && (user._id.toString() !== req.query?.channelId.toString())){
        throw new apiError(401,"Not valid user to fetch info about Channel");
    }
    let channelId = "";
    if(user.isAdmin){
        channelId = req.query?.channelId || user._id;
    }else{
        channelId = user._id;
    }
    if(!channelId || channelId.toString().trim() === ""){
        throw new apiError(400,"Channel Id is required");
    }
    if(!mongoose.isValidObjectId(channelId)){
        throw new apiError(400,"Channel Id is Invalid");
    }
    const channel = await User.findById(channelId);
    if(!channel){
        throw new apiError(404,"Channel not found");
    }

    const subscribers = await Subscription.find({channel:channelId}).populate({
        path:"subscriber",
        select:"username email fullName avatar"
});

    if(!subscribers){
        throw new apiError(500,"Something went wrong while fetching subscribers");
    }

    return resp.status(200).json(
        new apiResponse(200,{
            data:subscribers,
            numberofSubscriber:subscribers.length
        },"Subscribers fetched successfully"));
})

const getSubscribedChannel = asyncHandler(async(req,resp)=>{
    const user = req?.user;
    if(!user){
        throw new apiError(401,"Unauthorized Access");
    }
    if((!user.isAdmin) && (req.query?.subscriberId) && (user._id.toString() !== req.query?.subscriberId.toString())){
        throw new apiError(401,"Not valid user to fetch info about Subscriber");
    }
    let subscriberId = "";
    if(user.isAdmin){
        subscriberId = req.query?.subscriberId || user._id;
    }else{
        subscriberId = user._id;
    }
    if(!subscriberId || subscriberId.toString().trim() === ""){
        throw new apiError(400,"subscriber Id is required");
    }
    if(!mongoose.isValidObjectId(subscriberId)){
        throw new apiError(400,"subscriber Id is Invalid");
    }

     const subscriber = await User.findById(subscriberId);
    if(!subscriber){
        throw new apiError(404,"Subscriber not found");
    }

    const channels = await Subscription.find({subscriber:subscriberId}).populate({
        path:"channel",
        select:"username email fullName avatar"
});

    if(!channels){
        throw new apiError(500,"Something went wrong while fetching channel");
    }

    return resp.status(200).json(
        new apiResponse(200,{
            data:channels,
            numberofSubscriber:channels.length
        },"Subscribers fetched successfully"));

})

export {toogleSubscription,getChannelSubscribers,getSubscribedChannel};