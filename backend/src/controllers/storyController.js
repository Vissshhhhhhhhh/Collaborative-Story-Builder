const mongoose = require("mongoose");
const Story = require("../models/Story");
const User = require("../models/User");
const generateStoryPDF = require("../utils/pdfGenerator");
const Chapter = require("../models/Chapter");
const cloudinary = require("../config/cloudinary");

const createStory = async (req, res) => {
  try {
    const { title, description } = req.body;

    const story = await Story.create({
      title,
      description,
      author: req.userId,
      collaborators: [req.userId],
    });

    res.status(201).json({
      message: "Story created successfully",
      story,
    });
  } catch (err) {
    res.status(500).json({
      message: "Story creation failed",
      error: err.message,
    });
  }
};

const addCollaborator = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { email } = req.body;
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.author.toString() !== req.userId) {
      return res.status(403).json({
        message: "Only author can invite collaborators",
      });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({
        message: "User to be Invited is not found",
      });
    }

    if (
      story.collaborators.some(
        (id) => id.toString() === userToInvite._id.toString(),
      )
    ) {
      return res.status(400).json({
        message: "User already a collaborator",
      });
    }

    story.collaborators.push(userToInvite._id);
    await story.save();

    res.status(200).json({
      message: "Collaborator added successfully",
      collaborators: story.collaborators,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to add collaborator",
      error: err.message,
    });
  }
};

function filter(stories, userId) {
  return stories.map((story) => {
    const storyObj = story.toObject();

    if (storyObj.author.toString() !== userId.toString()) {
      delete storyObj.collaborators;
    }
    return storyObj;
  });
}

const getMyOngoingStories = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const stories = await Story.find({
      isPublished: false,
      $or: [
        { author: userObjectId },
        {
          collaborators: userObjectId,
        },
      ],
    }).sort({ updatedAt: -1 });

    const filteredStories = filter(stories, req.userId);
    res.status(200).json({
      stories: filteredStories,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch ongoing stories",
      error: err.message,
    });
  }
};

const getMyPublishedStories = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const stories = await Story.find({
      isPublished: true,
      $or: [{ author: userObjectId }, { collaborators: userObjectId }],
    }).sort({ updatedAt: -1 });

    const filteredStories = filter(stories, req.userId);

    res.status(200).json({
      stories: filteredStories,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch published stories",
      error: err.message,
    });
  }
};

// Toggle Publish Story

const publishToggleStory = async (req, res) => {
  try {
    const { storyId } = req.params;

    //find story by _id
    const story = await Story.findById(storyId); // OR await Story.findOne({_id : storyId});
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    console.log("storyId:", storyId);

    //check author
    if (story.author.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Only author cab -publish or unpublish" });
    }

    // toggle publish status

    story.isPublished = !story.isPublished;
    await story.save();

    res.status(200).json({
      message: story.isPublished
        ? "Story Published successfully"
        : "Styory Unpublished successfully",
      isPublished: story.isPublished,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update publish status",
      error: err.message,
    });
  }
};

// get all published stories

const getPublicPublishedStories = async (req, res) => {
  try {
    const stories = await Story.find(
      { isPublished: true },
      { title: 1, description: 1, coverImage: 1, author: 1, createdAt: 1 },
    )
      .populate("author", "name")
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({ stories });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch published stories",
      error: err.message,
    });
  }
};

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

    // ⚠️ VERY IMPORTANT
    // After this line, DO NOT touch res again
    generateStoryPDF(story, chapters, res);

  } catch (err) {
    console.error("PDF EXPORT ERROR:", err);
    // ❌ DO NOT send JSON here
    if (!res.headersSent) {
      res.status(500).end();
    }
  }
};


// Get all collaborators

const getCollaborators = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId).populate(
      "collaborators",
      "name email",
    );

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.author.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Only author can view collaborators" });
    }

    res.status(200).json({
      collaborators: story.collaborators,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch collaborators",
      error: err.message,
    });
  }
};

// Remove collaborator (Author only)

const removeCollaborator = async (req, res) => {
  try {
    const { storyId, collaboratorId } = req.params;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.author.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Only author can remove collaborators" });
    }

    // ❗prevent author removal
    if (story.author.toString() === collaboratorId.toString()) {
      return res.status(400).json({ message: "Author cannot be removed" });
    }

    story.collaborators = story.collaborators.filter(
      (id) => id.toString() !== collaboratorId.toString(),
    );

    await story.save();

    res.status(200).json({
      message: "Collaborator removed successfully",
      collaborators: story.collaborators,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to remove collaborator",
      error: err.message,
    });
  }
};

// delete a story

const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.author.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Only author can delete the story" });
    }

    // delete chapters first
    await Chapter.deleteMany({ story: storyId });

    // delete story
    await Story.findByIdAndDelete(storyId);

    res.status(200).json({
      message: "Story deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete story",
      error: err.message,
    });
  }
};

const getStoryById = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId)
      .populate("author", "name")
      .select(
        "title description coverImage author collaborators isPublished createdAt updatedAt",
      );

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // ✅ Permission: author or collaborator
    const isAllowed =
      story.author._id.toString() === req.userId ||
      story.collaborators.some((id) => id.toString() === req.userId);

    if (!isAllowed) {
      return res
        .status(403)
        .json({ message: "You are not allowed to view this story" });
    }

    res.status(200).json({
      story: {
        _id: story._id,
        title: story.title,
        description: story.description,
        coverImage: story.coverImage,
        author: story.author,
        collaborators: story.collaborators, // ✅ ADD THIS
        isPublished: story.isPublished,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch story",
      error: err.message,
    });
  }
};

// ✅ PUBLIC: get story by id (only if published)
const getPublicStoryById = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId).populate("author", "name");

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // ✅ Only published stories are public
    if (!story.isPublished) {
      return res.status(403).json({ message: "This story is not published" });
    }

    res.status(200).json({
      story: {
        _id: story._id,
        title: story.title,
        description: story.description,
        author: story.author,
        coverImage: story.coverImage,
        createdAt: story.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch public story",
      error: err.message,
    });
  }
};

//update story details
const updateStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { title } = req.body;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.author.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Only author can edit the story" });
    }

    if (typeof title === "string") {
      const trimmed = title.trim();
      if (!trimmed) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      story.title = trimmed;
    }

    await story.save();

    res.status(200).json({
      message: "Story updated successfully",
      story,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to update story",
      error: err.message,
    });
  }
};

//cloudinary + multer setup
const uploadStoryImage = async (req, res) => {
  try {
    const { storyId } = req.params;

    if (!req.file) {
      console.error("UPLOAD ERROR: No file in request");
      return res.status(400).json({
        message: "No image file uploaded",
      });
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Handle both Cloudinary response format and direct path
    const imageUrl = req.file.path || req.file.secure_url;
    const imagePublicId = req.file.filename || req.file.public_id;

    story.coverImage = {
      url: imageUrl,
      publicId: imagePublicId,
    };

    await story.save();

    res.status(200).json({
      message: "Image uploaded successfully",
      coverImage: story.coverImage,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    res.status(500).json({
      message: "Image upload failed",
      error: err.message,
    });
  }
};

module.exports = {
  createStory,
  addCollaborator,
  getMyOngoingStories,
  getMyPublishedStories,
  publishToggleStory,
  getPublicPublishedStories,
  getCollaborators,
  removeCollaborator,
  deleteStory,
  getStoryById,
  getPublicStoryById,
  updateStory,
  uploadStoryImage,
  exportStoryPDF,
};
