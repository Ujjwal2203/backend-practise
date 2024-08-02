import mongoose ,{Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const videoSchema = new Schema({
  videofile: {
    type: String, // cloudanary URL
    required: true
  },
  thumbnail:{
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required : true
  },
  views: {
    type: Number,
    default : 0
  },
  isPublished : {
    type: Boolean,
    default: true,
    required: true
  },
  owner: {
    type : Schema.Types.ObjectId,
    ref: "User"
  }
},{timestamps:true})

// aggregation pipeline used for writing aggregation queries 
// plugin is nothing but a middleware hook 
videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video" , videoSchema)