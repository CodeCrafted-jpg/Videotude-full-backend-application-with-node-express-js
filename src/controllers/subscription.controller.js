import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/users.models.js"
import { Subscription } from "../models/subcription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asynchandler.js"
import { channel } from "diagnostics_channel"


const createChannel=asyncHandler(async(req,res)=>{
    const {user_id}=req.params
    if(!user_id){
        throw new ApiError(401, "user_id id required!")

    }
console.log("user_id:" ,user_id)
try {
    const channel= await Subscription.create(
        {
            channel:user_id,
            subcriber:null
        }
    )
if(!channel){
    throw new ApiError(403,"Channel creation unsuccessful!")
}
return res.status(200)
.json(new ApiResponse(202,"channel creation successful:",channel))

} catch (error) {
    throw new ApiError(500,"Server issue!Please try later")
}
})

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
     if(!isValidObjectId(channelId)){
        throw new ApiError(404,"channelId is not valid!")
        
    }
    console.log(channelId)
   
    const subscription=await Subscription.findById({_id:channelId})
    console.log(subscription,"subscription:")
    if(!subscription){
        throw new ApiError(404,"could not find channel")
    }
    console.log("hi")
    if (subscription.channel.toString() === req.user._id.toString()) {
        throw new ApiError(404, "You can not toggle subscription of  your own channel")
    }
    
    if(req.user && subscription.subscriber){
        subscription.subscriber=null;
        await subscription.save()
        return res.status(200)
        .json(new ApiResponse(202,"Subscription toggled successfully"))
    }
    else if(req.user){
        subscription.subscriber=req.user._id
        await subscription.save()
        return res.status(200)
        .json(new ApiResponse(402,"Subscription toggled successfully"))
    }

  

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(404,"channelId is not valid!")
        
    }
    console.log(channelId)

    try {
        const channelSubscriptions = await Subscription.find({channel:channelId}) 
        /* 
        channelSubscription is an array of subscription documents, 
        not a single document.
        So, we need to iterate over channelUsers to access each subscriber's ID.
         */

        if (!channelSubscriptions || channelSubscriptions.length === 0) {
            throw new ApiError(404, "No such channel exists")
        }
        
        const subscriberIds = channelSubscriptions.map(subscription => subscription.subscriber) //this will return array

        // The subscriberIds array contains the IDs of all subscribers to the specified channel.
        console.log(subscriberIds,"subcriberIds")

       return res
        .status(200)
        .json(new ApiResponse(200,subscriberIds,"Channel Subscriber fetched successfully"));

    } catch (error) {
        throw new ApiError(500, error, "Something went wrong while getting subscribers :Please try again later")
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(404,"channelId is not valid!")
}
    
        const channel= await Subscription.find({subscriber:subscriberId})
        if(!channel||channel.length===0){
            throw new ApiError(402,"no subscribed channel available")
    
        }
    
        const channelIds= channel.map(channels=>channels.channel)
        console.log(channelIds)
        return res.status(200)
        .json(new ApiResponse(202, channelIds, "Subscribed channels fetched Successfully"))
    
})
export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    createChannel
}