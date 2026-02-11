const mongoose = require("mongoose");
const storySchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            trim:true
        },
        description:{
            type:String,
            trim:true
        },
        author:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },

        collaborators :[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            },
        ],

        coverImage: {
            url: {
                type: String,
                default: ""
            },
            publicId: {
                type: String,
                default: ""
            }
        },

        
        isPublished: {
            type: Boolean,
            default:false
        }
    },
    {
        timestamps:true
    }
);

// ✅ Add indexes for optimized queries
storySchema.index({ isPublished: 1 });
storySchema.index({ isPublished: 1, updatedAt: -1 });

module.exports = mongoose.model("story",storySchema);


