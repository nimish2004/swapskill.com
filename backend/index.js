// 🔥 FULL FIXED BACKEND (REALTIME WORKING)

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

// ───────────────── SOCKET ─────────────────

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // ✅ FIX 1: JOIN ROOM (frontend wala)
  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);
    console.log(`📦 Joined room: ${roomId}`);
  });

  socket.on("leave-room", ({ roomId }) => {
    socket.leave(roomId);
  });

  // 🔥 KEEP OLD (compatibility)
  socket.on("join-whiteboard", ({ roomId }) => {
    socket.join(roomId);
  });

  // ── WHITEBOARD ──
  socket.on("draw-stroke", (payload) => {
    socket.to(payload.roomId).emit("draw-stroke", payload);
  });

  socket.on("clear-board", ({ roomId }) => {
    socket.to(roomId).emit("clear-board");
  });

  socket.on("sticky-add",    (payload) => socket.to(payload.roomId).emit("sticky-add", payload));
  socket.on("sticky-update", (payload) => socket.to(payload.roomId).emit("sticky-update", payload));
  socket.on("sticky-move",   (payload) => socket.to(payload.roomId).emit("sticky-move", payload));
  socket.on("sticky-remove", (payload) => socket.to(payload.roomId).emit("sticky-remove", payload));

  // 🔥 NEW: CHAT REALTIME (IMPORTANT)
  socket.on("send-message", (msg) => {
    socket.to(msg.receiver).emit("receive-message", msg);
  });

  // ── GROUP SESSION (UNCHANGED) ──
  socket.on("join-group-room", ({ code, userId, userName }) => {
    const room = groupRooms[code];
    if (!room) return socket.emit("group-error", { message: "Room not found" });

    socket._groupCode = code;
    socket._groupUser = { id: userId, name: userName };

    if (!room.members.find(m => m.id === userId)) {
      room.members.push({ id: userId, name: userName });
    }

    socket.join(`group-${code}`);

    io.to(`group-${code}`).emit("group-members-updated", { members: room.members });

    socket.to(`group-${code}`).emit("group-chat-message", {
      system: true,
      text: `${userName} joined the session`,
      ts: Date.now(),
    });

    console.log(`🎓 ${userName} joined group room ${code}`);
  });

  socket.on("group-chat-message", ({ code, userId, userName, text }) => {
    io.to(`group-${code}`).emit("group-chat-message", {
      userId, userName, text, ts: Date.now(),
    });
  });

  socket.on("leave-group-room", ({ code, userId, userName }) => {
    leaveGroup(socket, code, userId, userName);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);

    if (socket._groupCode && socket._groupUser) {
      leaveGroup(socket, socket._groupCode, socket._groupUser.id, socket._groupUser.name);
    }
  });
});

// helper
function leaveGroup(socket, code, userId, userName) {
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

  if (room.host === userId && room.members.length === 0) {
    delete groupRooms[code];
    console.log(`🗑️ Room deleted: ${code}`);
  }

  console.log(`👋 ${userName} left group room ${code}`);
}

// ── DB CONNECT ──
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });