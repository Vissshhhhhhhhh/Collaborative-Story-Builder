const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {createStory, addCollaborator,getMyOngoingStories,getMyPublishedStories, publishToggleStory, exportStoryPDF} = require("../controllers/storyController");

router.post("/",authMiddleware,createStory);

router.post("/:storyId/collaborators", authMiddleware, addCollaborator);

router.get("/my/ongoing", authMiddleware, getMyOngoingStories);

router.get("/my/published", authMiddleware, getMyPublishedStories);

router.patch("/:storyId/publish",authMiddleware,publishToggleStory);

router.get("/:storyId/export/pdf",authMiddleware,exportStoryPDF);
module.exports = router;