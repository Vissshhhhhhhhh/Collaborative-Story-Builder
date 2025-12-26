const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            trim:true
        },
        
        content:{
            type:String,
            default:""
        },
        story:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Story",
            required:true
        },
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },

        lastEditedBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        parentChapter:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chapter",
            default: null
        },
        isBranch:{
            type: Boolean,
            default: false
        },
        order:{
            type:Number,
            required:true
        },
        isLocked:{
            type: Boolean,
            default: false
        },
        lockedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        lockedAt:{
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Chapter",chapterSchema);