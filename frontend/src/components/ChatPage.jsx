import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSelector((state) => state.user.token);
  const currentUser = useSelector((state) => state.user.userData);

  const { toUserId, toUserName, toUserEmail } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // ⭐ Rating
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  // 🔹 Fetch chat messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `https://swapskill-com.onrender.com/api/user/get-messages/${toUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    if (toUserId) fetchMessages();
  }, [toUserId, token]);

  // 🔹 Send message
  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      await axios.post(
        "https://swapskill-com.onrender.com/api/user/send-message",
        {
          toUserId,
          text,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: currentUser._id,
          receiver: toUserId,
          content: text,
        },
      ]);

      setText("");
    } catch (err) {
      console.error("Send error", err);
      alert("Failed to send message");
    }
  };

  // ⭐ Submit Rating
  const submitRating = async () => {
    try {
      await axios.post(
        "https://swapskill-com.onrender.com/api/user/rate-user",
        {
          mentorId: toUserId,
          rating,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Rating submitted successfully!");
      setShowRating(false);
    } catch (error) {
      console.error(error);
      alert("Failed to submit rating");
    }
  };

  // 📅 Schedule Google Meet
  const scheduleMeeting = () => {
    const title = encodeURIComponent(`Meeting with ${toUserName}`);

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&add=${toUserEmail}&details=Meeting%20scheduled%20via%20SwapSkill&conferenceData.createRequest=true`;

    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-100 to-yellow-100 p-6">

      {/* ⭐ Rating Popup */}
      {showRating && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">

            <h3 className="text-lg font-bold mb-3">
              Rate {toUserName}
            </h3>

            <div className="flex justify-center space-x-2 mb-4">
              {[1,2,3,4,5].map((star)=>(
                <span
                  key={star}
                  className={`text-3xl cursor-pointer ${(hover || rating) >= star ? "text-yellow-400":"text-gray-300"}`}
                  onMouseEnter={()=>setHover(star)}
                  onMouseLeave={()=>setHover(0)}
                  onClick={()=>setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={()=>setShowRating(false)}
                className="px-4 py-2 rounded-md bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={submitRating}
                className="px-4 py-2 rounded-md bg-blue-600 text-white"
              >
                Submit
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-4 flex justify-between items-center">

        <button
          onClick={()=>navigate("/edit-profile")}
          className="bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
        >
          ← Back to Profile
        </button>

        <div className="text-right">

          <h2 className="text-lg font-bold text-gray-800">
            {toUserName}
          </h2>

          <p className="text-sm text-gray-500">
            {toUserEmail}
          </p>

          <div className="flex gap-2 justify-end mt-2">

            <button
              onClick={()=>setShowRating(true)}
              className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm"
            >
              ⭐ Rate Mentor
            </button>

            <button
              onClick={scheduleMeeting}
              className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm"
            >
              📅 Schedule Meeting
            </button>

          </div>

        </div>
      </div>

      {/* Chat Box */}
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-4 min-h-[300px] flex flex-col justify-between">

        <div className="overflow-y-auto max-h-[300px] mb-4">

          {messages.length === 0 ? (
            <p className="text-gray-400">No messages yet</p>
          ) : (
            <ul className="space-y-2">

              {messages.map((msg,index)=>(
                <li
                  key={index}
                  className={msg.sender === currentUser._id ? "text-right":"text-left"}
                >
                  <span
                    className={`inline-block px-3 py-2 rounded-lg ${
                      msg.sender === currentUser._id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </span>
                </li>
              ))}

            </ul>
          )}

        </div>

        {/* Input */}
        <div className="flex flex-col sm:flex-row gap-2">

          <input
            value={text}
            onChange={(e)=>setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-md"
          />

          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
};

export default ChatPage;