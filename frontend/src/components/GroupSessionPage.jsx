import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import {
  FaArrowLeft, FaUsers, FaPaperPlane, FaCopy, FaCheck,
  FaPen, FaEraser, FaFont, FaTrash, FaDownload, FaCrown,
} from "react-icons/fa";

// ── Socket singleton (shared with ChatPage) ───────────────
const SOCKET_URL = "https://swapskill-com.onrender.com";
let socket = null;
const getSocket = () => {
  if (!socket) socket = io(SOCKET_URL, { transports: ["websocket"] });
  return socket;
};

// ── Constants ─────────────────────────────────────────────
const COLORS      = ["#1c1813","#5c6bc0","#d94f3d","#2d9e6b","#3b7dd8","#9b59b6","#f5c842"];
const BRUSH_SIZES = [2, 5, 10, 20];
const STICKY_BG   = ["#fef08a","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff","#fed7aa"];

/* ═══════════════════════════════════════════════════════════
   SHARED WHITEBOARD (identical to 1-to-1 but roomId = group-CODE)
═══════════════════════════════════════════════════════════ */
const Whiteboard = ({ roomId, currentUserId }) => {
  const canvasRef  = useRef(null);
  const lastPt     = useRef(null);
  const drawing    = useRef(false);
  const historyRef = useRef([]);

  const [tool,      setTool]      = useState("pen");
  const [color,     setColor]     = useState("#1c1813");
  const [brushSize, setBrushSize] = useState(5);
  const [stickies,  setStickies]  = useState([]);
  const [dragId,    setDragId]    = useState(null);
  const [dragOff,   setDragOff]   = useState({ x:0, y:0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    resizeCanvas(canvas);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
    snapshot();
    const onResize = () => {
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resizeCanvas(canvas);
      ctx.putImageData(img, 0, 0);
      drawGrid(ctx, canvas.width, canvas.height);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const sock = getSocket();
    sock.emit("join-whiteboard", { roomId });
    sock.on("draw-stroke", ({ x0,y0,x1,y1,color:c,brushSize:bs,tool:t }) => renderStroke(x0,y0,x1,y1,c,bs,t));
    sock.on("clear-board", () => clearLocal());
    sock.on("sticky-add",    ({ sticky }) => setStickies(p => [...p, sticky]));
    sock.on("sticky-update", ({ id, text }) => setStickies(p => p.map(s => s.id===id ? {...s,text} : s)));
    sock.on("sticky-move",   ({ id, x, y })  => setStickies(p => p.map(s => s.id===id ? {...s,x,y} : s)));
    sock.on("sticky-remove", ({ id })         => setStickies(p => p.filter(s => s.id!==id)));
    return () => {
      sock.off("draw-stroke"); sock.off("clear-board");
      sock.off("sticky-add"); sock.off("sticky-update");
      sock.off("sticky-move"); sock.off("sticky-remove");
    };
  }, [roomId]);

  const resizeCanvas = (c) => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
  const drawGrid = (ctx, w, h) => {
    ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 0.8; const step = 28;
    for (let x=0;x<=w;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for (let y=0;y<=h;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    ctx.restore();
  };
  const snapshot = () => {
    const c=canvasRef.current, ctx=c.getContext("2d");
    historyRef.current.push(ctx.getImageData(0,0,c.width,c.height));
    if (historyRef.current.length > 50) historyRef.current.shift();
  };
  const renderStroke = (x0,y0,x1,y1,c,bs,t) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.save(); ctx.lineCap="round"; ctx.lineJoin="round";
    ctx.globalCompositeOperation = t==="eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = t==="eraser" ? "rgba(0,0,0,1)" : c; ctx.lineWidth = t==="eraser" ? bs*4 : bs;
    ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke(); ctx.restore();
  };
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };
  const onPointerDown = (e) => {
    if (tool === "sticky") { addSticky(getPos(e)); return; }
    snapshot(); drawing.current = true; lastPt.current = getPos(e);
  };
  const onPointerMove = (e) => {
    if (!drawing.current) return;
    const pos = getPos(e); const { x:x0, y:y0 } = lastPt.current; const { x:x1, y:y1 } = pos;
    renderStroke(x0,y0,x1,y1,color,brushSize,tool);
    getSocket().emit("draw-stroke", { roomId, x0,y0,x1,y1, color, brushSize, tool });
    drawGrid(canvasRef.current.getContext("2d"), canvasRef.current.width, canvasRef.current.height);
    lastPt.current = pos;
  };
  const onPointerUp = () => { drawing.current = false; lastPt.current = null; };
  const clearLocal = () => {
    const c=canvasRef.current, ctx=c.getContext("2d");
    ctx.clearRect(0,0,c.width,c.height); ctx.fillStyle="#0d1117";
    ctx.fillRect(0,0,c.width,c.height); drawGrid(ctx,c.width,c.height); setStickies([]);
  };
  const clearBoard = () => { clearLocal(); getSocket().emit("clear-board", { roomId }); };
  const downloadBoard = () => {
    const link = document.createElement("a");
    link.download = `swapskill-group-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL(); link.click();
  };
  const addSticky = (pos) => {
    const sticky = { id:`${currentUserId}-${Date.now()}`, x:pos.x-80, y:pos.y-60, text:"", bg:STICKY_BG[Math.floor(Math.random()*STICKY_BG.length)] };
    setStickies(p => [...p, sticky]); getSocket().emit("sticky-add", { roomId, sticky });
  };
  const updateSticky = (id, text) => { setStickies(p => p.map(s => s.id===id?{...s,text}:s)); getSocket().emit("sticky-update",{roomId,id,text}); };
  const removeSticky = (id) => { setStickies(p => p.filter(s => s.id!==id)); getSocket().emit("sticky-remove",{roomId,id}); };
  const startDrag = (e, id) => {
    e.stopPropagation(); const sticky=stickies.find(s=>s.id===id);
    const src=e.touches?e.touches[0]:e; setDragId(id); setDragOff({x:src.clientX-sticky.x,y:src.clientY-sticky.y});
  };
  const onDrag = useCallback((e) => {
    if (!dragId) return; const src=e.touches?e.touches[0]:e;
    const x=src.clientX-dragOff.x, y=src.clientY-dragOff.y;
    setStickies(p => p.map(s => s.id===dragId?{...s,x,y}:s));
    getSocket().emit("sticky-move",{roomId,id:dragId,x,y});
  }, [dragId, dragOff, roomId]);
  const stopDrag = () => setDragId(null);
  const cursorMap = { pen:"crosshair", eraser:"cell", sticky:"copy" };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      {/* Toolbar */}
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:"var(--bg-surface)", borderBottom:"1px solid var(--border)", flexWrap:"wrap", flexShrink:0 }}>
        <div style={{ display:"flex", gap:3, background:"var(--bg-deep)", borderRadius:10, padding:3 }}>
          {[{key:"pen",icon:<FaPen size={12}/>,label:"Pen"},{key:"eraser",icon:<FaEraser size={12}/>,label:"Eraser"},{key:"sticky",icon:<FaFont size={12}/>,label:"Sticky"}]
            .map(({key,icon,label}) => (
              <button key={key} onClick={() => setTool(key)} title={label} style={{
                display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
                background:tool===key?"var(--accent)":"transparent", color:tool===key?"#fff":"var(--text-secondary)", transition:"all 0.15s",
              }}>{icon} {label}</button>
            ))}
        </div>
        <div style={{width:1,height:26,background:"var(--border)"}}/>
        <div style={{display:"flex",gap:5,alignItems:"center"}}>
          {COLORS.map(c => (
            <button key={c} onClick={() => {setColor(c);setTool("pen");}} style={{
              width:20,height:20,borderRadius:"50%",background:c,border:"none",cursor:"pointer",
              outline:color===c?`3px solid ${c}66`:"none", transform:color===c?"scale(1.25)":"scale(1)", transition:"transform 0.1s",
            }}/>
          ))}
        </div>
        <div style={{width:1,height:26,background:"var(--border)"}}/>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {BRUSH_SIZES.map(s => (
            <button key={s} onClick={() => setBrushSize(s)} style={{
              width:28,height:28,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
              background:brushSize===s?"var(--accent-bg)":"var(--bg-surface)",
              border:brushSize===s?"1.5px solid var(--accent)":"1px solid var(--border)", transition:"all 0.1s",
            }}><div style={{width:Math.max(3,s/1.8),height:Math.max(3,s/1.8),borderRadius:"50%",background:color}}/></button>
          ))}
        </div>
        <div style={{flex:1}}/>
        <button onClick={downloadBoard} style={{padding:"6px 12px",borderRadius:8,border:"1px solid var(--border)",background:"transparent",cursor:"pointer",color:"var(--text-secondary)",display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:500}}>
          <FaDownload size={11}/> Save
        </button>
        <button onClick={clearBoard} style={{padding:"6px 12px",borderRadius:8,border:"1px solid #d94f3d22",background:"var(--red-dim)",cursor:"pointer",color:"var(--red)",display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:500}}>
          <FaTrash size={11}/> Clear
        </button>
      </div>

      {/* Canvas */}
      <div style={{flex:1,position:"relative",overflow:"hidden"}} onMouseMove={onDrag} onMouseUp={stopDrag} onTouchMove={onDrag} onTouchEnd={stopDrag}>
        <canvas ref={canvasRef} style={{width:"100%",height:"100%",display:"block",cursor:cursorMap[tool],touchAction:"none"}}
          onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
          onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}/>
        {stickies.map(sticky => (
          <div key={sticky.id} style={{position:"absolute",left:sticky.x,top:sticky.y,width:160,minHeight:120,background:sticky.bg,borderRadius:10,padding:"8px 10px",boxShadow:"0 4px 16px rgba(0,0,0,0.13)",cursor:dragId===sticky.id?"grabbing":"grab",zIndex:10}}
            onMouseDown={e=>{if(e.target.tagName!=="TEXTAREA"&&e.target.tagName!=="BUTTON")startDrag(e,sticky.id);}}
            onTouchStart={e=>{if(e.target.tagName!=="TEXTAREA"&&e.target.tagName!=="BUTTON")startDrag(e,sticky.id);}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <div style={{display:"flex",gap:3}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:"rgba(0,0,0,0.18)"}}/>
                <div style={{width:7,height:7,borderRadius:"50%",background:"rgba(0,0,0,0.18)"}}/>
              </div>
              <button onClick={() => removeSticky(sticky.id)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(0,0,0,0.35)",fontSize:12,padding:2,lineHeight:1}}>✕</button>
            </div>
            <textarea value={sticky.text} onChange={e => updateSticky(sticky.id,e.target.value)} placeholder="Type here..."
              style={{width:"100%",border:"none",background:"transparent",resize:"none",fontSize:12,color:"#1c1813",outline:"none",fontFamily:"inherit",minHeight:72,lineHeight:1.5,userSelect:"text"}}/>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   GROUP CHAT PANEL
═══════════════════════════════════════════════════════════ */
const GroupChatPanel = ({ code, members, currentUser, skill, hostName, isHost }) => {
  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState("");
  const bottomRef               = useRef(null);

  // Listen for incoming group chat messages
  useEffect(() => {
    const sock = getSocket();
    const handler = (msg) => setMessages(p => [...p, msg]);
    sock.on("group-chat-message", handler);
    return () => sock.off("group-chat-message", handler);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    getSocket().emit("group-chat-message", {
      code, userId: currentUser._id, userName: currentUser.name, text,
    });
    setText("");
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"var(--bg-card)" }}>
      {/* Participants header */}
      <div style={{ padding:"12px 14px", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
        <p style={{ fontWeight:700, fontSize:13, margin:"0 0 8px", display:"flex", alignItems:"center", gap:6 }}>
          <FaUsers size={13} style={{ color:"var(--accent)" }}/> Participants ({members.length})
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {members.map((m, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:5, background:"var(--bg-surface)", borderRadius:20, padding:"3px 10px", border:"1px solid var(--border)" }}>
              <div style={{ width:18, height:18, borderRadius:"50%", background:"var(--accent-bg)", border:"1.5px solid var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"var(--accent)" }}>
                {(m.name||"?")[0].toUpperCase()}
              </div>
              <span style={{ fontSize:11, fontWeight:600, color:"var(--text-primary)" }}>{m.name}</span>
              {m.id === currentUser._id && <span style={{ fontSize:9, color:"var(--text-muted)" }}>(you)</span>}
              {m.name === hostName && <FaCrown size={9} style={{ color:"var(--amber)" }}/>}
            </div>
          ))}
        </div>
      </div>

      {/* Skill info strip */}
      <div style={{ padding:"6px 14px", background:"var(--accent-dim)", borderBottom:"1px solid var(--accent-border)", flexShrink:0 }}>
        <span style={{ fontSize:11, color:"var(--accent)", fontWeight:600 }}>📚 Topic: {skill}</span>
        <span style={{ fontSize:11, color:"var(--text-muted)", marginLeft:8 }}>• taught by {hostName}</span>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:7 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign:"center", margin:"auto", opacity:0.5 }}>
            <p style={{ fontSize:28 }}>💬</p>
            <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:6 }}>Group chat — ask questions here</p>
          </div>
        ) : messages.map((msg, i) => {
          if (msg.system) return (
            <div key={i} style={{ textAlign:"center" }}>
              <span style={{ fontSize:10, color:"var(--text-muted)", background:"var(--bg-surface)", padding:"2px 10px", borderRadius:20 }}>{msg.text}</span>
            </div>
          );
          const isOwn = msg.userId === currentUser._id;
          return (
            <div key={i} style={{ display:"flex", flexDirection:"column", alignItems: isOwn ? "flex-end" : "flex-start" }}>
              {!isOwn && <span style={{ fontSize:10, fontWeight:600, color:"var(--text-muted)", marginBottom:2 }}>{msg.userName}</span>}
              <div style={{
                maxWidth:"85%", padding:"8px 12px", fontSize:12, lineHeight:1.5,
                borderRadius: isOwn?"14px 14px 3px 14px":"14px 14px 14px 3px",
                background: isOwn?"var(--accent)":"var(--bg-surface)",
                border: isOwn?"none":"1px solid var(--border)",
                color: isOwn?"#fff":"var(--text-primary)",
              }}>{msg.text}</div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ padding:"10px 12px", borderTop:"1px solid var(--border)", display:"flex", gap:8, flexShrink:0 }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key==="Enter" && send()}
          placeholder="Ask a question..." className="ss-input" style={{ flex:1, padding:"9px 12px", fontSize:13 }}/>
        <button onClick={send} className="btn-primary" style={{ padding:"9px 14px", borderRadius:9, display:"flex", alignItems:"center" }}>
          <FaPaperPlane size={12}/>
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN GroupSessionPage
═══════════════════════════════════════════════════════════ */
const GroupSessionPage = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const currentUser = useSelector(s => s.user.userData);
  const { code, skill, hostName, isHost } = location.state || {};

  const [members,  setMembers]  = useState([]);
  const [copied,   setCopied]   = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const roomId = code ? `group-${code}` : null;

  // Join the group room via socket
  useEffect(() => {
    if (!code || !currentUser || hasJoined) return;
    const sock = getSocket();

    sock.on("group-members-updated", ({ members }) => setMembers(members));
    sock.on("group-error", ({ message }) => { alert(message); navigate("/dashboard"); });

    sock.emit("join-group-room", { code, userId: currentUser._id, userName: currentUser.name });
    setHasJoined(true);

    return () => {
      sock.off("group-members-updated");
      sock.off("group-error");
    };
  }, [code, currentUser]);

  const handleLeave = () => {
    if (!code || !currentUser) { navigate("/dashboard"); return; }
    getSocket().emit("leave-group-room", { code, userId: currentUser._id, userName: currentUser.name });
    navigate("/dashboard");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  if (!code) {
    return (
      <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg-primary)" }}>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:32 }}>⚠️</p>
          <p style={{ color:"var(--text-muted)", marginTop:8 }}>No group session info found.</p>
          <button onClick={() => navigate("/dashboard")} className="btn-primary" style={{ marginTop:16 }}>← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"var(--bg-primary)", color:"var(--text-primary)", overflow:"hidden" }}>
      {/* ── Navbar ── */}
      <nav className="ss-nav" style={{ display:"flex", alignItems:"center", gap:12, padding:"0 18px", height:54, flexShrink:0, zIndex:100 }}>
        <button onClick={handleLeave} className="btn-outline" style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", fontSize:12, flexShrink:0 }}>
          <FaArrowLeft size={10}/> Leave
        </button>

        {/* Topic badge */}
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ fontWeight:800, fontSize:15, letterSpacing:"-0.03em", color:"var(--text-primary)" }}>
            📚 {skill}
          </span>
          <span style={{ fontSize:11, color:"var(--text-muted)" }}>· taught by <strong>{hostName}</strong></span>
        </div>

        {/* Live dot */}
        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px", background:"var(--green-dim)", borderRadius:20, border:"1px solid #2d9e6b28" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)", display:"inline-block", animation:"pulse 2s infinite" }}/>
          <span style={{ fontSize:11, color:"var(--green)", fontWeight:600 }}>Live</span>
        </div>

        {/* Participant count */}
        <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", background:"var(--accent-dim)", borderRadius:20, border:"1px solid var(--accent-border)" }}>
          <FaUsers size={11} style={{ color:"var(--accent)" }}/>
          <span style={{ fontSize:11, color:"var(--accent)", fontWeight:600 }}>{members.length} joined</span>
        </div>

        <div style={{ flex:1 }}/>

        {/* Room code + copy */}
        <div style={{ display:"flex", alignItems:"center", gap:6, background:"var(--bg-surface)", borderRadius:9, padding:"5px 12px", border:"1px solid var(--border)" }}>
          <span style={{ fontSize:11, color:"var(--text-muted)" }}>Code:</span>
          <span style={{ fontSize:13, fontWeight:800, letterSpacing:"0.08em", color:"var(--text-primary)", fontFamily:"monospace" }}>{code}</span>
          <button onClick={copyCode} title="Copy code" style={{ background:"none", border:"none", cursor:"pointer", color: copied ? "var(--green)" : "var(--text-muted)", display:"flex", alignItems:"center", padding:2 }}>
            {copied ? <FaCheck size={12}/> : <FaCopy size={12}/>}
          </button>
        </div>
      </nav>

      {/* ── Body ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Whiteboard — 65% */}
        <div style={{ flex:"0 0 65%", borderRight:"1px solid var(--border)", overflow:"hidden", display:"flex", flexDirection:"column" }}>
          {roomId && <Whiteboard roomId={roomId} currentUserId={currentUser?._id} />}
        </div>

        {/* Group chat panel — 35% */}
        <div style={{ flex:"0 0 35%", overflow:"hidden", display:"flex", flexDirection:"column" }}>
          <GroupChatPanel
            code={code} members={members} currentUser={currentUser}
            skill={skill} hostName={hostName} isHost={isHost}
          />
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
};

export default GroupSessionPage;
