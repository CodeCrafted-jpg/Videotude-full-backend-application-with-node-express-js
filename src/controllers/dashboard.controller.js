import mongoose from "mongoose";
import { Video } from "../models/video.medels.js";
import { Subscription } from "../models/subcription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const ChannelStats=[]
    if(req.user){
        const subcription=await Subscription.find({channel:req.user._id})
        if(!subcription||subcription.length===0){
            throw new ApiError(402,"Channel not found")
        }
       const subscribes=subcription.map(subcription=>subcription.subscriber)
        const numberOfSubscribers=subscribes.length
        ChannelStats.push(numberOfSubscribers)


        const video= await Video.find({owner:req.user._id,isPublished:true})
        let numOfVideos = 0
        if(!video||video.length===0){
            ChannelStats.push(0)
        }
        else{
            numOfVideos=video.length
            ChannelStats.push(numOfVideos)
        }


        let totalViews=0
        const views=video.map(views=>totalViews+views.view)
       ChannelStats.push(views)


       let videolikes = 0
       for (const currentVideo of video) {
        const likes = await Like.find({ video: currentVideo._id });
        videolikes += likes.length;
    }
    ChannelStats.push(videolikes);
     return res.status(200)
     .json(new ApiResponse(202, `Number of subscribers: ${ChannelStats[0]} , Number Of Videos : ${ChannelStats[1]} , Number Of Views: ${ChannelStats[2]} , number Of Likes: ${ChannelStats[3]}`, "Channel Stats has been fetched successfully"))

    }
    else{
        throw new ApiError(404,"User not loged in")
    }
    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    try {
        let channelVideos

        if (req.user) {
         channelVideos  = await Video.find({owner:req.user._id})
        }

        if (!channelVideos || channelVideos.length === 0) {
            throw new ApiError(404, `No videos exist for channel of user: ${req.user.username}`)
        }

        res
        .status(200)
        .json(new ApiResponse(200, channelVideos, "Channel videos fetched successfully"))

    } catch (error) {
        throw new ApiError(404, error, "Some error occurred while fetching video your videos")
    }
})

export {
    getChannelStats, 
    getChannelVideos
    }