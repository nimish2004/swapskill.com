const express = require("express");
const router = express.Router();

// In-memory group rooms store (shared with socket layer via module export)
// Structure: { code: { host, hostName, skill, members: [{ id, name }], createdAt } }
const groupRooms = {};

// Generate a short 6-char alphanumeric code
function genCode(skill) {
  const prefix = (skill || "GRP").replace(/\s+/g, "").toUpperCase().slice(0, 3);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${rand}`;
}

// POST /api/group/create
// Body: { hostId, hostName, skill }
router.post("/create", (req, res) => {
  const { hostId, hostName, skill } = req.body;
  if (!hostId || !skill) return res.status(400).json({ error: "hostId and skill are required" });

  let code;
  // Ensure uniqueness
  do { code = genCode(skill); } while (groupRooms[code]);

  groupRooms[code] = {
    host: hostId,
    hostName: hostName || "Host",
    skill,
    members: [],
    createdAt: new Date().toISOString(),
  };

  console.log(`🎓 Group room created: ${code} (${skill}) by ${hostName}`);
  res.json({ code, skill, hostName });
});

// GET /api/group/:code  — preview before joining
router.get("/:code", (req, res) => {
  const room = groupRooms[req.params.code.toUpperCase()];
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({
    code: req.params.code.toUpperCase(),
    skill: room.skill,
    hostName: room.hostName,
    memberCount: room.members.length,
  });
});

// DELETE /api/group/:code  — close a room (host leaves)
router.delete("/:code", (req, res) => {
  const code = req.params.code.toUpperCase();
  if (groupRooms[code]) {
    delete groupRooms[code];
    console.log(`🗑️  Group room closed: ${code}`);
  }
  res.json({ ok: true });
});

module.exports = { router, groupRooms };
