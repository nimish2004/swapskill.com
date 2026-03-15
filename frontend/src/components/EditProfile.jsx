import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, setUserData } from "../redux/userSlice";
import axios from "axios";
import profileImg from "../assets/profile.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaExchangeAlt, FaSignOutAlt, FaArrowLeft,
  FaGraduationCap, FaChalkboardTeacher, FaStar,
  FaUserFriends, FaEdit, FaCheck, FaLinkedin,
  FaGithub, FaGlobe, FaLightbulb,
} from "react-icons/fa";

const API = "https://swapskill-com.onrender.com";

/* parse comma/newline separated skills into array */
const parseSkills = (str) =>
  (str || "").split(/[,\n]+/).map(s => s.trim()).filter(Boolean);

/* single stat card */
const StatCard = ({ icon, value, label, color }) => (
  <div style={{
    background: "var(--bg-card)", border: "1px solid var(--border)",
    borderRadius: 14, padding: "18px 20px",
    display: "flex", alignItems: "center", gap: 14,
  }}>
    <div style={{
      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
      background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ color, fontSize: 18 }}>{icon}</span>
    </div>
    <div>
      <p style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>{value}</p>
      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
    </div>
  </div>
);

/* skill pill */
const Pill = ({ text, variant }) => {
  const styles = {
    teach: { bg: "var(--green-dim)", color: "var(--green)", border: "1px solid #2d9e6b28" },
    learn: { bg: "var(--blue-dim)",  color: "var(--blue)",  border: "1px solid #3b7dd828" },
  };
  const s = styles[variant];
  return (
    <span style={{
      display: "inline-block", padding: "4px 12px", borderRadius: 20,
      fontSize: 12, fontWeight: 600, background: s.bg, color: s.color, border: s.border,
    }}>{text}</span>
  );
};

const EditProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user     = useSelector(s => s.user.userData);
  const token    = useSelector(s => s.user.token);

  const [name,        setName]        = useState("");
  const [canTeach,    setCanTeach]    = useState("");
  const [wantToLearn, setWantToLearn] = useState("");
  const [about,       setAbout]       = useState("");
  const [linkedin,    setLinkedin]    = useState("");
  const [github,      setGithub]      = useState("");
  const [website,     setWebsite]     = useState("");
  const [editing,     setEditing]     = useState(false);
  const [stats,       setStats]       = useState({ connections: 0, avgRating: 0, totalRatings: 0 });

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setCanTeach(user.canTeach || "");
    setWantToLearn(user.wantToLearn || "");
    setAbout(user.about || "");
    setLinkedin(user.linkedin || "");
    setGithub(user.github || "");
    setWebsite(user.website || "");

    // fetch stats from accepted requests count + ratings
    axios.get(`${API}/api/user/myrequests`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const connections = (res.data.acceptedRequests || []).length;
      setStats(prev => ({ ...prev, connections }));
    }).catch(() => {});

    // get own rating summary from all users list
    axios.get(`${API}/api/user/all`).then(res => {
      const me = res.data.find(u => u._id === user._id);
      if (!me) return;
      const ratings = Array.isArray(me.ratings) ? me.ratings : [];
      if (ratings.length > 0) {
        const avg = ratings.reduce((a, r) => a + (r.stars || 0), 0) / ratings.length;
        setStats(prev => ({ ...prev, avgRating: Number(avg.toFixed(1)), totalRatings: ratings.length }));
      }
    }).catch(() => {});
  }, [user, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${API}/api/auth/update`,
        { name, canTeach, wantToLearn },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setUserData(res.data.user));
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Update failed");
    }
  };

  const teachSkills = parseSkills(canTeach);
  const learnSkills = parseSkills(wantToLearn);

  const memberSince = user?._id
    ? new Date(parseInt(user._id.substring(0, 8), 16) * 1000).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <ToastContainer />

      {/* ── Navbar ── */}
      <nav className="ss-nav" style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 24px", height: 56, position: "sticky", top: 0, zIndex: 50 }}>
        <FaExchangeAlt style={{ color: "var(--accent)", fontSize: 16 }} />
        <span className="grad-text" style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.03em" }}>SwapSkill</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => navigate("/dashboard")} className="btn-outline"
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", fontSize: 12 }}>
          <FaArrowLeft size={10} /> Dashboard
        </button>
        <button onClick={() => { dispatch(logout()); window.location.href = "/"; }} className="btn-danger"
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", fontSize: 12 }}>
          <FaSignOutAlt size={10} /> Logout
        </button>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── HERO BANNER ── */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)", borderRadius: 20,
          padding: "32px 32px 28px", marginBottom: 24, position: "relative", overflow: "hidden"
        }}>
          {/* decorative circles */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(244,63,142,0.04)" }} />
          <div style={{ position: "absolute", bottom: -20, right: 80, width: 100, height: 100, borderRadius: "50%", background: "rgba(244,63,142,0.03)" }} />

          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>

            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img src={profileImg} alt="profile" style={{
                width: 88, height: 88, borderRadius: "50%",
                border: "3px solid var(--accent)", objectFit: "cover",
                boxShadow: "0 4px 20px var(--accent-glow)"
              }} />
              <span style={{
                position: "absolute", bottom: 4, right: 4,
                width: 14, height: 14, borderRadius: "50%",
                background: "var(--green)", border: "2.5px solid #fffef9"
              }} />
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
                  {user?.name || "Your Name"}
                </h1>
                <span style={{
                  background: "var(--green-dim)", color: "var(--green)",
                  border: "1px solid #2d9e6b28", borderRadius: 20,
                  fontSize: 11, fontWeight: 600, padding: "3px 10px",
                }}>● Active</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "4px 0 12px" }}>{user?.email}</p>

              {/* Quick skill preview */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {teachSkills.slice(0, 3).map(s => <Pill key={s} text={s} variant="teach" />)}
                {learnSkills.slice(0, 2).map(s => <Pill key={s} text={s} variant="learn" />)}
                {(teachSkills.length + learnSkills.length) > 5 && (
                  <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>
                    +{teachSkills.length + learnSkills.length - 5} more
                  </span>
                )}
              </div>
            </div>

            {/* Edit toggle */}
            <button
              onClick={() => setEditing(e => !e)}
              className={editing ? "btn-outline" : "btn-primary"}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", fontSize: 13, flexShrink: 0 }}>
              {editing ? <><FaCheck size={11} /> Cancel</> : <><FaEdit size={11} /> Edit Profile</>}
            </button>
          </div>

          {/* About blurb */}
          {about && !editing && (
            <p style={{ marginTop: 16, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 560 }}>
              {about}
            </p>
          )}
        </div>

        {/* ── STATS ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
          <StatCard icon={<FaUserFriends />}       value={stats.connections} label="Connections"    color="var(--accent)" />
          <StatCard icon={<FaChalkboardTeacher />}  value={teachSkills.length} label="Teaching"    color="var(--green)"  />
          <StatCard icon={<FaGraduationCap />}      value={learnSkills.length} label="Learning"    color="var(--blue)"   />
          <StatCard icon={<FaStar />}               value={stats.avgRating || "—"} label={`Rating · ${stats.totalRatings} reviews`} color="var(--amber)" />
        </div>

        {/* ── TWO COLUMN ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* LEFT col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Edit form OR skill display */}
            {editing ? (
              <div className="ss-card" style={{ padding: "24px", borderRadius: 18 }}>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>✏️ Edit Details</p>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: 6 }}>Display Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="ss-input" placeholder="Your Name" />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: 6 }}>Skills I Can Teach</label>
                    <textarea value={canTeach} onChange={e => setCanTeach(e.target.value)} className="ss-input" rows={3} placeholder="e.g. React, Java, Python (comma separated)" style={{ resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: 6 }}>Skills I Want to Learn</label>
                    <textarea value={wantToLearn} onChange={e => setWantToLearn(e.target.value)} className="ss-input" rows={3} placeholder="e.g. DSA, ML, Figma (comma separated)" style={{ resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: 6 }}>About Me</label>
                    <textarea value={about} onChange={e => setAbout(e.target.value)} className="ss-input" rows={3} placeholder="A short bio — what you do, what you're building..." style={{ resize: "none" }} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: "11px", fontSize: 14, borderRadius: 10 }}>
                    Save Changes
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* Teaches card */}
                <div className="ss-card" style={{ padding: "20px 22px", borderRadius: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <FaChalkboardTeacher style={{ color: "var(--green)", fontSize: 15 }} />
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>I Can Teach</p>
                  </div>
                  {teachSkills.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No teaching skills added yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {teachSkills.map(s => <Pill key={s} text={s} variant="teach" />)}
                    </div>
                  )}
                </div>

                {/* Wants to learn card */}
                <div className="ss-card" style={{ padding: "20px 22px", borderRadius: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <FaGraduationCap style={{ color: "var(--blue)", fontSize: 15 }} />
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>I Want to Learn</p>
                  </div>
                  {learnSkills.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No learning goals added yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {learnSkills.map(s => <Pill key={s} text={s} variant="learn" />)}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* RIGHT col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Account info */}
            <div className="ss-card" style={{ padding: "20px 22px", borderRadius: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Account Info</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Email",        value: user?.email,   },
                  { label: "Member since", value: memberSince,   },
                  { label: "User ID",      value: user?._id?.slice(-8).toUpperCase(), mono: true },
                ].map(({ label, value, mono }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
                    <span style={{
                      fontSize: 12, color: "var(--text-primary)", fontWeight: 600,
                      fontFamily: mono ? "var(--font-mono, monospace)" : "inherit",
                      background: mono ? "var(--bg-surface)" : "transparent",
                      padding: mono ? "2px 8px" : 0, borderRadius: mono ? 6 : 0,
                    }}>{value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div className="ss-card" style={{ padding: "20px 22px", borderRadius: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Social Links</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Coming soon — link your profiles</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: <FaLinkedin style={{ color: "#0077b5" }} />, label: "LinkedIn",  placeholder: "linkedin.com/in/yourname", value: linkedin, set: setLinkedin },
                  { icon: <FaGithub   style={{ color: "var(--text-primary)" }} />, label: "GitHub",    placeholder: "github.com/yourname",    value: github,   set: setGithub   },
                  { icon: <FaGlobe    style={{ color: "var(--accent)" }} />, label: "Website",   placeholder: "yourwebsite.com",        value: website,  set: setWebsite  },
                ].map(({ icon, label, placeholder, value, set }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "var(--bg-surface)", borderRadius: 10, border: "1px solid var(--border)", opacity: 0.7 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{placeholder}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip card */}
            <div style={{
              background: "var(--accent-bg)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "18px 20px",
              display: "flex", gap: 12, alignItems: "flex-start"
            }}>
              <FaLightbulb style={{ color: "var(--accent)", fontSize: 18, flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 5px", color: "var(--text-primary)" }}>Pro tip</p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                  The more specific your skills are, the more likely someone will find and connect with you. Try "React + Firebase" instead of just "Web Dev".
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
