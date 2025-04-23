import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asynchandler.js"
import { app } from "../app.js"
import { response } from "express"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!(name||description)){
        throw new ApiError(402,"Name and description are required")
    }
    console.log(name,description)
try {
     const playlist= await Playlist.create({
        name,
      description,
      vedios:[],
      owner:req.user._id
    })
    console.log(playlist)
    if(!playlist){
        throw new ApiError(402,"playlist creartion unsuccessful")
    }
    return res.status(200)
    .json(new ApiResponse(202,playlist,"Playlist creation successfull!"))
} catch (error) {
    throw new ApiError(500,"Server issue!")
}
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
 throw new ApiError(404,"Userid not found")
    }
  try {
      const userPlaylists=await Playlist.find({owner:userId})
      if(!userPlaylists||userPlaylists.length===0){
          throw new ApiError(402,"No user playlist exists")
      }
  
      return res.status(200)
      .json(new ApiResponse(202,userPlaylists,"User's playlist fetched successfully!"))
  } catch (error) {
    throw new ApiError(500,"Server issue!")
  }

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(202,"Invalid playlist ID!")
    }
    console.log(playlistId)
try {
        const getPlaylist= await Playlist.findById({_id:playlistId})
    if(!getPlaylist){
        throw new ApiError(404,"Playlist not found!")
    }
    console.log(getPlaylist)
    return res.status(200)
    .json(new ApiResponse (203,getPlaylist,"Playlist fetched successfully!"))
} catch (error) {
    throw new ApiError(500,"Server issue!")
}

}) 

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId,videoId)){
        throw new ApiError(402,"Invalid ID")
    }
    console.log(playlistId,videoId)
 try {
       const playlist= await Playlist.findById({_id:playlistId})
       if(!playlist){
           throw new ApiError(404,"No playlist is found!")
       }
       if(playlist.vedios.includes(videoId)){
           return res.status(200)
           .json(new ApiResponse(202,"Video alraedy included in playlist"))
       }
       const videoAdd=await Playlist.findByIdAndUpdate(
            playlistId,
            {
               $push:{
                   vedios:videoId
               }
            },
            {
               new:true,
               validateBeforeSave:false
            }
       )
       console.log(videoAdd)
    if(!videoAdd||videoAdd.length===0){
       throw new ApiError(402,"Failed to add video")
    }
    return res.status(200)
    .json(new ApiResponse(202,videoAdd,"Video added to playlist successfully"))
    
 } catch (error) {
    throw new ApiError(500,"Server issue")
 }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId,videoId)){
        throw new ApiError(402,"Invalid ID")
    }
    try {
        const findPlaylist= await Playlist.findById({_id:playlistId,vedios:videoId})
        if(!findPlaylist){
            throw new ApiError(404,"Video not included in the playlist")
        }
        const videoRemove= await findPlaylist.vedios.indexOf(videoId)
        if(videoRemove>-1){
              findPlaylist.vedios.splice(videoRemove,1)
        }
       await findPlaylist.save()
       console.log(findPlaylist)
       return res.status(200)
       .json(new ApiResponse(202,findPlaylist,"Video successfully removed"))
       
    } catch (error) {
        throw new ApiError(500,"Server issue!")
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
   if(!isValidObjectId(playlistId)){
    throw new ApiError(402,"Invalid id")
   }
   try {
    const playlist= await Playlist.findByIdAndDelete({_id:playlistId})
    if(!playlist){
     throw new ApiError(404,"playlist not found")
    }
    return res.status(200)
    .json(new ApiResponse(202,"Playlist deleted successfully"))
   } catch (error) {
    throw new ApiError(500,"Server Issue!")
   }
})
const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!(name,description)){
        throw new ApiError(402,"Name and Description are required")
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(402,"Invalid id")
    }
try {
        const updatedPlaylist=await Playlist.findByIdAndUpdate(
            playlistId,
            {
                name:name,
                description:description
            },
            {new:true,validateBeforeSave:false}
    
    
        )
        if(!updatedPlaylist){
            throw new ApiError(402,"Playlist updation unsuccessful")
        }
        console.log(updatedPlaylist)
        return res.status(200)
        .json(new ApiResponse(202,updatedPlaylist,"Playlist updated successfully"))
    
} catch (error) {
    throw new ApiError(500,"Server issue!") 
}
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}