import React, { useEffect, useState } from "react";
import {
  FaExchangeAlt, FaSearch, FaLinkedin, FaTimes,
  FaPaperPlane, FaComments, FaStar, FaRegStar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import profileImg from "../assets/profile.jpg";
import { useSelector } from "react-redux";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const loggedInUser = useSelector((state) => state.user.userData);
  const token = useSelector((state) => state.user.token);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    axios
      .get("https://swapskill-com.onrender.com/api/user/all")
      .then((res) => {
        const allUsers = res.data;
        const sorted = allUsers.sort((a, b) => {
          if (a._id === loggedInUser._id) return -1;
          if (b._id === loggedInUser._id) return 1;
          return 0;
        });
        setUsers(sorted);
        setFilteredUsers(sorted);
      })
      .catch((err) => console.error("Failed to fetch users", err))
      .finally(() => setLoading(false));
  }, [loggedInUser]);

  useEffect(() => {
    if (isChatOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isChatOpen]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get("https://swapskill-com.onrender.com/api/discussion");
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post("https://swapskill-com.onrender.com/api/discussion", {
        user: loggedInUser.name,
        message: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        (user.canTeach && user.canTeach.toLowerCase().includes(term)) ||
        (user.wantToLearn && user.wantToLearn.toLowerCase().includes(term))
    );
    setFilteredUsers(filtered);
  };

  const sendRequest = async (toUserId, skill, type) => {
    try {
      await axios.post(
        "https://swapskill-com.onrender.com/api/user/request",
        { toUserId, skill, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Request sent!");
      const updateFn = (prev) =>
        prev.map((u) =>
          u._id === toUserId
            ? { ...u, requests: [...(u.requests || []), { from: loggedInUser._id, skill, type }] }
            : u
        );
      setUsers(updateFn);
      setFilteredUsers(updateFn);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to send request.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <ToastContainer />

      {/* Navbar */}
      <nav className="ss-nav sticky top-0 z-50 flex justify-between items-center px-4 sm:px-6 py-3 gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <FaExchangeAlt style={{ color: "var(--accent)", fontSize: 18 }} />
          <span className="grad-text" style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}>SwapSkill</span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md px-3 py-2"
          style={{ background: "var(--bg-surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
          <FaSearch style={{ color: "var(--text-muted)", fontSize: 13, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search skills or users..."
            value={searchTerm}
            onChange={handleSearch}
            style={{ background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 13, width: "100%" }}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5"
            style={{ background: "#22c97a12", borderRadius: 20, border: "1px solid #22c97a25" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 500 }}>103 Live</span>
          </div>
          <img
            src={profileImg}
            alt="Profile"
            onClick={() => navigate("/edit-profile")}
            style={{ width: 36, height: 36, borderRadius: "50%", cursor: "pointer", border: "2px solid var(--accent)", objectFit: "cover" }}
          />
        </div>
      </nav>

      {/* Main */}
      <main className="flex-grow px-4 sm:px-6 py-10">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="mb-10">
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>
              Connect with Learners & Mentors
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} available
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ color: "var(--text-muted)", fontSize: 15 }}>No users match your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUsers.map((user) => {
                const ratings = Array.isArray(user.ratings) ? user.ratings : [];
                const totalReviews = ratings.length;
                let avgRating = 0;
                if (totalReviews > 0) {
                  const sum = ratings.reduce((acc, r) => acc + (r.stars || 0), 0);
                  avgRating = Number((sum / totalReviews).toFixed(1));
                }
                const fullStars = Math.floor(avgRating);
                const emptyStars = 5 - fullStars;
                const isMe = user._id === loggedInUser._id;

                return (
                  <div key={user._id} className="ss-card p-5 flex flex-col" style={{ position: "relative" }}>
                    {isMe && (
                      <span className="ss-tag ss-tag-purple" style={{ position: "absolute", top: 14, right: 14, fontSize: 10 }}>
                        You
                      </span>
                    )}

                    {/* Avatar + Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=7c6af7`}
                        alt={user.name}
                        style={{ width: 46, height: 46, borderRadius: "50%", border: "2px solid var(--accent)30", flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {user.name}
                        </p>
                        <p style={{ color: "var(--text-muted)", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2 mb-4 flex-grow">
                      <div>
                        <span className="ss-tag ss-tag-green" style={{ marginBottom: 4, display: "inline-block" }}>Teaches</span>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                          {user.canTeach || "—"}
                        </p>
                      </div>
                      <div>
                        <span className="ss-tag ss-tag-purple" style={{ marginBottom: 4, display: "inline-block" }}>Learns</span>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                          {user.wantToLearn || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(fullStars)].map((_, i) => (
                        <FaStar key={i} style={{ color: "var(--amber)", fontSize: 12 }} />
                      ))}
                      {[...Array(emptyStars)].map((_, i) => (
                        <FaRegStar key={i} style={{ color: "var(--text-muted)", fontSize: 12 }} />
                      ))}
                      <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>
                        {avgRating} ({totalReviews})
                      </span>
                    </div>

                    {/* Action buttons */}
                    {!isMe && (
                      <div className="flex gap-2">
                        {user.requests?.some((r) => r.from === loggedInUser._id && r.type === "learn") ? (
                          <button disabled style={{
                            flex: 1, padding: "8px 0", fontSize: 12, borderRadius: 8, fontWeight: 500,
                            background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border)", cursor: "not-allowed"
                          }}>Pending</button>
                        ) : (
                          <button onClick={() => sendRequest(user._id, user.canTeach || "Skill", "learn")}
                            className="btn-primary" style={{ flex: 1, padding: "8px 0", fontSize: 12 }}>
                            Learn
                          </button>
                        )}

                        {user.requests?.some((r) => r.from === loggedInUser._id && r.type === "teach") ? (
                          <button disabled style={{
                            flex: 1, padding: "8px 0", fontSize: 12, borderRadius: 8, fontWeight: 500,
                            background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border)", cursor: "not-allowed"
                          }}>Pending</button>
                        ) : (
                          <button onClick={() => sendRequest(user._id, user.wantToLearn || "Skill", "teach")}
                            className="btn-green" style={{ flex: 1, padding: "8px 0", fontSize: 12 }}>
                            Teach
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="ss-card p-8 w-96 text-center" style={{ borderRadius: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>Action Required</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              First send a <strong>Request to Learn</strong> from this mentor before rating.
            </p>
            <button onClick={() => setShowPopup(false)} className="btn-primary" style={{ padding: "10px 28px" }}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Floating chat */}
      <button
        onClick={() => setIsChatOpen(true)}
        style={{
          position: "fixed", bottom: 28, right: 28,
          width: 52, height: 52, borderRadius: "50%",
          background: "var(--accent)", color: "#fff",
          border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 24px var(--accent-glow)", transition: "transform 0.15s"
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <FaComments size={20} />
      </button>

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20,
            width: 400, height: 520, display: "flex", flexDirection: "column", overflow: "hidden"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>Community Chat</p>
                <p style={{ color: "var(--text-muted)", fontSize: 12 }}>Open discussion</p>
              </div>
              <FaTimes style={{ cursor: "pointer", color: "var(--text-muted)", fontSize: 16 }} onClick={() => setIsChatOpen(false)} />
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map((msg, idx) => {
                const isOwn = msg.user === loggedInUser.name;
                return (
                  <div key={idx} style={{ alignSelf: isOwn ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                    {!isOwn && (
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, fontWeight: 600 }}>{msg.user}</p>
                    )}
                    <div style={{
                      padding: "9px 13px", borderRadius: isOwn ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      background: isOwn ? "var(--accent)" : "var(--bg-surface)",
                      border: isOwn ? "none" : "1px solid var(--border)",
                      fontSize: 13, lineHeight: 1.5
                    }}>
                      {msg.message}
                    </div>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3, textAlign: isOwn ? "right" : "left" }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="ss-input"
                style={{ flex: 1, padding: "8px 12px", fontSize: 13 }}
              />
              <button onClick={sendMessage} className="btn-primary" style={{ padding: "8px 14px", borderRadius: 8 }}>
                <FaPaperPlane size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div className="flex items-center gap-2">
            <FaLinkedin style={{ color: "#60a5fa" }} />
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
              Built by{" "}
              <a href="https://www.linkedin.com/in/nekalsingh/" target="_blank" rel="noreferrer" style={{ color: "#60a5fa" }}>
                Nekal Singh
              </a>
            </span>
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: 11 }}>© {new Date().getFullYear()} SwapSkill</span>
        </div>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Dashboard;
