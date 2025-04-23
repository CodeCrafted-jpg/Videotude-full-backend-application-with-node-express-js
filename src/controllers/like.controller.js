import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asynchandler.js"
import { application } from "express"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!isValidObjectId(videoId)){
        throw new ApiError(402,"Provided videoId id not valid")
    }
    console.log("videoId",videoId)
try {
        const exictingLike=await Like.findOne({video:videoId,likedBy:req.user._id})
    if(exictingLike){
        await Like.deleteOne({_id:exictingLike._id})
        return res.status(200)
        .json(new ApiResponse(201,"Video unliked successfully"))
    
    }
    else if(!exictingLike){
        await Like.create({video:videoId,likedBy:req.user._id})
        return res.status(200)
        .json(new ApiResponse(202,"Video liked successfully"))
    }
} catch (error) {
   throw new ApiError(500,"server issue!") 
}
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(402,"Invalid commentID")
    }

  try {
      const exictingLike=await Like.findOne({comment:commentId,likedBy:req.user._id})
      if(exictingLike){
          await Like.deleteOne({_id:exictingLike._id})
          return res.status(200)
          .json(new ApiResponse(201,"Like removed from comment successfully"))
      }
    else if(!exictingLike){
      await Like.create({comment:commentId,likedBy:req.user._id})
      return res.status(200)
      .json(new ApiResponse(202,"Comment liked successfully"))
    }
  } catch (error) {
    throw new ApiError(500,"Server issue!")
  }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId({tweet:tweetId})){
        throw new ApiError(403,"provided tweetId is not valid")
    }
    console.log("tweetID:",tweetId)
  try {
      const exictingLike=await Like.findOne({tweet:tweetId,likedBy:req.user._id})
      if(exictingLike){
          await Like.deleteOne({_id:exictingLike._id})
          return res.status(200)
          .json(new ApiResponse(201,"Like removed from tweet successfully"))
      }
    else if(!exictingLike){
      await Like.create({tweet:tweetId,likedBy:req.user._id})
      return res.status(200)
      .json(new ApiResponse(202,"Tweet liked successfully"))
    }
  } catch (error) {
    throw new ApiError(500,"server issue!")
  }

})

const getLikedVideos = asyncHandler(async (req, res) => {
  try {
    const likedVideos = await Like.find({ video: { $ne: null }, likedBy: req.user._id }) // find all liked videos so pass without any argument

    if (!likedVideos || likedVideos.length === 0) {
        throw new ApiError(404, "No liked videos found")
    }
console.log(likedVideos)
const videoIds = likedVideos.map(like => like.video);
console.log(videoIds)
    return res
   .status(200)
   .json(new ApiResponse(200,`liked videos are:-${videoIds}`, "Liked videos fetched successfully"))
} catch (error) {
    throw new ApiError(500, error, "Some error occured while getting liked videos")
}
})


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}