import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/users.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asynchandler.js"
import { error } from "console"

const createTweet = asyncHandler(async (req, res) => {
    const {createTweet} =req.body;
    if(!createTweet){
        throw new ApiError(402,"Tweet content is missing!")
    }
    
        const newTweet= await Tweet.create(
            {
                content:createTweet,
                owner:req.user?._id
            }
        
        )
         if(!newTweet){
            throw new ApiError(401,"failed to create tweet")
         }
         
         const createdTweet=await Tweet.findById(newTweet._id)
         if(!createdTweet){
            throw new ApiError(401,"failed to create Tweet")
         }

         console.log(createdTweet,"created Tweet")


         return res.status(200)
         .json(new ApiResponse(200,"Tweet successfully created"))

    
     
   
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {user_id} = req.params
    console.log(user_id)
    if (!(user_id ||isValidObjectId(user_id))) {
        throw new ApiError(404, "Enter user id to get user tweets")
    }
   
   try {
     const userTweets = await Tweet.find({owner : user_id}).exec()
 
     if (!(userTweets || userTweets.length === 0)) {
         throw new ApiError(500, `Can not fetch user ${user_id} tweets at this moment : try again later`)
     }

     const contentArray = userTweets.map(tweet => {tweet.tweets});
     console.log(contentArray)
   
    return res
     .status(200)
     .json(new ApiResponse(200, userTweets, "User Tweets fetched"))
 
   } catch (error) {
     throw new ApiError(500, error, "Could not fetch user tweets at thid moment")
   }
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweet_id} = req.params
    const {tweet} = req.body
console.log(tweet_id,tweet)
    //console.log(tweet,tweet_Id ,"tweet and its id")

    if (!(tweet || tweet_id)) {
        throw new ApiError(403, "tweet or tweet_Id is not provided")
    }
    try {
        const existingTweets = await Tweet.find({ _id: tweet_id, owner: req.user._id });
        console.log(existingTweets,"Tweets fetched")
        if (!existingTweets) {
            console.log(existingTweets, "not auhtenticated user")
             throw new ApiError(401, `Tweet not found u can not update this: ${req.user.username} :tweet`)
        }
        const updatedTweet = await Tweet.findByIdAndUpdate(tweet_id,
                  {
                    content : tweet
                  }
                  ,{new :true,validateBeforeSave:false}
             )

        if (!updatedTweet) {
            throw new ApiError(403, "Something went wrong")
        }

        res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet has been updated"))

    } catch (error) {
        throw new ApiError(500, error, "Error updating tweet : Try again later")
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweet_id} = req.params;
    if(!tweet_id){
        throw new ApiError(401,"Tweet_id is required!")
    }
    console.log("Tweet ID:",tweet_id)
   try {
      if(!isValidObjectId(tweet_id)){
throw new ApiError(404,"Invalid Tweet_id")
      }
      const tweet =await Tweet.findById(tweet_id)
      if(!tweet){
        throw new ApiError(404,"Tweet not found")
      }
      const deleteTweet=await Tweet.deleteOne({_id:tweet_id})
      if(!deleteTweet){
        throw new ApiError(401,"Tweet deleting unsuccessfull")
      }
      return res.status(200)
      .json(new ApiResponse(202,"Tweet deleted successfully"))
   } catch (error) {
    throw new ApiError(500,"Server issue!Please try agian later")
   }

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}