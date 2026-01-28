const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const Chapter = require("./models/Chapter");

// ✅ One active socket per user
const userSocketMap = new Map(); // userId -> socketId

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        const allowed = [
          process.env.FRONTEND_URL,
          "http://localhost:5173"
        ];

        if (!origin || allowed.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    }

  });

  // ✅ Cookie JWT auth for socket
  io.use((socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error("No cookie"));

      const cookies = cookie.parse(rawCookie);

      const token = cookies.token;
      if (!token) return next(new Error("No token cookie"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // must contain userId

      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, socket.user?.userId);

    let currentStoryId = null;
    const LOCK_TTL_MS = 30 * 1000; // ✅ 30s lease

    // ✅ Kick previous socket of same user (prevents lock stealing on spam reload)
    const userId = socket.user?.userId?.toString();
    if (userId) {
      const oldSocketId = userSocketMap.get(userId);

      if (oldSocketId && oldSocketId !== socket.id) {
        const oldSocket = io.sockets.sockets.get(oldSocketId);
        if (oldSocket) {
          oldSocket.disconnect(true);
          console.log("✅ Kicked old socket:", oldSocketId, "for user:", userId);
        }
      }

      userSocketMap.set(userId, socket.id);
      
    }

    socket.on("story:join", ({ storyId }) => {
      if (!storyId) return;
      currentStoryId = storyId;
      socket.join(`story:${storyId}`);
    });

    // ✅ LOCK (owner-based lock + heartbeat safe)
    socket.on("chapter:lock", async ({ storyId, chapterId }) => {
      try {
        if (!storyId || !chapterId) return;

        const chapter = await Chapter.findById(chapterId).populate("lockedBy", "name");
        if (!chapter) return;

        const now = new Date();
        const myUserId = socket.user.userId.toString();

        // ✅ If chapter is already locked
        if (chapter.isLocked) {
          const lockedById = chapter.lockedBy?._id
            ? chapter.lockedBy._id.toString()
            : chapter.lockedBy?.toString();

          // ✅ If lock expired -> clear it
          if (chapter.lockExpiresAt && chapter.lockExpiresAt <= now) {
            chapter.isLocked = false;
            chapter.lockedBy = null;
            chapter.lockedSocketId = null;
            chapter.lockExpiresAt = null;
          } else {
            // ✅ Lock still active

            // ✅ Same USER refreshing / reconnecting -> allow and renew
            if (lockedById === myUserId) {
              chapter.lockedSocketId = socket.id;
              chapter.lockExpiresAt = new Date(now.getTime() + LOCK_TTL_MS);
              await chapter.save();

              const updated = await Chapter.findById(chapterId).populate("lockedBy", "name");

              io.to(`story:${storyId}`).emit("chapter:lockUpdated", {
                chapterId,
                chapter: updated,
              });
              return;
            }

            // ✅ Another user -> deny
            socket.emit("chapter:lockDenied", {
              chapterId,
              lockedBy: chapter.lockedBy,
            });
            return;
          }
        }

        // ✅ Acquire lock (new lock)
        chapter.isLocked = true;
        chapter.lockedBy = socket.user.userId;
        chapter.lockedSocketId = socket.id;
        chapter.lockExpiresAt = new Date(Date.now() + LOCK_TTL_MS);
        await chapter.save();

        const updated = await Chapter.findById(chapterId).populate("lockedBy", "name");

        io.to(`story:${storyId}`).emit("chapter:lockUpdated", {
          chapterId,
          chapter: updated,
        });
      } catch (err) {
        console.log("chapter:lock error:", err.message);
      }
    });


    // ✅ UNLOCK (only socket owner)
    socket.on("chapter:unlock", async ({ storyId, chapterId }) => {
      try {
        if (!storyId || !chapterId) return;

        const chapter = await Chapter.findById(chapterId).populate(
          "lockedBy",
          "name"
        );
        if (!chapter) return;

        // ✅ only socket owner unlocks
        if (chapter.lockedSocketId !== socket.id) return;

        chapter.isLocked = false;
        chapter.lockedBy = null;
        chapter.lockedSocketId = null;
        chapter.lockExpiresAt = null;
        await chapter.save();

        const updated = await Chapter.findById(chapterId).populate(
          "lockedBy",
          "name"
        );

        io.to(`story:${storyId}`).emit("chapter:lockUpdated", {
          chapterId,
          chapter: updated,
        });
      } catch (err) {
        console.log("chapter:unlock error:", err.message);
      }
    });

    socket.on("disconnect", async () => {
        try {
          console.log("Socket disconnected:", socket.id);

          const userId = socket.user?.userId?.toString();
          if (!userId) return;

          // ✅ unlock all chapters locked by this user
          const lockedChapters = await Chapter.find({
            isLocked: true,
            lockedBy: userId,
          });

          await Chapter.updateMany(
            { isLocked: true, lockedBy: userId },
            { $set: { isLocked: false, lockedBy: null, lockedSocketId: null, lockExpiresAt: null } }
          );

          for (const ch of lockedChapters) {
            io.emit("chapter:lockUpdated", {
              chapterId: ch._id,
              chapter: {
                _id: ch._id,
                isLocked: false,
                lockedBy: null,
              },
            });
          }

          // ✅ cleanup user socket map
          if (userSocketMap.get(userId) === socket.id) {
            userSocketMap.delete(userId);
          }
        } catch (err) {
          console.log("disconnect error:", err.message);
        }
      });

  });

  return io;
}

module.exports = setupSocket;
