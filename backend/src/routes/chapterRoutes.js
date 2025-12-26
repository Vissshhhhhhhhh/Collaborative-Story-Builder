const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createChapter,
  getChapterSidebar, 
  getChapterContent,
  updateChapterContent,
  lockChapter,
  unlockChapter
} = require("../controllers/chapterController");

//create chapter
router.post(
    "/:storyId",
    authMiddleware,
    createChapter
);

// Sidebar (titles only)
router.get(
  "/sidebar/:storyId",
  authMiddleware,
  getChapterSidebar
);

// Editor content + metadata
router.get(
  "/content/:chapterId",
  authMiddleware,
  getChapterContent
);

// save the editor content

router.patch(
  "/:chapterId",
  authMiddleware,
  updateChapterContent
);

//lock the chapter
router.post(
  "/:chapterId/lock",
  authMiddleware,
  lockChapter
)

//unlock the chapter
router.post(
  "/:chapterId/unlock",
  authMiddleware,
  unlockChapter
)

module.exports = router;