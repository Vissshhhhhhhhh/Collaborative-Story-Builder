//imports
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const cors= require("cors");
const testRoutes = require("./routes/testRoutes");
const storyRoutes = require("./routes/storyRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cookieParser());

/*
    Middleware section
*/
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:4173"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/user",userRoutes);

/*
test route
*/
app.use("/api/test", testRoutes);

app.get("/",(req,res)=>{
    res.send("site is running");
});

module.exports = app;
