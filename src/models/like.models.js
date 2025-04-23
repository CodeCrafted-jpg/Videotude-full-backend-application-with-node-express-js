import mongoose, {Schema} from "mongoose"
const likeSchema= new Schema(

//either the vedio the comment or tweet will be assigned others to null
{
video:{
    type:Schema.Types.ObjectId,
    ref:"Video"
},
comment:{
    type:Schema.Types.ObjectId,
    ref:"Comment"
},
tweet:{
    type:Schema.Types.ObjectId,
    ref:"Tweet"
},
likedBy:{
    type:Schema.Types.ObjectId,
    ref:"User"
}
},
{ timestamps:true }
)
export const Like= mongoose.model("Like", likeSchema);