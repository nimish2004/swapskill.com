import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { FaArrowLeft, FaStar, FaCalendarAlt, FaPaperPlane } from "react-icons/fa";

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSelector((state) => state.user.token);
  const currentUser = useSelector((state) => state.user.userData);
  const { toUserId, toUserName, toUserEmail } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `https://swapskill-com.onrender.com/api/user/get-messages/${toUserId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    if (toUserId) fetchMessages();
  }, [toUserId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await axios.post(
        "https://swapskill-com.onrender.com/api/user/send-message",
        { toUserId, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, { sender: currentUser._id, receiver: toUserId, content: text }]);
      setText("");
    } catch (err) {
      console.error("Send error", err);
    }
  };

  const submitRating = async () => {
    try {
      await axios.post(
        "https://swapskill-com.onrender.com/api/user/rate-user",
        { mentorId: toUserId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowRating(false);
      setRating(0);
    } catch (error) {
      console.error(error);
    }
  };

  const scheduleMeeting = () => {
    const title = encodeURIComponent(`Meeting with ${toUserName}`);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&add=${toUserEmail}&details=Meeting%20scheduled%20via%20SwapSkill&conferenceData.createRequest=true`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="ss-card p-8 w-80 text-center" style={{ borderRadius: 18 }}>
            <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Rate {toUserName}</p>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>How was your skill exchange session?</p>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  style={{
                    fontSize: 32, cursor: "pointer",
                    color: (hover || rating) >= star ? "var(--amber)" : "var(--text-muted)",
                    transition: "color 0.1s, transform 0.1s",
                    transform: (hover || rating) >= star ? "scale(1.15)" : "scale(1)",
                    display: "inline-block"
                  }}
                >★</span>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRating(false)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={submitRating} className="btn-primary" style={{ flex: 1 }} disabled={rating === 0}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="ss-nav sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => navigate("/edit-profile")} className="btn-outline" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", fontSize: 13 }}>
            <FaArrowLeft size={11} /> Back
          </button>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{toUserName}</p>
            <p style={{ color: "var(--text-muted)", fontSize: 12 }}>{toUserEmail}</p>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowRating(true)} style={{
              padding: "7px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 500,
              background: "#f59e0b15", color: "var(--amber)", border: "1px solid #f59e0b25",
              display: "flex", alignItems: "center", gap: 5
            }}>
              <FaStar size={11} /> Rate
            </button>
            <button onClick={scheduleMeeting} style={{
              padding: "7px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 500,
              background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid #7c6af725",
              display: "flex", alignItems: "center", gap: 5
            }}>
              <FaCalendarAlt size={11} /> Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 700, width: "100%", margin: "0 auto", padding: "16px" }}>
        <div style={{
          flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8,
          padding: "8px 0", minHeight: "60vh"
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "auto", marginBottom: "auto", paddingTop: 60 }}>
              <p style={{ fontSize: 32, marginBottom: 10 }}>💬</p>
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOwn = msg.sender === currentUser._id;
              return (
                <div key={index} style={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "70%", padding: "10px 14px",
                    borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: isOwn ? "var(--accent)" : "var(--bg-surface)",
                    border: isOwn ? "none" : "1px solid var(--border)",
                    fontSize: 14, lineHeight: 1.5
                  }}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          display: "flex", gap: 10, padding: "12px 0",
          borderTop: "1px solid var(--border)", marginTop: 8
        }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="ss-input"
            style={{ flex: 1, padding: "11px 14px", fontSize: 14 }}
          />
          <button
            onClick={handleSend}
            className="btn-primary"
            style={{ padding: "11px 18px", borderRadius: 10, display: "flex", alignItems: "center", gap: 6 }}
          >
            <FaPaperPlane size={13} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
