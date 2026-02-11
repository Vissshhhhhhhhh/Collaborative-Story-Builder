const Chapter = require("../models/Chapter");
const Story = require("../models/Story");
const LOCK_TTL_MS = 2 * 60 * 1000; // 2 minutes

const createChapter = async (req, res) => {
  try {
    // check story exists
    const { storyId } = req.params;
    const { title, parentChapter } = req.body;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "story not found" });
    }

    // check access (author or collaborator)

    const isAllowed =
      req.userId === story.author.toString() ||
      story.collaborators.includes(req.userId);

    if (!isAllowed) {
      return res
        .status(403)
        .json({ message: "You are not allowed to add chapters to this story" });
    }

    // prevent duplicate titles (case-insensitive)
    const existingChapter = await Chapter.findOne({
      story: storyId,
      title: { $regex: `^${title}$`, $options: "i" },
    });

    if (existingChapter) {
      return res.status(400).json({
        message: "A chapter or branch with this title already exists",
      });
    }

    // Determine chapter order

    const chapcount = await Chapter.countDocuments({ story: storyId });

    // create chapter
    const chapter = await Chapter.create({
      title,
      story: storyId,
      createdBy: req.userId,
      parentChapter: parentChapter || null,
      isBranch: !!parentChapter,
      order: chapcount + 1,
    });

    // Dynamic success message
    res.status(201).json({
      message: parentChapter
        ? "Branch created successfully"
        : "Chapter created successfully",
      chapter,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to create chapter or Branch",
      error: err.message,
    });
  }
};

const getChapterSidebar = async (req, res) => {
  try {
    const { storyId } = req.params;

    const chapters = await Chapter.find(
      { story: storyId },
      {
        title: 1,
        parentChapter: 1,
        isBranch: 1,
        order: 1,
        isLocked: 1,
        lockedBy: 1,
        lockExpiresAt: 1,
      },
    )
      .populate("lockedBy", "_id name")
      .sort({ order: 1 });

    res.status(200).json({ chapters });
  } catch (err) {
    res.status(500).json({
      message: "Failed to load chapter sidebar",
      error: err.message,
    });
  }
};

const getChapterContent = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await Chapter.findById(chapterId)
      .populate("createdBy", "name")
      .populate("lastEditedBy", "name")
      .populate("lockedBy", "_id name");

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const now = new Date();

    if (
      chapter.isLocked &&
      chapter.lockExpiresAt &&
      chapter.lockExpiresAt <= now
    ) {
      chapter.isLocked = false;
      chapter.lockedBy = null;
      chapter.lockedAt = null;
      chapter.lockExpiresAt = null;
      await chapter.save();
    }

    res.status(200).json({ chapter });
  } catch (err) {
    res.status(500).json({
      message: "Failed to load chapter content",
      error: err.message,
    });
  }
};

// Update Chapter content (SAVE content of the chapter)

const updateChapterContent = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { content } = req.body;

    //1. Find chapter

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const story = await Story.findById(chapter.story);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    const now = new Date();

    if (
      chapter.isLocked &&
      chapter.lockExpiresAt &&
      chapter.lockExpiresAt <= now
    ) {
      chapter.isLocked = false;
      chapter.lockedBy = null;
      chapter.lockedAt = null;
      chapter.lockExpiresAt = null;
      await chapter.save();
    }

    if (
      chapter.isLocked &&
      chapter.lockedBy &&
      chapter.lockedBy.toString() !== req.userId
    ) {
      return res.status(423).json({
        message: "Chapter is locked by another user",
      });
    }

    //2. Find related story ( for permission check )
    // Normalization comes here chpater edit permissions are taken from story
    // No duplication logic is performed

    //3. Permission check

    const isAllowed =
      story.author.toString() === req.userId ||
      story.collaborators.includes(req.userId);
    if (!isAllowed) {
      return res
        .status(403)
        .json({ message: "You are not allowed to edit this chapter" });
    }

    chapter.content = content;
    chapter.lastEditedBy = req.userId;

    await chapter.save();

    res.status(200).json({
      message: "Chapter content saved successfully",
      chapter,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to save chapter content",
      error: err.message,
    });
  }
};

// locking mechanism
const lockChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const now = new Date();

    // ✅ if currently locked by someone else AND not expired -> block
    if (
      chapter.isLocked &&
      chapter.lockedBy &&
      chapter.lockedBy.toString() !== req.userId
    ) {
      // ✅ check if lock expired
      if (chapter.lockExpiresAt && chapter.lockExpiresAt > now) {
        return res.status(423).json({
          message: "Chapter is currently locked by another user",
        });
      }

      // ✅ expired -> release and allow takeover
      chapter.isLocked = false;
      chapter.lockedBy = null;
      chapter.lockedAt = null;
      chapter.lockExpiresAt = null;
    }

    // ✅ lock (or renew lock if same user)
    chapter.isLocked = true;
    chapter.lockedBy = req.userId;
    chapter.lockedAt = now;
    chapter.lockExpiresAt = new Date(now.getTime() + LOCK_TTL_MS);

    await chapter.save();

    return res.status(200).json({
      message: "Chapter locked successfully",
      lockExpiresAt: chapter.lockExpiresAt,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to lock chapter",
      error: err.message,
    });
  }
};

// unlock chapter

const unlockChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // only locker can unlock
    if (
      chapter.isLocked &&
      chapter.lockedBy &&
      chapter.lockedBy.toString() !== req.userId
    ) {
      return res
        .status(403)
        .json({ message: "You're not allowed to unlock this chapter" });
    }

    chapter.isLocked = false;
    chapter.lockedBy = null;
    chapter.lockedAt = null;
    chapter.lockExpiresAt = null;

    await chapter.save();

    return res.status(200).json({
      message: "Chapter unlocked successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to unlock the chapter",
      error: err.message,
    });
  }
};

// ✅ PUBLIC: chapter sidebar for Reader (only published stories)
const getPublicChapterSidebar = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (!story.isPublished) {
      return res.status(403).json({ message: "This story is not published" });
    }

    const chapters = await Chapter.find({ story: storyId })
  .select('_id title parentChapter isBranch order')
  .sort({ order: 1 })
  .lean();

res.status(200).json({ chapters });

  } catch (err) {
    res.status(500).json({
      message: "Failed to load public chapter sidebar",
      error: err.message,
    });
  }
};

// ✅ PUBLIC: chapter content for Reader (only published stories)
const getPublicChapterContent = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await Chapter.findById(chapterId).select(
      "title content story",
    );

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const story = await Story.findById(chapter.story);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (!story.isPublished) {
      return res.status(403).json({ message: "This story is not published" });
    }

    res.status(200).json({
      chapter: {
        _id: chapter._id,
        title: chapter.title,
        content: chapter.content,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to load public chapter content",
      error: err.message,
    });
  }
};

// ✅ Rename chapter/branch title
const renameChapterTitle = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }

    const chapter = await Chapter.findById(chapterId).populate(
      "lockedBy",
      "_id name",
    );
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const story = await Story.findById(chapter.story);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // ✅ Check lock expiry
    const now = new Date();
    if (
      chapter.isLocked &&
      chapter.lockExpiresAt &&
      chapter.lockExpiresAt <= now
    ) {
      chapter.isLocked = false;
      chapter.lockedBy = null;
      chapter.lockedAt = null;
      chapter.lockExpiresAt = null;
      await chapter.save();
    }

    // ✅ Block if locked by another user
    if (
      chapter.isLocked &&
      chapter.lockedBy &&
      chapter.lockedBy._id.toString() !== req.userId
    ) {
      return res.status(423).json({
        message: "Chapter is locked by another user",
      });
    }

    // ✅ Permission: author or collaborator
    const isAllowed =
      story.author.toString() === req.userId ||
      story.collaborators.some((id) => id.toString() === req.userId);

    if (!isAllowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // ✅ Prevent duplicate titles inside same story (case-insensitive)
    const exists = await Chapter.findOne({
      story: chapter.story,
      _id: { $ne: chapterId },
      title: { $regex: `^${title.trim()}$`, $options: "i" },
    });

    if (exists) {
      return res
        .status(400)
        .json({ message: "Title already exists in this story" });
    }

    chapter.title = title.trim();
    await chapter.save();

    return res.status(200).json({
      message: "Chapter title updated",
      chapter,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to rename chapter",
      error: err.message,
    });
  }
};

// ✅ Delete chapter or branch
const deleteChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const story = await Story.findById(chapter.story);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // 🔒 LOCK_DELETE_SYNC (ADD HERE)
    const now = new Date();

    if (
      chapter.isLocked &&
      chapter.lockedBy &&
      chapter.lockedBy.toString() !== req.userId &&
      chapter.lockExpiresAt &&
      chapter.lockExpiresAt > now
    ) {
      return res.status(423).json({
        message: "Chapter is locked by another user",
      });
    }

    // ✅ Permission: author OR collaborator
    const isAllowed =
      story.author.toString() === req.userId ||
      story.collaborators.some((id) => id.toString() === req.userId);

    if (!isAllowed) {
      return res.status(403).json({ message: "Not allowed to delete" });
    }

    // ✅ If deleting a chapter → delete its branches first
    if (!chapter.isBranch) {
      await Chapter.deleteMany({ parentChapter: chapter._id });
    }

    // ✅ Delete selected chapter or branch
    await Chapter.findByIdAndDelete(chapterId);

    return res.status(200).json({
      message: chapter.isBranch
        ? "Branch deleted successfully"
        : "Chapter and its branches deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete",
      error: err.message,
    });
  }
};



module.exports = {
  createChapter,
  getChapterSidebar,
  getChapterContent,
  updateChapterContent,
  getPublicChapterSidebar,
  getPublicChapterContent,
  lockChapter,
  unlockChapter,
  renameChapterTitle,
  deleteChapter,
};
