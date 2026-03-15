import React, { useRef, useState } from "react";
import { FaExchangeAlt, FaLinkedin, FaArrowRight, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const featuresRef = useRef(null);
  const exploreRef  = useRef(null);
  const navigate    = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const scrollTo = r => r.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className="ss-nav" style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", padding: "0 28px", height: 60 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px var(--accent-glow)" }}>
            <FaExchangeAlt style={{ color: "#fff", fontSize: 14 }} />
          </div>
          <span className="grad-text" style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.04em" }}>SwapSkill</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Nav links + CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button onClick={() => scrollTo(featuresRef)} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "6px 12px", borderRadius: 8, fontFamily: "inherit", transition: "background 0.15s, color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-surface)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-secondary)"; }}>Features</button>
          <button onClick={() => scrollTo(exploreRef)} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "6px 12px", borderRadius: 8, fontFamily: "inherit", transition: "background 0.15s, color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-surface)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-secondary)"; }}>Explore</button>
          <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 6px" }} />
          <button onClick={() => navigate("/login")}  className="btn-outline" style={{ padding: "7px 16px", borderRadius: 9 }}>Log in</button>
          <button onClick={() => navigate("/signup")} className="btn-primary" style={{ padding: "7px 16px", borderRadius: 9 }}>Sign up free</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "90px 32px 72px", textAlign: "center" }}>
        {/* Pink blob bg */}
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 700, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(233,30,140,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 40, left: "10%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(156,39,176,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 20, right: "8%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(233,30,140,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 20, border: "1px solid var(--accent-border)", background: "var(--accent-dim)", marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>Peer-to-peer skill exchange · Free forever</span>
          </div>

          <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.2rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08, margin: "0 0 18px", color: "var(--text-primary)" }}>
            Trade skills.<br />
            <span className="grad-text">Grow together.</span>
          </h1>

          <p style={{ fontSize: 17, color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 36px", maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
            Connect with students, freelancers, and professionals. Teach what you know, learn what you don't.
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/signup")} className="btn-primary"
              style={{ padding: "12px 26px", fontSize: 15, borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 8 }}>
              Get started free <FaArrowRight size={13} />
            </button>
            <button onClick={() => scrollTo(exploreRef)} className="btn-outline"
              style={{ padding: "12px 26px", fontSize: 15, borderRadius: 10 }}>
              See how it works
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginTop: 56, border: "1px solid var(--border)", borderRadius: 14, background: "#fff", overflow: "hidden", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            {[["500+", "Users"], ["1.2k+", "Skills shared"], ["300+", "Connections"]].map(([n, l], i) => (
              <div key={l} style={{ flex: 1, textAlign: "center", padding: "18px 12px", borderRight: i < 2 ? "1px solid var(--border)" : "none" }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", margin: 0, letterSpacing: "-0.03em" }}>{n}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "3px 0 0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section ref={featuresRef} style={{ maxWidth: 960, margin: "0 auto", padding: "60px 32px" }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>Platform features</p>
          <h2 style={{ fontSize: "clamp(1.7rem, 3vw, 2.3rem)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Everything you need to exchange skills</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          {[
            { icon: "↔️", title: "Send & receive requests",  desc: "Request to learn or offer to teach. Full accept/decline flow." },
            { icon: "💬", title: "Private messaging",        desc: "Chat directly with skill partners once connected." },
            { icon: "🖊️",  title: "Real-time whiteboard",    desc: "Teach visually with a collaborative canvas and sticky notes." },
            { icon: "⭐", title: "Mentor ratings",           desc: "Rate sessions and build your reputation in the community." },
            { icon: "🔍", title: "Skill discovery",          desc: "Search by skill — find who teaches React, Python, DSA and more." },
            { icon: "🔒", title: "Secure auth",              desc: "JWT authentication, protected routes, persistent sessions." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="ss-card" style={{ padding: "22px 22px" }}>
              <span style={{ fontSize: 22, display: "block", marginBottom: 12 }}>{icon}</span>
              <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 6px", letterSpacing: "-0.01em" }}>{title}</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Explore ── */}
      <section ref={exploreRef} style={{ maxWidth: 960, margin: "0 auto", padding: "20px 32px 80px" }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>Explore</p>
          <h2 style={{ fontSize: "clamp(1.7rem, 3vw, 2.3rem)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>Find your skill partner</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Browse learners and mentors. Start exchanging today.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 12, marginBottom: 48 }}>
          {[
            { name: "Ravi Mehra",  role: "Student",   seed: "Ravi",  teaches: "Data Structures, Java", learns: "UI/UX, JavaScript" },
            { name: "Neha Sharma", role: "Freelancer", seed: "Neha",  teaches: "UI/UX, Figma",          learns: "DSA, Python"       },
            { name: "Arjun Nair",  role: "Developer",  seed: "Arjun", teaches: "React, Node.js",         learns: "ML, Python"        },
          ].map(({ name, role, seed, teaches, learns }) => (
            <div key={name} className="ss-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=e91e8c&fontColor=ffffff`}
                  alt={name} style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid var(--accent-border)" }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{role}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span className="ss-tag ss-tag-green">Teaches</span>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{teaches}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span className="ss-tag ss-tag-blue">Learns</span>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{learns}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                <button onClick={() => setShowPopup(true)} className="btn-primary" style={{ flex: 1, padding: "8px 0", fontSize: 12 }}>Learn</button>
                <button onClick={() => setShowPopup(true)} className="btn-green"   style={{ flex: 1, padding: "8px 0", fontSize: 12 }}>Teach</button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA block */}
        <div style={{ textAlign: "center", padding: "52px 32px", border: "1px solid var(--border)", borderRadius: 18, background: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 500, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(233,30,140,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 12px" }}>Ready to start?</p>
          <h3 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>Join SwapSkill today</h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 24px" }}>Free forever. No credit card required.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
            {["No fees ever", "Any skill", "Any level"].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                <FaCheck style={{ color: "var(--green)", fontSize: 11 }} /> {t}
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/signup")} className="btn-primary"
            style={{ padding: "13px 32px", fontSize: 15, borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 8 }}>
            Get started free <FaArrowRight size={13} />
          </button>
        </div>
      </section>

      {/* Popup */}
      {showPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,10,18,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="ss-card" style={{ padding: 32, width: 340, textAlign: "center", borderRadius: 18, background: "#fff" }}>
            <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 8px" }}>Create an account first</p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 24px", lineHeight: 1.6 }}>Sign up free to send requests and connect with skill partners.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowPopup(false)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => navigate("/signup")} className="btn-primary" style={{ flex: 1 }}>Sign up free</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "22px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <FaExchangeAlt style={{ color: "var(--accent)", fontSize: 14 }} />
          <span className="grad-text" style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em" }}>SwapSkill</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FaLinkedin style={{ color: "#0077b5", fontSize: 14 }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Built by <a href="https://www.linkedin.com/in/nekalsingh/" target="_blank" rel="noreferrer" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>Nekal Singh</a>
          </span>
        </div>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>© {new Date().getFullYear()} SwapSkill</span>
      </footer>
    </div>
  );
};

export default Home;
