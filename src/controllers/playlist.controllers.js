import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { Playlist } from "../models/playlist.models.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async(req,resp)=>{
    const user = req?.user;
    if(!user){
        throw new apiError(400,"Unauthenticated access in controller");
    }

    const {name,description} = req.body;

    if(!name || name.trim() === ""){
        throw new apiError(402,"Name is required")
    }
    if(!description || description.trim() === ""){
        throw new apiError(402,"Description is required");
    }

    const playlist = await Playlist.findOne({
        $and:[{
            owner:user._id,
            name
        }]
    });
    if(playlist){
        throw new apiError(403,"You already have playlist with this name");
    }

    const createdPlaylist = await Playlist.create({
        name,
        description,
        owner:user._id
    })

    if(!createdPlaylist){
        throw new apiError(500,"Something went wrong while creating Plylist");
    }

    return resp.status(200).json(
        new apiResponse(200,createdPlaylist,"Playlist created successfully")
    );
})

const renamePlaylist = asyncHandler(async(req,resp)=>{
    
    const user = req?.user;
    if(!user){
        throw new apiError(400,"Unauthorized acces sinside controller");
    }

    const playlistId = req.params?.playlistId;
    if(!playlistId){
        throw new apiError(402,"PlaylistId is required");
    }
    if(!mongoose.isValidObjectId(playlistId)){
        throw new apiError(402,"PlaylistId is not valid");
    }

    const {name,description} = req.body;
    if(!name || name.trim() === ""){
        throw new apiError(402,"Name is required");
    }
    if(!description || description.trim() === ""){
        throw new apiError(402,"Description is required");
    }
    //name handling logic to be handled

    const playlist = await Playlist.findOne({_id:playlistId});
    if(!playlist){
        throw new apiError(404,"Playlist not found");
    }

    //update playlist

    //return response
    
    
})

const addVideoInPlaylist = asyncHandler(async(req,resp)=>{
    
    //user validation intital
    const user = req?.user;
    if(!user){
         throw new apiError(400,"Unauthorized access inside controller");
    }

    //playlist id validation
    const playlistId = req.params?.playlistId;
    if(!playlistId){
        throw new apiError(402,"Playlist Id is required");
    }
    if(!mongoose.isValidObjectId(playlistId)){
        throw new apiError(402,"Invalid Playlist Id");
    }
    
    //video id validation
    const videoId = req.params?.videoId;
    if(!videoId){
        throw new apiError(402,"Video Id is required");
    }
    if(!mongoose.isValidObjectId(videoId)){
        throw new apiError(402,"Invalid Video Id");
    }

    //fetch playlist
    const playlist = await Playlist.findOne({_id:playlistId});
    if(!playlist){
        throw new apiError(404,"Playlist Not Found");
    }
   
    //fetch video
    const video = await Video.findOne({_id:videoId});
    if(!video){
        throw new apiError(404,"Video Not Found");
    }
   
    //playlist owner and req user validation
    if(playlist.owner.toString() !== user._id.toString()){
        throw new apiError(400,"User do not have permission to add video in this playlist");
    }
   
    //check if already added --> if already added leave
    console.log()
    const videoFound = playlist.videos.filter((video)=>video.toString() === videoId.toString());
    if(videoFound.length>0){
        throw new apiError(400,"Video already added in playlist");
    }

    //if not already added add it 
    playlist.videos.push(videoId);
    const updatedPlaylist =  await playlist.save({new:true});
    if(!updatedPlaylist){
        throw new apiError(500,"Something went wrong while adding video in playlist");
    }
    
    //return resp
    return resp.status(200).json(
        new apiResponse(200,updatedPlaylist,"Video added successfully in playlist")
    );

})

const removeVideoInPlaylist = asyncHandler(async(req,resp)=>{
    //user validation intital
    const user = req?.user;
    if(!user){
         throw new apiError(401,"Unauthorized access inside controller");
    }

    //playlist id validation
    const playlistId = req.params?.playlistId;
    if(!playlistId){
        throw new apiError(400,"Playlist Id is required");
    }
    if(!mongoose.isValidObjectId(playlistId)){
        throw new apiError(400,"Invalid Playlist Id");
    }
    
    //video id validation
    const videoId = req.params?.videoId;
    if(!videoId){
        throw new apiError(400,"Video Id is required");
    }
    if(!mongoose.isValidObjectId(videoId)){
        throw new apiError(400,"Invalid Video Id");
    }

    //fetch playlist
    const playlist = await Playlist.findOne({_id:playlistId});
    if(!playlist){
        throw new apiError(404,"Playlist Not Found");
    }
   
    //fetch video
    const video = await Video.findOne({_id:videoId});
    if(!video){
        throw new apiError(404,"Video Not Found");
    }
   
    //playlist owner and req user validation
    if(playlist.owner.toString() !== user._id.toString()){
        throw new apiError(404,"User do not have permission to add video in this playlist");
    }
   
    //check if video exists -> is yes then delete if not leave
    const videoFound = playlist.videos.filter((video)=>video.toString() === videoId.toString());
    if(videoFound.length == 0){
        throw new apiError(404,"Video already removed from Playlist");
    }

    playlist.videos = playlist.videos.
                      filter((video)=>video.toString() !== videoId.toString());
    
    const updatedPlaylist = await playlist.save({new:true});
    if(!updatedPlaylist){
        throw new apiError(500,"Something went wrong while removing video from playlist");
    }

    //return resp
    return resp.status(200).json(
        new apiResponse(200,updatedPlaylist,"Video successfully removed from Playlist")
    );
})

const getUserPlaylists = asyncHandler(async(req,resp)=>{
    const user = req?.user;
    if(!user){
        throw new apiError(400,"Unauthorized Access inside Controller");
    }

    const playlists = await Playlist.find({owner:user._id});
    
    if(!playlists){
        throw new apiError(500,"Something went wrong while fetching Playlist");
    }

    return resp.status(200).json(
        new apiResponse(200,{
            data:playlists,
            numberOfPlaylist:playlists.length
        },"Playlists fetched Successfully")
    )
})

const getPlaylistById = asyncHandler(async(req,resp)=>{
    const user = req?.user;
    if(!user){
        throw new apiError(400,"Unauthorized Access inside Controller");
    }
    const playlistId = req.params?.playlistId;

    if(!playlistId){
        throw new apiError(402,"Playlist id is required");
    }
    if(!mongoose.isValidObjectId(playlistId)){
        throw new apiError(402,"PlaylistId is invalid");
    }


    const playlist = await Playlist.findOne({_id:playlistId});

    if(!playlist){
        throw new apiError(404,"Playlist not found");
    }
    
    if((!user.isAdmin) && (playlist.owner.toString() !== user._id.toString())){
        throw new apiError(400,"You are not valid user to fetch this Playlist");
    }

    return resp.status(200).json(
        new apiResponse(200,playlist,"Playlist fetched successfully")
    )
})

const deletePlaylist = asyncHandler(async(req,resp)=>{
    const user = req?.user;
    if(!user){
        throw new apiError(400,"Unauthorized Access Inside Controller");
    }

    const playlistId = req.params?.playlistId;
    if(!playlistId){
        throw new apiError(402,"Playlist Id is required");
    }
    if(!mongoose.isValidObjectId(playlistId)){
        throw new apiError(402,"Inavlid Playlist Id");
    }

    const playlist = await Playlist.findOne({_id:playlistId});

    if(!playlist){
        throw new apiError(404,"Playlist Not Found");
    }

    if(playlist.owner.toString() !== user._id.toString()){
        throw new apiError(400,"You are not valid user to delete this Playlist");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if(!deletedPlaylist){
        throw new apiError(500,"Something went wrong while deleting Playlist");
    }

    return resp.status(200).json(
        new apiResponse(200,deletedPlaylist,"Playlist Successfully Deleted")
    );

})

export {createPlaylist,renamePlaylist,addVideoInPlaylist,removeVideoInPlaylist,getPlaylistById,getUserPlaylists,deletePlaylist}