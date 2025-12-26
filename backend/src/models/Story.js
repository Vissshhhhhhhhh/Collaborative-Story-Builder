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

        isPublished: {
            type: Boolean,
            default:false
        }
    },{
        timestamps:true
    }
);

module.exports = mongoose.model("story",storySchema);