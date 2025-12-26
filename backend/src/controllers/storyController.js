const Story = require("../models/Story");
const User = require("../models/User");
const generateStoryPDF = require("../utils/pdfGenerator");
const Chapter = require("../models/Chapter");

const createStory = async (req,res)=>{
        try{
            const {title, description} = req.body;

            const story = await Story.create({
                title,
                description,
                author: req.userId,
                collaborators: [req.userId]
            });

            res.status(201).json({
                message:"Story created successfully",
                story
            });
        }
        catch(err) {
            res.status(500).json({
                message: "Story creation failed",
                error:err.message
            });
        }
};

const addCollaborator = async (req,res)=>{
    try{
        const {storyId} = req.params;
        const {email} = req.body;
        const story = await Story.findById(storyId);
        if(!story){
            return res.status(404).json({message:"Story not found"});
        }

        if(story.author.toString()!==req.userId){
            return res.status(403).json({
                message:"Only author can invite collaborators"
            });
        }

        const userToInvite = await User.findOne({email});
        if(!userToInvite){
            return res.status(404).json({
                message:"User to be Invited is not found"
            });
        }

        if(story.collaborators.includes(userToInvite._id)){
            return res.status(400).json({
                message:"User aalready a collaborator"
            });
        }

        story.collaborators.push(userToInvite._id);
        await story.save();

        res.status(200).json({
            message: "Collaborator added successfully",
            collaborators:story.collaborators
        });
    }
    catch(err){
        res.status(500).json({
            message:"Failed to add collaborator",
            error:err.message
        });
    }
};

function filter(stories, userId){
    return stories.map(story =>{
        const storyObj = story.toObject();

        if(storyObj.author.toString()!==userId){
            delete storyObj.collaborators;
        }
        return storyObj;
    });
}

// small issue on collaborator while getting results shows
// collaborators (it should show only when author sees his results)


const getMyOngoingStories = async (req, res) => {
    try{
        const stories = await Story.find({
            isPublished:false,
            $or:[
                {author: req.userId},
                {collaborators: req.userId}
            ]
        }).sort({updatedAt:-1});

        const filteredStories = filter(stories, req.userId);
        res.status(200).json({
            stories: filteredStories
        });
    }
    catch(err){
        res.status(500).json({
            message:"Failed to fetch ongoing stories",
            error:err.message
        });
    }
};


const getMyPublishedStories = async (req,res)=>{
    try{
        const stories = await Story.find({
            isPublished : true,
            $or:[
                {author:req.userId},
                {collaborators: req.userId}
            ]
        }).sort({updatedAt: -1});
        
        const filteredStories = filter(stories, req.userId);

        res.status(200).json({
            stories: filteredStories
        });
    }
    catch(err){
        res.status(500).json({
            message:"Failed to fetch published stories",
            error:err.message
        });
    }
};

// Toggle Publish Story

const publishToggleStory = async (req,res)=>{
    try{
        const { storyId } = req.params;

        //find story by _id
        const story = await Story.findById(storyId); // OR await Story.findOne({_id : storyId});
        if(!story){
            return res.status(404).json({message:"Story not found"});
        }
        
        console.log("storyId:", storyId);

        //check author
        if(story.author.toString()!==req.userId){
            return res.status(403).json({message:"Only author cab -publish or unpublish"});
        }

        // toggle publish status

        story.isPublished = !story.isPublished;
        await story.save();

        res.status(200).json({
            message: story.isPublished ?"Story Published successfully": "Styory Unpublished successfully",
            isPublished : story.isPublished
        });
    }
    catch(err){
        return res.status(500).json({
            message:"Failed to update publish status",
            error:err.message
        });
    }
}

// export story as PDF

const exportStoryPDF = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId)
      .populate("author", "name");

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (!story.isPublished) {
      return res.status(400).json({
        message: "Only published stories can be exported"
      });
    }

    const chapters = await Chapter.find({
      story: storyId,
      isBranch: false
    }).sort({ order: 1 });

    await generateStoryPDF(story, chapters, res);

  } catch (err) {
    res.status(500).json({
      message: "Failed to export story as PDF",
      error: err.message
    });
  }
};

module.exports = { createStory, 
                    addCollaborator,
                    getMyOngoingStories,
                    getMyPublishedStories,
                    publishToggleStory,
                    exportStoryPDF
                };