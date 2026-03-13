import React, { useRef, useState } from "react";
import { FaExchangeAlt, FaLinkedin, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const featuresRef = useRef(null);
  const exploreRef = useRef(null);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const scrollToFeatures = () => featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToExplore = () => exploreRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="w-full min-h-screen font-sans" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>

      {/* Navbar */}
      <nav className="ss-nav w-full sticky top-0 z-50 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2 font-bold text-lg">
          <FaExchangeAlt style={{ color: "var(--accent)" }} />
          <span className="grad-text tracking-tight">SwapSkill</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          <button onClick={scrollToFeatures} className="hover:text-white transition-colors">Features</button>
          <button onClick={scrollToExplore} className="hover:text-white transition-colors">Explore</button>
          <button onClick={() => navigate("/login")} className="btn-primary">Join Now</button>
        </div>
        <button onClick={() => navigate("/login")} className="sm:hidden btn-primary text-xs">Join Now</button>
      </nav>

      {/* Hero */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{
            position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
            width: 600, height: 400, borderRadius: "50%",
            background: "radial-gradient(ellipse, #7c6af722 0%, transparent 70%)",
            filter: "blur(40px)"
          }} />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="ss-tag ss-tag-purple mb-6" style={{ fontSize: 12, padding: "5px 14px" }}>
            Skills × Community × Exchange
          </div>

          <h1 style={{
            fontSize: "clamp(3rem, 8vw, 6rem)",
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            marginBottom: "1.5rem"
          }}>
            <span className="grad-text">Teach</span> what<br />
            you know.<br />
            <span style={{ color: "var(--text-secondary)" }}>Learn</span> what<br />
            you don't.
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: 17, lineHeight: 1.7, marginBottom: "2.5rem" }}>
            A peer-to-peer skill exchange platform where students, freelancers,<br className="hidden sm:block" />
            and professionals teach & learn from each other — for free.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/signup")} className="btn-primary" style={{ padding: "12px 28px", fontSize: 15, borderRadius: 10 }}>
              Get Started Free
            </button>
            <button onClick={scrollToExplore} className="btn-outline" style={{ padding: "12px 28px", fontSize: 15, borderRadius: 10 }}>
              See How It Works
            </button>
          </div>
        </div>

        {/* Stat strip */}
        <div className="relative z-10 mt-20 flex gap-12 flex-wrap justify-center">
          {[["500+", "Active Users"], ["1.2k+", "Skills Shared"], ["300+", "Connections Made"]].map(([num, label]) => (
            <div key={label} className="text-center">
              <p style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)" }}>{num}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Platform Features</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "3rem" }}>
            Everything you need<br />to exchange skills
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: "🎯", title: "Send & Receive Requests", desc: "Request to learn from someone or offer to teach what you know. Full request management with accept/decline." },
              { icon: "💬", title: "Private Messaging", desc: "Chat directly with your skill partners once a request is accepted. Focused, distraction-free conversations." },
              { icon: "⭐", title: "Mentor Ratings", desc: "Rate mentors after sessions. Build trust and reputation across the community." },
              { icon: "📅", title: "Schedule Meetings", desc: "Schedule Google Meet sessions directly from the chat. No friction, just learning." },
              { icon: "🔍", title: "Skill Discovery", desc: "Search users by skill. Find exactly who can teach you React, Python, DSA, or anything else." },
              { icon: "🔒", title: "Secure Auth", desc: "JWT-based authentication with protected routes. Your account and data stay safe." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="ss-card p-6" style={{ borderRadius: 14 }}>
                <span style={{ fontSize: 24 }}>{icon}</span>
                <h3 style={{ fontWeight: 700, fontSize: 16, margin: "12px 0 6px" }}>{title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore / Demo Cards */}
      <section ref={exploreRef} className="px-6 py-24" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Explore</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
            Find your skill partner
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "3rem", fontSize: 15 }}>
            Browse learners and mentors. Start exchanging skills today.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              { name: "Ravi Mehra", role: "Student", seed: "Ravi", knows: "Data Structures, Java", learns: "UI/UX, JavaScript", color: "var(--accent)" },
              { name: "Neha Sharma", role: "Freelancer", seed: "Neha", knows: "UI/UX Design, Figma", learns: "DSA, Python", color: "var(--pink)" },
            ].map(({ name, role, seed, knows, learns, color }) => (
              <div key={name} className="ss-card p-6">
                <div className="flex items-center gap-4 mb-5">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=7c6af7`}
                    alt={name}
                    style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${color}40` }}
                  />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 16 }}>{name}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: 12 }}>{role}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="ss-tag ss-tag-green">Teaches</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{knows}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="ss-tag ss-tag-purple">Learns</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{learns}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowPopup(true)} className="btn-primary" style={{ flex: 1, fontSize: 12, padding: "8px 0" }}>
                    Request to Learn
                  </button>
                  <button onClick={() => setShowPopup(true)} className="btn-green" style={{ flex: 1, fontSize: 12, padding: "8px 0" }}>
                    Offer to Teach
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate("/signup")}
              className="btn-primary"
              style={{ padding: "14px 36px", fontSize: 16, borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              Join Now and Start Swapping <FaArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="ss-card p-8 w-[90%] max-w-sm text-center" style={{ borderRadius: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Join to continue</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Create a free account to send requests and connect with skill partners.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowPopup(false)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => navigate("/signup")} className="btn-primary" style={{ flex: 1 }}>Sign Up Free</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-card)" }} className="px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <FaLinkedin style={{ color: "#60a5fa" }} />
            <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
              Built by{" "}
              <a href="https://www.linkedin.com/in/nekalsingh/" target="_blank" rel="noreferrer"
                style={{ color: "#60a5fa" }}>Nekal Singh</a>
            </span>
          </div>
          <div className="text-right">
            <a href="mailto:nekalsingh987@gmail.com" style={{ color: "var(--text-muted)", fontSize: 13 }}>
              nekalsingh987@gmail.com
            </a>
            <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4 }}>
              © {new Date().getFullYear()} SwapSkill
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
