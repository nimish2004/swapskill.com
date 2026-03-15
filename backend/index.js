const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const discussionRoutes = require("./routes/discussion");
const { router: groupRoutes, groupRooms } = require("./routes/groupSession");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://swapskill-com-1.onrender.com",
    ],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://swapskill-com-1.onrender.com",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/discussion", discussionRoutes);
app.use("/api/group", groupRoutes);

app.get("/", (req, res) => res.send("✅ API is running!"));

// ─────────────────────────────────────────────────────────
// Socket.io
// 1-to-1 whiteboard rooms:  "wb-<userId1>-<userId2>"
// Group session rooms:       "group-<CODE>"
// ─────────────────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // ── 1-to-1 whiteboard ──────────────────────────────────
  socket.on("join-whiteboard", ({ roomId }) => {
    socket.join(roomId);
    console.log(`📋 ${socket.id} joined whiteboard room: ${roomId}`);
  });

  socket.on("draw-stroke", (payload) => {
    socket.to(payload.roomId).emit("draw-stroke", payload);
  });

  socket.on("clear-board", ({ roomId }) => {
    socket.to(roomId).emit("clear-board");
  });

  socket.on("sticky-add",    (payload) => socket.to(payload.roomId).emit("sticky-add",    payload));
  socket.on("sticky-update", (payload) => socket.to(payload.roomId).emit("sticky-update", payload));
  socket.on("sticky-move",   (payload) => socket.to(payload.roomId).emit("sticky-move",   payload));
  socket.on("sticky-remove", (payload) => socket.to(payload.roomId).emit("sticky-remove", payload));

  // ── Group session socket events ────────────────────────

  // Join a group room
  // payload: { code, userId, userName }
  socket.on("join-group-room", ({ code, userId, userName }) => {
    const room = groupRooms[code];
    if (!room) return socket.emit("group-error", { message: "Room not found" });

    // Track which group room this socket is in (for auto-cleanup on disconnect)
    socket._groupCode = code;
    socket._groupUser = { id: userId, name: userName };

    // Avoid duplicate entries
    if (!room.members.find(m => m.id === userId)) {
      room.members.push({ id: userId, name: userName });
    }

    socket.join(`group-${code}`);
    // Tell everyone (including joiner) the updated member list
    io.to(`group-${code}`).emit("group-members-updated", { members: room.members });
    socket.to(`group-${code}`).emit("group-chat-message", {
      system: true,
      text: `${userName} joined the session`,
      ts: Date.now(),
    });
    console.log(`🎓 ${userName} joined group room ${code}`);
  });

  // Group chat message
  // payload: { code, userId, userName, text }
  socket.on("group-chat-message", ({ code, userId, userName, text }) => {
    io.to(`group-${code}`).emit("group-chat-message", {
      userId, userName, text, ts: Date.now(),
    });
  });

  // Leave group room explicitly
  socket.on("leave-group-room", ({ code, userId, userName }) => {
    _leaveGroup(socket, code, userId, userName);
  });

  // Auto-cleanup on disconnect
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
    if (socket._groupCode && socket._groupUser) {
      _leaveGroup(socket, socket._groupCode, socket._groupUser.id, socket._groupUser.name);
    }
  });
});

// Helper: remove a member from a group room and notify others
function _leaveGroup(socket, code, userId, userName) {
  const room = groupRooms[code];
  if (!room) return;
  room.members = room.members.filter(m => m.id !== userId);
  socket.leave(`group-${code}`);
  io.to(`group-${code}`).emit("group-members-updated", { members: room.members });
  io.to(`group-${code}`).emit("group-chat-message", {
    system: true,
    text: `${userName} left the session`,
    ts: Date.now(),
  });
  // If host left and no members remain, delete the room
  if (room.host === userId && room.members.length === 0) {
    delete groupRooms[code];
    console.log(`🗑️  Group room auto-closed: ${code}`);
  }
  console.log(`👋 ${userName} left group room ${code}`);
}

// MongoDB + start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
