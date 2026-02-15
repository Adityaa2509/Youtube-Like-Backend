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

})

const getSubscribedChannel = asyncHandler(async(req,resp)=>{
    
})

export {toogleSubscription,getChannelSubscribers,getSubscribedChannel};