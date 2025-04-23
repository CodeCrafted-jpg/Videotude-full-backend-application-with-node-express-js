import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asynchandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { video_Id } = req.params
    const { page = 1, limit = 10 } = req.query
    
    console.log(video_Id, "video_id from request")

    if (!video_Id){
        throw new ApiError(404,"enter valid video_id to find comments")
    }
    
    try {
        const videoComments = await Comment.find({video:video_Id}).skip((page-1)*limit).limit(limit).exec();
        
        if (!videoComments || videoComments.length === 0) {
            throw new ApiError(404,"Could not find comments for specified video")
        }
        
        res
        .status(200)
        .json(new ApiResponse(200, videoComments, "All comments fetched successfully"))

    } catch (error) {
        throw new ApiError(500, error, "Couldn't find video comments")
    }


})
const addComment = asyncHandler(async (req, res) => {
    const { video_Id } = req.params;

   
    const {commentContent} = req.body;

    
    console.log(video_Id, commentContent, "video id and comment");

    if (!(video_Id || commentContent)) {
        throw new ApiError(404, "Invalid video_Id or you have not written any comment");
    }

    try {
        const newComment = await Comment.create({
            content: commentContent,
            video: video_Id,
            owner: req.user._id 
        });

        
        if (!newComment) {
            
            throw new ApiError(500, "Can not add a comment to video");
        }

       return res
            .status(200)
            .json(new ApiResponse(200, newComment, "Comment added successfully"));
    } catch (error) {
        
        throw new ApiError(500, error, "Server Issue!");
    }
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId}=req.params
    const {commentContent}=req.body
    if(!(commentId,commentContent)){
        throw new ApiError(402,"commentId and updated comment content is needed")
    }
    if(!isValidObjectId(commentId)){
        throw new ApiError(402,"invalid id")
    }
try {
        const updatedComment= await Comment.findByIdAndUpdate(
            commentId,
            {
                content:commentContent,
              
            },
            {new:true,validateBeforeSave:false}
        )
    
        console.log(updatedComment)
        return res.status(200)
        .json(new ApiResponse(202,updatedComment,"Comment updated Successfully"))
} catch (error) {
    throw new ApiError(500,"Server Issue!")
}
})

const deleteComment = asyncHandler(async (req, res) => {
   const {commentId}=req.params;
   if(!isValidObjectId(commentId)){
    throw new ApiError(402,"Invalid Id")
   }
   try {
    const delComment=await Comment.findByIdAndDelete({_id:commentId})
    if(!delComment){
     throw new ApiError(402,"comment deletion unsuccessful")
    }
    return res.status(200)
    .json(new ApiResponse(202,"Comment Deleted successfully"))
   } catch (error) {
    throw new ApiError(500,"Server issue!")
   }
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }