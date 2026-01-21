const Chapter = require("../models/Chapter");
const Story = require("../models/Story");

const createChapter = async (req,res)=>{

    try{
    
        // check story exists
        const { storyId } = req.params;
        const { title, parentChapter } = req.body;

        const story = await Story.findById(storyId);
        if(!story){
            return res.status(404).json({message:"story not found"});
        }
        
        // check access (author or collaborator)
        
        const isAllowed = req.userId === story.author.toString() || story.collaborators.includes(req.userId);
        
        if(!isAllowed){
            return res.status(403).json({message:"You are not allowed to add chapters to this story"});
        }
        
        // prevent duplicate titles (case-insensitive)
        const existingChapter = await Chapter.findOne({
          story: storyId,
          title:{$regex: `^${title}$`, $options:"i"}
        });

        if(existingChapter){
          return res.status(400).json({
            message:"A chapter or branch with this title already exists"
          });
        }

        // Determine chapter order
    
        const chapcount = await Chapter.countDocuments({story:storyId});
    
        // create chapter
        const chapter = await Chapter.create({
            title,
            story: storyId,
            createdBy: req.userId,
            parentChapter: parentChapter || null,
            isBranch: !!parentChapter,
            order: chapcount + 1
        });
        
        // Dynamic success message
        res.status(201).json({message: parentChapter ?"Branch created successfully":"Chapter created successfully",chapter});
    }
    catch(err){
        return res.status(500).json({message: "Failed to create chapter or Branch",error : err.message});
    }
};

const getChapterSidebar = async (req,res)=>{
    try{
        const {storyId} = req.params;

        const chapters = await Chapter.find(
            { story: storyId },
            { title: 1, parentChapter: 1, isBranch: 1, order:1}
        ).sort({order:1});

        res.status(200).json({chapters});
    }
    catch(err){
        res.status(500).json({
            message: "Failed to load chapter sidebar",
            error: err.message
        });
    }
}

const getChapterContent = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await Chapter.findById(chapterId)
      .populate("createdBy", "name")
      .populate("lastEditedBy", "name")
      .populate("lockedBy", "name");


    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    res.status(200).json({ chapter });

  } catch (err) {
    res.status(500).json({
      message: "Failed to load chapter content",
      error: err.message
    });
  }
};


// Update Chapter content (SAVE content of the chapter)

const updateChapterContent = async (req, res)=>{
  try{
    const { chapterId } = req.params;
    const { content } = req.body;

    //1. Find chapter

    const chapter = await Chapter.findById(chapterId);
    if(!chapter){
      return res.status(404).json({message:"Chapter not found"});
    }

    const story = await Story.findById(chapter.story);
    if(!story){
      return res.status(404).json({message: "Story not found"});
    }
    
    if (
        chapter.isLocked &&
        chapter.lockedBy &&
        chapter.lockedBy.toString() !== req.userId
      ) {
        return res.status(423).json({
          message: "Chapter is locked by another user"
        });
      }


    //2. Find related story ( for permission check )
    // Normalization comes here chpater edit permissions are taken from story 
    // No duplication logic is performed


    //3. Permission check

    const isAllowed =story.author.toString()===req.userId || story.collaborators.includes(req.userId);
    if(!isAllowed){
      return res.status(403).json({message: "You are not allowed to edit this chapter"});
    }

    chapter.content = content;
    chapter.lastEditedBy = req.userId;

    await chapter.save();

    res.status(200).json({
      message: "Chapter content saved successfully",
      chapter
    });

  }
  catch(err){
    return res.status(500).json({
      message: "Failed to save chapter content",
      error: err.message
    });
  }
};

// chapter Locking mechanism

const lockChapter = async (req,res)=>{
  try{

    const {chapterId} = req.params;
  
    const chapter = await Chapter.findById(chapterId);
    if(!chapter){
      return res.status(404).json({
        message: "Chapter not found"
      });
    }
  
    if(chapter.isLocked && chapter.lockedBy && chapter.lockedBy.toString() !== req.userId){
      return res.status(423).json({
        message: "chapter is currently locked by another user"
      });
    }
  
    chapter.isLocked =true;
    chapter.lockedBy = req.userId;
    chapter.lockedAt = new Date();
  
    await chapter.save();

    res.status(200).json({
      message: "Chapter locked successfully"
    });
  }
  catch(err){
    return res.status(500).json({
      message: "Failed to lock chapter",
      error : err.message
    });
  }
}

//unlock chapter
const unlockChapter = async (req,res)=>{
  try{
    const {chapterId} = req.params;
    const chapter = await Chapter.findById(chapterId);

    if(!chapter){
      return res.status(404).json({
        message:"Chapter not found"
      });
    }

    //only locker cann unlock

    if(chapter.isLocked && chapter.lockedBy.toString()!==req.userId){
      return res.status(403).json({message: "You're not allowed to unlock this chapter"});
    }

    chapter.isLocked = false;
    chapter.lockedBy = null;
    chapter.lockedAt = null;

    await chapter.save();

    res.status(200).json({
      message:"Chapter unlocked successfully",
    });
  }
  catch(err){
    return res.status(500).json({
      message: "Failed to unlock the chapter",
      error : err.message
    });
  }
}


module.exports = {createChapter,
                     getChapterSidebar, 
                     getChapterContent,
                     updateChapterContent,
                     lockChapter,
                     unlockChapter 
                 };
