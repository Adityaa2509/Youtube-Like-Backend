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

})

const removeVideoInPlaylist = asyncHandler(async(req,resp)=>{

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