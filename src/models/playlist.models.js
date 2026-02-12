import mongoose from "mongoose";

const playlistSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"Playlist name is required"]
    },
    description:{
        type:String,
        required:[true,"Description name is required"]
    },
    videos:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps: true});

export const Playlist = mongoose.model("Playlist",playlistSchema);
