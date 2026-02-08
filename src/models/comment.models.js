import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content:{
        type: String,
        required: [true,"Content is required for Comment."]
    },
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: [true,"Video is required for Comment."]
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true,"Owner is required for Comment."]
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    numberOfLikes:{
        type:Number,
        default:0
    }
},{timestamps: true});

export const Comment = mongoose.model("Comment",commentSchema);