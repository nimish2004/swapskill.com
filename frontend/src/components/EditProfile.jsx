import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, setUserData } from "../redux/userSlice";
import axios from "axios";
import profileImg from "../assets/profile.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaExchangeAlt, FaSignOutAlt, FaArrowLeft } from "react-icons/fa";

const EditProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userData);
  const token = useSelector((state) => state.user.token);

  const [name, setName] = useState("");
  const [canTeach, setCanTeach] = useState("");
  const [wantToLearn, setWantToLearn] = useState("");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setCanTeach(user.canTeach || "");
      setWantToLearn(user.wantToLearn || "");
    }
    const fetchRequests = async () => {
      try {
        const res = await axios.get("https://swapskill-com.onrender.com/api/user/myrequests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingRequests(res.data.requests || []);
        setAcceptedRequests(res.data.acceptedRequests || []);
      } catch (err) {
        toast.error("Failed to fetch requests");
      }
    };
    fetchRequests();
  }, [user, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        "https://swapskill-com.onrender.com/api/auth/update",
        { name, canTeach, wantToLearn },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setUserData(res.data.user));
      toast.success("Profile updated!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Profile update failed");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/";
  };

  const handleAccept = async (id) => {
    try {
      await axios.post("https://swapskill-com.onrender.com/api/user/accept", { requestId: id }, { headers: { Authorization: `Bearer ${token}` } });
      const accepted = pendingRequests.find((r) => r._id === id);
      setPendingRequests((prev) => prev.filter((r) => r._id !== id));
      setAcceptedRequests((prev) => [...prev, accepted]);
      toast.success("Request Accepted");
    } catch { toast.error("Failed to accept"); }
  };

  const handleDecline = async (id) => {
    try {
      await axios.post("https://swapskill-com.onrender.com/api/user/decline", { requestId: id }, { headers: { Authorization: `Bearer ${token}` } });
      setPendingRequests((prev) => prev.filter((r) => r._id !== id));
      toast.success("Request Declined");
    } catch { toast.error("Failed to decline"); }
  };

  const handleDeleteAcceptedRequest = async (id) => {
    try {
      await axios.post("https://swapskill-com.onrender.com/api/user/delete-accepted", { requestId: id }, { headers: { Authorization: `Bearer ${token}` } });
      setAcceptedRequests((prev) => prev.filter((r) => r._id !== id));
      toast.success("Connection removed");
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <ToastContainer />

      {/* Navbar */}
      <nav className="ss-nav sticky top-0 z-50 flex justify-between items-center px-6 py-3">
        <div className="flex items-center gap-2">
          <FaExchangeAlt style={{ color: "var(--accent)", fontSize: 18 }} />
          <span className="grad-text" style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}>SwapSkill</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/dashboard")} className="btn-outline" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 13 }}>
            <FaArrowLeft size={11} /> Dashboard
          </button>
          <button onClick={handleLogout} className="btn-danger" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 13 }}>
            <FaSignOutAlt size={11} /> Logout
          </button>
        </div>
      </nav>

      <div className="px-4 sm:px-6 py-10" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "2rem" }}>
          Edit Profile
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Edit form */}
          <div className="ss-card p-7" style={{ borderRadius: 18 }}>
            <div className="flex flex-col items-center mb-7">
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={profileImg}
                  alt="profile"
                  style={{ width: 80, height: 80, borderRadius: "50%", border: "2px solid var(--accent)", objectFit: "cover" }}
                />
                <span style={{
                  position: "absolute", bottom: 2, right: 2, width: 12, height: 12,
                  background: "var(--green)", borderRadius: "50%", border: "2px solid var(--bg-card)"
                }} />
              </div>
              <p style={{ fontWeight: 700, fontSize: 17, marginTop: 12 }}>{user?.name || "Your Name"}</p>
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{user?.email}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: 6 }}>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="ss-input" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: 6 }}>Skills I Can Teach</label>
                <textarea value={canTeach} onChange={(e) => setCanTeach(e.target.value)} placeholder="e.g. Java, Python, React..." className="ss-input" rows={3} style={{ resize: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: 6 }}>Skills I Want to Learn</label>
                <textarea value={wantToLearn} onChange={(e) => setWantToLearn(e.target.value)} placeholder="e.g. DSA, ML, Figma..." className="ss-input" rows={3} style={{ resize: "none" }} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: 14, borderRadius: 10 }}>
                Save Changes
              </button>
            </form>
          </div>

          {/* Right: Requests */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Pending */}
            <div className="ss-card p-6" style={{ borderRadius: 18, flex: 1 }}>
              <div className="flex items-center justify-between mb-5">
                <h2 style={{ fontWeight: 700, fontSize: 16 }}>Pending Requests</h2>
                {pendingRequests.length > 0 && (
                  <span className="ss-tag" style={{ background: "#f59e0b18", color: "var(--amber)", border: "1px solid #f59e0b25", fontSize: 11 }}>
                    {pendingRequests.length}
                  </span>
                )}
              </div>
              {pendingRequests.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No pending requests</p>
              ) : (
                <div style={{ maxHeight: 250, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                  {pendingRequests.map((req) => (
                    <div key={req._id} style={{
                      background: "var(--bg-surface)", borderRadius: 12, padding: "14px 16px",
                      border: "1px solid var(--border)"
                    }}>
                      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{req.from?.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>
                        {req.type === "learn"
                          ? <>Wants to learn <strong style={{ color: "var(--text-primary)" }}>{req.skill}</strong> from you</>
                          : <>Wants to teach you <strong style={{ color: "var(--text-primary)" }}>{req.skill}</strong></>}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => handleAccept(req._id)} className="btn-green" style={{ flex: 1, padding: "7px 0", fontSize: 12, textAlign: "center" }}>Accept</button>
                        <button onClick={() => handleDecline(req._id)} className="btn-danger" style={{ flex: 1, padding: "7px 0", fontSize: 12, textAlign: "center" }}>Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accepted */}
            <div className="ss-card p-6" style={{ borderRadius: 18, flex: 1 }}>
              <div className="flex items-center justify-between mb-5">
                <h2 style={{ fontWeight: 700, fontSize: 16 }}>Accepted Connections</h2>
                {acceptedRequests.length > 0 && (
                  <span className="ss-tag ss-tag-green" style={{ fontSize: 11 }}>{acceptedRequests.length}</span>
                )}
              </div>
              {acceptedRequests.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No accepted connections</p>
              ) : (
                <div style={{ maxHeight: 250, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                  {acceptedRequests.map((req) => (
                    <div key={req._id} style={{
                      background: "var(--bg-surface)", borderRadius: 12, padding: "14px 16px",
                      border: "1px solid #22c97a20"
                    }}>
                      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{req.from?.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
                        {req.type === "learn" ? "Will learn" : "Will teach"}{" "}
                        <strong style={{ color: "var(--green)" }}>{req.skill}</strong>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate("/chat", { state: { toUserId: req.from._id, toUserName: req.from.name, toUserEmail: req.from.email } })}
                          className="btn-primary" style={{ flex: 1, padding: "7px 0", fontSize: 12, textAlign: "center" }}>
                          Chat
                        </button>
                        <button onClick={() => handleDeleteAcceptedRequest(req._id)} className="btn-danger" style={{ flex: 1, padding: "7px 0", fontSize: 12, textAlign: "center" }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
