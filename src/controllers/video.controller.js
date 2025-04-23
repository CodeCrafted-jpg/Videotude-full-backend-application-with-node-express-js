import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.medels.js";
import { User } from "../models/users.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewires/multer.middlewire.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = '', sortBy, sortType } = req.query; // Ensure query is an empty string if not provided
    const user_Id = req.user._id;

    console.log(query, sortType, sortBy, user_Id, "query, sortType, sortBy, sortBy");

    try {
        // Parse page and limit parameters
        const pageNumber = parseInt(page);
        const pageLimit = parseInt(limit);

        const skip = (pageNumber - 1) * pageLimit;

        console.log(pageLimit, skip, pageLimit, "from video pagelimit");

        // Ensure query is a string before using it with $regex
        const regexQuery = query && typeof query === 'string' ? query : ''; // Default to an empty string if query is invalid

        // Creating pipelines
        let pipeline = [
            {
                $match: {
                    $or: [
                        { title: { $regex: regexQuery, $options: "i" } },
                        { description: { $regex: regexQuery, $options: "i" } },
                        { owner: new mongoose.Types.ObjectId(user_Id) }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                fullName: 1,
                                avatar: 1,
                                coverImage: 1,
                                email: 1
                            }
                        },
                        {
                            $addFields: {
                                ownerDetails: {
                                    $first: "$ownerDetails"
                                }
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "video",
                    as: "commentsOnVideo",
                    pipeline: [
                        {
                            $project: {
                                content: 1
                            }
                        },
                        {
                            $addFields: {
                                commentsOnVideo: "$commentsOnVideo"
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likesOnVideo",
                    pipeline: [
                        {
                            $project: {
                                tweet: 1,
                                likedBy: 1,
                                comment: 1
                            }
                        },
                        {
                            $addFields: {
                                likesOnVideo: "$likesOnVideo"
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "playlists",
                    localField: "_id",
                    foreignField: "video",
                    as: "PlaylistsOnVideo",
                    pipeline: [
                        {
                            $project: {
                                title: 1,
                                description: 1,
                                owner: 1
                            }
                        },
                        {
                            $addFields: {
                                PlaylistsOnVideo: "$PlaylistsOnVideo"
                            }
                        }
                    ]
                }
            },
            {
                $sort: {
                    [sortBy]: sortType === "desc" ? -1 : 1,
                    createdAt: -1 // Sort by createdAt in descending order as an option newest first
                }
            },
            { $skip: skip },
            { $limit: pageLimit }
        ];

        console.log(pipeline, "pipeline of videos");

        if (!pipeline || pipeline.length === null) {
            throw new ApiError(500, "Loading Failed : Please try again later");
        }

        const video = await Video.aggregate(pipeline);
        const videoAggregate = await Video.aggregatePaginate(pipeline);

        console.log(video, "from pipeline getallvideos");

        if (!(video || video.length === (0 || null))) {
            throw new ApiError(500, "Failed to getallvideos. Please try again later");
        }

        res.status(200).json(new ApiResponse(200, { video, videoAggregate }, "Video aggregated and paginated Retrieved Successfully"));

    } catch (error) {
        throw new ApiError(500, error, "Some error occurred while getting your video");
    }
});

// -----------------------------------------------

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!(title || description )) {
        throw new ApiError(400, "Required fileds: title and description")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    console.log(videoLocalPath,"----", thumbnailLocalPath, title, description, "FROM PUBLISH video")

    if (!(videoLocalPath || thumbnailLocalPath)) {
        throw new ApiError(400, "Video and thumbnail are required: please provide video and thumbanil")
    }
    
    try 
      {
        const videoUploaded = await uploadOnCloudinary(videoLocalPath)
        const thumbanilUploaded = await uploadOnCloudinary(thumbnailLocalPath)
        console.log(videoUploaded, thumbanilUploaded, "1111")
        if (!(videoUploaded.url && thumbanilUploaded.url)) {
            throw new ApiError(400, "Video and thumbanil is required")
        }
        console.log("22222")
        const newVideo = await Video.create(
            {
                title,
                description,
                duration: videoUploaded.duration,
                videoFile: videoUploaded.url,
                thumbnail: thumbanilUploaded.url,
                isPublished:true,
                owner: req.user?._id // bcz we have added useer object thoru veirfyjwt 
            }
        );

     if (!newVideo) {
          throw new ApiError(400, "Video couldn't be created")
        }
     
    const createdVideo = await Video.findById(newVideo._id);

    console.log(createdVideo, "Video created")
      
    if (!createdVideo) {
        throw new ApiError(500, "Video couldn't be created")
    }
   return  res
    .status(201)
    .json(new ApiResponse(200, createdVideo, "Video uploaded successfully uploaded"))
      }catch (error) {
        throw new ApiError(500,error, "Some error occurred while publishing video")
    }
}) 
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
     console.log(videoId)
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video ID');
    }

    const video = await Video.findById(videoId)
    .populate({
      path: 'User',
      select: 'fullname email',
      strictPopulate: false
    }); // Assuming populate to fetch user details

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    return res.status(200)
    .json (new ApiResponse(200, video));
});
// -----------------------------------------------

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video ID');
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    // Update the video details
    video.title = title || video.title;
    video.description = description || video.description;

    // Handle thumbnail update if a new one is uploaded
    if (req.file) {
        const thumbnailUploadResult = await uploadOnCloudinary(req.file.path, 'image');
        video.thumbnailUrl = thumbnailUploadResult.secure_url;
    }

    await video.save();

    return res.status(200)
    .json (new ApiResponse(200, video)) ;
});
// -----------------------------------------------

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video ID');
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    if (video) {
        await video.deleteOne();  // This deletes the video document
        console.log('Video deleted successfully');
        // if (videoUploaded.public_id) {
        //     await deleteFromCloudinary(videoUploaded.public_id); 
        //     console.log("deleted from cloudinary")
        //     // Delete from Cloudinary using the publicId
        // } else {
        //     console.log('No Cloudinary public ID found for this video');
        // }
      } else {
        console.log('Video not found');
      }

    return res.status(200).json(new ApiResponse(200, { message: 'Video deleted successfully' }));
});
// -----------------------------------------------

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video ID');
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    // Toggle the publish status
    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200)
    .json (new ApiResponse(200, video));
});
// -----------------------------------------------

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
