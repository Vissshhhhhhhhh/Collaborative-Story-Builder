//imports
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const cors= require("cors");
const testRoutes = require("./routes/testRoutes");
const storyRoutes = require("./routes/storyRoutes");
const chapterRoutes = require("./routes/chapterRoutes");

const app = express();
/*
    Middleware section
*/
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/chapters", chapterRoutes);

/*
test route
*/
app.use("/api/test", testRoutes);

app.get("/",(req,res)=>{
    res.send("site is running");
});

module.exports = app;
