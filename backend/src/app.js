//imports
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const testRoutes = require("./routes/testRoutes");
const storyRoutes = require("./routes/storyRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cookieParser());

  
const allowedOrigins = [
  process.env.FRONTEND_URL, // Vercel
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/user", userRoutes);

/*
test route
*/
app.use("/api/test", testRoutes);

app.get("/", (req, res) => {
  res.send("site is running");
});

module.exports = app;
