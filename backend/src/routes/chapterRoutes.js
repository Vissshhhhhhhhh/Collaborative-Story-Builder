const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createChapter,
  getChapterSidebar, 
  getChapterContent,
  updateChapterContent,
  getPublicChapterSidebar,
  getPublicChapterContent,
  lockChapter,
  unlockChapter,
  renameChapterTitle,
  deleteChapter
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

// ✅ rename chapter/branch title
router.patch(
  "/:chapterId/rename",
  authMiddleware,
  renameChapterTitle
);

// ✅ delete chapter/branch
router.delete(
  "/:chapterId",
  authMiddleware,
  deleteChapter
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

router.get("/public/sidebar/:storyId", getPublicChapterSidebar);

router.get("/public/content/:chapterId", getPublicChapterContent);

router.delete("/:chapterId", authMiddleware, deleteChapter);

module.exports = router;