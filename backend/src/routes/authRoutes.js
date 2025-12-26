const express  =require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");


const {signup,Login, googleLogin} = require("../controllers/authController.js");

router.post("/signup",signup);
router.post("/login",Login);
router.post("/google",googleLogin);

module.exports = router;