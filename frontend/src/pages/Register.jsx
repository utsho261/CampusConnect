import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Eye, EyeOff, Lock, IdCard, User, Building, BookOpen,
  ArrowRight, ArrowLeft, CheckCircle, GraduationCap,
  Shield, Mail, Sparkles, Zap, Star, Trophy, Users, BookMarked, Rocket
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useTheme, useLanguage } from "../hooks";
import ThemeLanguageSwitcher from "../components/ThemeLanguageSwitcher";
import { getThemeColors } from "../utils/themeColors";

/* ══════════════════════════════════════
   CONFETTI
══════════════════════════════════════ */
function ConfettiPiece({ color, x, delay, shape }) {
  return (
    <motion.div
      style={{
        position: "fixed", top: -20, left: `${x}%`,
        width: shape === "circle" ? 10 : 8,
        height: shape === "circle" ? 10 : 14,
        borderRadius: shape === "circle" ? "50%" : "2px",
        backgroundColor: color, zIndex: 9999, pointerEvents: "none",
      }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{ y: window.innerHeight + 60, opacity: [1, 1, 0.5, 0], rotate: Math.random() * 720 - 360, x: (Math.random() - 0.5) * 300 }}
      transition={{ duration: 2.8 + Math.random() * 1.5, delay, ease: "easeIn" }}
    />
  );
}
function Confetti() {
  const colors = ["#7C3AED","#4F46E5","#06b6d4","#10b981","#f59e0b","#ec4899","#a855f7","#f97316","#3b82f6","#14b8a6"];
  const pieces = Array.from({ length: 100 }, (_, i) => ({
    id: i, color: colors[i % colors.length],
    x: Math.random() * 100, delay: Math.random() * 1.5,
    shape: Math.random() > 0.5 ? "circle" : "rect",
  }));
  return <>{pieces.map(p => <ConfettiPiece key={p.id} {...p} />)}</>;
}

/* ══════════════════════════════════════
   SIMPLE BUTTON (shadow on click only)
══════════════════════════════════════ */
function ShineBtn({ children, style, onClick, disabled, loading }) {
  const handleMouseDown = e => {
    // Prevent input blur → setState → re-render from swallowing the click
    e.preventDefault();
    if (!disabled && !loading) {
      e.currentTarget.style.opacity = "0.88";
    }
  };
  const handleMouseUp = e => {
    e.currentTarget.style.opacity = "1";
  };
  const handleMouseLeave = e => {
    e.currentTarget.style.opacity = "1";
  };
  const handleClick = e => {
    if (!disabled && !loading && onClick) onClick(e);
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled||loading}
      style={{
        ...style,
        cursor: disabled||loading ? "not-allowed" : "pointer",
        transition: "opacity 0.1s ease",
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
}

/* ══════════════════════════════════════
   ANIMATED INPUT
══════════════════════════════════════ */
function Field({ icon: Icon, label, type="text", placeholder, value, onChange, onFocus, onBlur, isFocused, isDark, suffix, maxLength, id }) {
  const ac = isDark ? "#f59e0b" : "#7C3AED";
  const acRgb = isDark ? "245,158,11" : "124,58,237";
  return (
    <div>
      {label && <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.6px", textTransform:"uppercase", color: isFocused ? ac : (isDark?"#475569":"#94a3b8"), marginBottom:7, transition:"color 0.25s" }}>{label}</label>}
      <div style={{ position:"relative" }}>
        {Icon && (
          <motion.div style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color: isFocused ? ac : (isDark?"#475569":"#94a3b8"), pointerEvents:"none", display:"flex", transition:"color 0.25s" }}
            animate={{ scale: isFocused ? 1.2 : 1 }} transition={{ type:"spring", stiffness:400, damping:20 }}>
            <Icon size={17} />
          </motion.div>
        )}
        <motion.input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange}
          onFocus={onFocus} onBlur={onBlur} maxLength={maxLength}
          animate={{ boxShadow: isFocused ? `0 0 0 3px rgba(${acRgb},0.18)` : "0 0 0 0px rgba(0,0,0,0)" }}
          style={{
            width:"100%", paddingLeft: Icon?"44px":"16px", paddingRight: suffix?"48px":"16px",
            paddingTop:13, paddingBottom:13,
            background: isFocused ? (isDark?"rgba(30,41,59,0.98)":"rgba(250,247,255,0.98)") : (isDark?"rgba(15,23,42,0.5)":"rgba(249,246,255,0.6)"),
            borderRadius:12, fontSize:14, fontFamily:"Inter,sans-serif",
            border:`2px solid ${isFocused ? ac : (isDark?"rgba(245,158,11,0.12)":"rgba(124,58,237,0.18)")}`,
            color: isDark?"#f1f5f9":"#0f172a", outline:"none", boxSizing:"border-box",
            transition:"all 0.28s cubic-bezier(0.4,0,0.2,1)",
          }} transition={{ duration:0.25 }} />
        {suffix && <div style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)" }}>{suffix}</div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   ANIMATED SELECT
══════════════════════════════════════ */
function SelectField({ icon: Icon, label, value, onChange, onFocus, onBlur, isFocused, isDark, children }) {
  const ac = isDark ? "#f59e0b" : "#7C3AED";
  const acRgb = isDark ? "245,158,11" : "124,58,237";
  return (
    <div>
      {label && <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.6px", textTransform:"uppercase", color: isFocused ? ac : (isDark?"#475569":"#94a3b8"), marginBottom:7, transition:"color 0.25s" }}>{label}</label>}
      <div style={{ position:"relative" }}>
        <motion.div style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color: isFocused ? ac : (isDark?"#475569":"#94a3b8"), pointerEvents:"none", display:"flex" }}
          animate={{ scale: isFocused ? 1.2 : 1 }} transition={{ type:"spring", stiffness:400, damping:20 }}>
          <Icon size={17} />
        </motion.div>
        <motion.select value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur}
          animate={{ boxShadow: isFocused ? `0 0 0 3px rgba(${acRgb},0.18)` : "0 0 0 0px rgba(0,0,0,0)" }}
          style={{
            width:"100%", paddingLeft:"44px", paddingRight:"16px", paddingTop:13, paddingBottom:13,
            background: isFocused ? (isDark?"rgba(30,41,59,0.98)":"rgba(250,247,255,0.98)") : (isDark?"rgba(15,23,42,0.5)":"rgba(249,246,255,0.6)"),
            borderRadius:12, fontSize:14, fontFamily:"Inter,sans-serif",
            border:`2px solid ${isFocused ? ac : (isDark?"rgba(245,158,11,0.12)":"rgba(124,58,237,0.18)")}`,
            color: isDark?"#f1f5f9":"#0f172a", outline:"none", boxSizing:"border-box", appearance:"none", cursor:"pointer",
            transition:"all 0.28s cubic-bezier(0.4,0,0.2,1)",
          }} transition={{ duration:0.25 }}>
          {children}
        </motion.select>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   LEFT HERO PANEL
══════════════════════════════════════ */
const QUOTES = [
  { text: "Education is the most powerful weapon you can use to change the world.", author: "Nelson Mandela" },
  { text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
];

const STATS = [
  { icon: Users, value: "12,000+", label: "Students Connected" },
  { icon: BookMarked, value: "8", label: "Departments" },
  { icon: Trophy, value: "50+", label: "Active Clubs" },
  { icon: Rocket, value: "20+", label: "Platform Features" },
];

function LeftPanel({ isDark, currentSection }) {
  const [quoteIdx, setQuoteIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % QUOTES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const stepMessages = [
    { title: "Start Your\nAcademic Journey", sub: "Join a thriving campus community built for students like you." },
    { title: "Shape Your\nAcademic Profile", sub: "Tell us about your department and intake so we can personalise your experience." },
    { title: "Verify &\nSecure Your Spot", sub: "We keep your account safe with email verification." },
    { title: "One Last Step\nToward Greatness", sub: "Set a strong password and you're in. The campus awaits." },
  ];
  const msg = stepMessages[Math.min(currentSection - 1, 3)];

  return (
    <div style={{
      flex: "0 0 42%", minHeight: "100vh", position: "relative", overflow: "hidden",
      background: isDark
        ? "linear-gradient(145deg, #020d18 0%, #041e2f 30%, #052d45 60%, #020d18 100%)"
        : "linear-gradient(145deg, #011c2d 0%, #013a56 28%, #015073 55%, #023e58 80%, #011c2d 100%)",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "48px 44px",
    }}>
      {/* Background glow orbs - teal themed */}
      {[
        { top:"-15%", left:"-20%", size:420, opacity: isDark?0.2:0.28, color: isDark?"#0891b2":"#22d3ee", delay:0, dur:9 },
        { top:"45%", right:"-18%", size:360, opacity: isDark?0.14:0.22, color: isDark?"#0e7490":"#06b6d4", delay:1.5, dur:11 },
        { bottom:"-12%", left:"8%", size:300, opacity: isDark?0.12:0.18, color: isDark?"#164e63":"#0284c7", delay:0.8, dur:8 },
        { top:"25%", left:"60%", size:180, opacity: isDark?0.08:0.14, color: isDark?"#0284c7":"#38bdf8", delay:2, dur:7 },
      ].map((o, i) => (
        <motion.div key={i} style={{
          position:"absolute", borderRadius:"50%", pointerEvents:"none",
          top: o.top, left: o.left, right: o.right, bottom: o.bottom,
          width: o.size, height: o.size,
          background: `radial-gradient(circle, ${o.color}${Math.round(o.opacity*255).toString(16).padStart(2,"0")} 0%, transparent 70%)`,
        }}
          animate={{ scale:[1,1.15,1], x:[0,20,0], y:[0,-25,0] }}
          transition={{ duration:o.dur, delay:o.delay, repeat:Infinity, ease:"easeInOut" }}
        />
      ))}

      {/* Logo */}
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <motion.div
            whileHover={{ rotate:[-5,5,-5,0], scale:1.1 }} transition={{ duration:0.5 }}
            style={{
              width:44, height:44, borderRadius:14,
              background: isDark ? "linear-gradient(135deg,#7C3AED,#4F46E5)" : "rgba(255,255,255,0.2)",
              border: isDark ? "none" : "1.5px solid rgba(255,255,255,0.3)",
              backdropFilter:"blur(10px)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow: isDark ? "0 4px 16px rgba(124,58,237,0.5)" : "0 4px 16px rgba(0,0,0,0.15)",
            }}>
            <GraduationCap size={24} color="white" />
          </motion.div>
          <span style={{ fontSize:20, fontWeight:900, color:"#fff", letterSpacing:"-0.5px" }}>
            Campus<span style={{ opacity:0.7 }}>Connect</span>
          </span>
        </div>
      </motion.div>

      {/* Main headline */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"40px 0" }}>
        <AnimatePresence mode="wait">
          <motion.div key={currentSection}
            initial={{ opacity:0, x:-30, filter:"blur(6px)" }}
            animate={{ opacity:1, x:0, filter:"blur(0px)" }}
            exit={{ opacity:0, x:30, filter:"blur(6px)" }}
            transition={{ duration:0.5, ease:[0.34,1.3,0.64,1] }}
          >
            {/* Step badge */}
            <motion.div style={{
              display:"inline-flex", alignItems:"center", gap:6, marginBottom:20,
              background:"rgba(255,255,255,0.12)", backdropFilter:"blur(8px)",
              border:"1px solid rgba(255,255,255,0.2)",
              borderRadius:99, padding:"5px 14px",
            }}>
              <motion.div animate={{ rotate:[0,360] }} transition={{ duration:3, repeat:Infinity, ease:"linear" }}>
                <Sparkles size={13} color="#fff" />
              </motion.div>
              <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.9)", letterSpacing:"0.5px" }}>
                STEP {currentSection < 5 ? currentSection : "✓"} OF 4
              </span>
            </motion.div>

            {/* Big title */}
            <h1 style={{
              fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight:900, color:"#fff",
              lineHeight:1.15, letterSpacing:"-1.5px", margin:"0 0 16px",
              whiteSpace:"pre-line",
            }}>
              {currentSection < 5 ? msg.title : "Welcome\nAboard! 🎉"}
            </h1>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.65)", lineHeight:1.65, margin:0, fontWeight:500 }}>
              {currentSection < 5 ? msg.sub : "Your account is live. You're now part of the CampusConnect family."}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Rotating quote — pure white card, stands out on teal */}
        <motion.div
          style={{
            marginTop:32, position:"relative",
            background:"#ffffff",
            borderRadius:20,
            padding:"26px 22px 22px 28px",
            boxShadow:"0 16px 48px rgba(0,0,0,0.28), 0 2px 0 rgba(255,255,255,0.9) inset",
            overflow:"hidden",
          }}
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          whileHover={{ y:-2, boxShadow:"0 22px 56px rgba(0,0,0,0.35)" }}
          transition={{ type:"spring", stiffness:300, damping:25 }}
        >
          {/* Amber left accent bar */}
          <div style={{
            position:"absolute", top:0, left:0, width:4, height:"100%",
            borderRadius:"20px 0 0 20px",
            background:"linear-gradient(180deg, #fde68a 0%, #f59e0b 50%, #d97706 100%)",
            boxShadow:"2px 0 12px rgba(245,158,11,0.3)",
          }} />
          {/* Watermark ❝ — faint on white */}
          <div style={{
            position:"absolute", top:-8, right:12,
            fontSize:110, lineHeight:1, fontFamily:"Georgia, serif",
            color:"rgba(0,0,0,0.04)", fontWeight:900,
            userSelect:"none", pointerEvents:"none",
          }}>❝</div>
          {/* Colorful quote badge */}
          <motion.div
            animate={{ rotate:[0,3,-3,0] }}
            transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }}
            style={{
              display:"inline-flex", alignItems:"center", justifyContent:"center",
              width:32, height:32, borderRadius:10,
              background:"linear-gradient(135deg, #f97316 0%, #ec4899 40%, #8b5cf6 75%, #06b6d4 100%)",
              marginBottom:14,
              boxShadow:"0 4px 14px rgba(139,92,246,0.4), 0 2px 6px rgba(249,115,22,0.3)",
            }}
          >
            <span style={{ fontSize:16, lineHeight:1, color:"#fff", fontWeight:900 }}>❝</span>
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div key={quoteIdx}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
              transition={{ duration:0.4 }}
            >
              <p style={{
                fontSize:14.5, color:"#1e293b", fontStyle:"italic",
                lineHeight:1.75, margin:"0 0 14px", fontWeight:500,
                letterSpacing:"0.15px",
              }}>
                {QUOTES[quoteIdx].text}
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ height:2, width:22, background:"linear-gradient(90deg,#f59e0b,#fbbf24)", borderRadius:99 }} />
                <p style={{
                  fontSize:11, fontWeight:900, letterSpacing:"1.2px", margin:0,
                  textTransform:"uppercase", color:"#b45309",
                }}>
                  {QUOTES[quoteIdx].author}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Stats grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:28 }}>
          {STATS.map(({ icon: Icon, value, label }, i) => (
            <motion.div key={i}
              initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
              transition={{ delay:0.5 + i*0.08, type:"spring", stiffness:300, damping:20 }}
              whileHover={{ scale:1.04, background:"rgba(255,255,255,0.14)" }}
              style={{
                padding:"14px 16px",
                background:"rgba(255,255,255,0.08)", backdropFilter:"blur(8px)",
                border:"1px solid rgba(255,255,255,0.12)", borderRadius:14,
                cursor:"default", transition:"background 0.25s",
              }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <Icon size={15} color="rgba(255,255,255,0.6)" />
                <span style={{ fontSize:18, fontWeight:900, color:"#fff" }}>{value}</span>
              </div>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.45)", margin:0, fontWeight:600, letterSpacing:"0.3px" }}>{label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.8 }}
        style={{ display:"flex", alignItems:"center", gap:8 }}>
        {[0,1,2,3].map(i => (
          <motion.div key={i}
            animate={{ width: i === Math.min(currentSection-1,3) ? 24 : 6 }}
            transition={{ duration:0.4, ease:[0.34,1.3,0.64,1] }}
            style={{
              height:6, borderRadius:99,
              background: i === Math.min(currentSection-1,3) ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
        <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:600, marginLeft:8 }}>
          {currentSection < 5 ? `${Math.round((currentSection/4)*100)}% complete` : "Done!"}
        </span>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════
   STEP PROGRESS (right panel)
══════════════════════════════════════ */
function StepProgress({ current, isDark }) {
  const ac = isDark ? "#f59e0b" : "#7C3AED";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:28 }}>
      {[1,2,3,4].map((s, i) => {
        const done = current > s, active = current === s;
        return (
          <div key={s} style={{ display:"flex", alignItems:"center", flex: i < 3 ? 1 : "none" }}>
            <motion.div
              animate={active ? { boxShadow:[`0 0 0 0 ${ac}40`,`0 0 0 8px ${ac}00`,`0 0 0 0 ${ac}40`] } : {}}
              transition={{ duration:2, repeat:Infinity }}
              style={{
                width:32, height:32, borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontWeight:800, fontSize:13, flexShrink:0,
                background: done||active ? `linear-gradient(135deg,${ac},${isDark?"#d97706":"#4F46E5"})` : (isDark?"rgba(15,23,42,0.6)":"rgba(249,246,255,0.8)"),
                border: done||active ? "none" : `2px solid ${isDark?"rgba(245,158,11,0.15)":"rgba(124,58,237,0.2)"}`,
                color: done||active ? (isDark?"#0f172a":"#fff") : (isDark?"#475569":"#94a3b8"),
                transition:"all 0.4s",
              }}
            >
              {done ? <CheckCircle size={14} color={isDark?"#0f172a":"#fff"} /> : s}
            </motion.div>
            {i < 3 && (
              <div style={{ flex:1, height:2, margin:"0 4px", background: current > s ? ac : (isDark?"rgba(245,158,11,0.1)":"rgba(124,58,237,0.12)"), borderRadius:99, transition:"background 0.5s", position:"relative", overflow:"hidden" }}>
                {current > s && (
                  <motion.div style={{ position:"absolute", inset:0, background:`linear-gradient(90deg,${ac},${isDark?"#d97706":"#4F46E5"})`, borderRadius:99 }}
                    initial={{ scaleX:0, transformOrigin:"left" }} animate={{ scaleX:1 }} transition={{ duration:0.6, ease:[0.34,1.3,0.64,1] }} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════
   ANIMATED SUCCESS CHECK
══════════════════════════════════════ */
function SuccessCheck({ isDark }) {
  const ac = isDark ? "#f59e0b" : "#7C3AED";
  return (
    <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
      <motion.div
        initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }}
        transition={{ type:"spring", stiffness:200, damping:14, delay:0.2 }}
        style={{ width:90, height:90, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
          background: isDark ? "rgba(245,158,11,0.1)" : "rgba(124,58,237,0.08)",
          border:`2.5px solid ${ac}`,
          boxShadow:`0 0 0 0 ${ac}40, 0 0 50px ${ac}30`,
        }}
      >
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
          <motion.path d="M9 24 L20 35 L37 13" stroke={ac} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength:0, opacity:0 }} animate={{ pathLength:1, opacity:1 }}
            transition={{ duration:0.7, delay:0.5, ease:"easeOut" }} />
        </svg>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN
══════════════════════════════════════ */
export default function Register() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  useLanguage();
  const isDark = theme === "dark";
  const ac = isDark ? "#f59e0b" : "#7C3AED";
  const acSecondary = isDark ? "#d97706" : "#4F46E5";
  const acRgb = isDark ? "245,158,11" : "124,58,237";

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [timerInterval, setTimerInterval] = useState(null);
  const [timerSecs, setTimerSecs] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [f, setF] = useState({ focused:{} });

  const [form, setForm] = useState({
    firstName:"", lastName:"", studentId:"",
    department:"", intake:"",
    otp:["","","","","",""],
    password:"", confirm:"",
  });

  const intakes = [];
  for (let i=57; i>=49; i--) intakes.push(i);

  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [foc, setFoc] = useState({});

  const handleChange = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const handleOtpChange = (i, v) => {
    if (v.length > 1) return;
    const o = [...form.otp]; o[i] = v; setForm({ ...form, otp:o });
    if (v && i < 5) document.getElementById(`otp${i+1}`)?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key==="Backspace" && !form.otp[i] && i>0) document.getElementById(`otp${i-1}`)?.focus();
  };

  const startTimer = () => {
    setTimerSecs(59);
    if (timerInterval) clearInterval(timerInterval);
    const id = setInterval(() => setTimerSecs(p => { if(p<=1){clearInterval(id);return 0;} return p-1; }), 1000);
    setTimerInterval(id);
  };

  const uniEmail = form.studentId.length >= 4 && form.department
    ? `${form.studentId}@${form.department.toLowerCase()}.bubt.edu.bd` : "";

  const validate = s => {
    if (s===1){ if(!form.firstName.trim()||!form.lastName.trim()){toast.error("Enter your full name.");return false;} if(!/^\d{11}$/.test(form.studentId)){toast.error("Student ID must be 11 digits.");return false;} }
    if (s===2){ if(!form.department){toast.error("Select a department.");return false;} if(!form.intake){toast.error("Select an intake.");return false;} }
    return true;
  };

  const next = async from => {
    if (!validate(from)) return;
    setDir(1);
    if (from===2){
      setIsLoading(true);
      try{ await api.post("request-otp/",{email:uniEmail}); toast.success("OTP sent to your email!"); setStep(from+1); startTimer(); }
      catch(e){ toast.error(e.response?.data?.error||"Failed to send OTP."); }
      finally{ setIsLoading(false); }
    } else setStep(from+1);
  };
  const back = from => { setDir(-1); setStep(from-1); };

  const verifyOtp = async () => {
    const s = form.otp.join("");
    if(s.length<6){toast.error("Enter full 6-digit OTP.");return;}
    setIsLoading(true);
    try{ await api.post("verify-otp/",{email:uniEmail,otp:s}); toast.success("Verified!"); setDir(1); setStep(4); }
    catch(e){ toast.error(e.response?.data?.error||"Invalid OTP"); }
    finally{ setIsLoading(false); }
  };

  const register = async () => {
    if(form.password.length<8){toast.error("Password must be 8+ chars.");return;}
    if(form.password!==form.confirm){toast.error("Passwords don't match.");return;}
    setIsLoading(true);
    try {
      await api.post("register/",{
        username:`${form.firstName}${form.lastName}`.toLowerCase(),
        first_name:form.firstName, last_name:form.lastName,
        student_id:form.studentId, department:form.department,
        intake:parseInt(form.intake), university_email:uniEmail,
        otp:form.otp.join(""), password:form.password,
      });
      setConfetti(true); setDir(1); setStep(5); toast.success("Account created!");
    } catch(e) {
      const d=e.response?.data;
      if(d?.error) toast.error(d.error);
      else if(d){ const k=Object.keys(d)[0]; toast.error(`${k}: ${d[k][0]}`); }
      else toast.error("Registration failed.");
    } finally{ setIsLoading(false); }
  };

  const slideV = {
    enter: d => ({ y: d>0?12:-12, opacity:0, scale:0.98, filter:"blur(2px)" }),
    center: { y:0, opacity:1, scale:1, filter:"blur(0px)" },
    exit: d => ({ y: d>0?-12:12, opacity:0, scale:0.98, filter:"blur(2px)" }),
  };

  const Spinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration:0.8, repeat:Infinity, ease:"linear" }}
      style={{
        width:18, height:18, borderRadius:"50%",
        border:"2.5px solid rgba(255,255,255,0.3)",
        borderTopColor:"#fff", flexShrink:0,
      }}
    />
  );

  const PrimaryBtn = ({ children, onClick, loading: btnLoading }) => (
    <ShineBtn
      onClick={onClick}
      loading={btnLoading}
      style={{
        width:"100%", padding:"14px 24px",
        background: btnLoading
          ? (isDark?"rgba(245,158,11,0.5)":"rgba(124,58,237,0.5)")
          : `linear-gradient(135deg,${ac},${acSecondary})`,
        color: isDark?"#0f172a":"#fff",
        border:"none", borderRadius:12, fontWeight:800, fontSize:15,
        fontFamily:"Inter,sans-serif", letterSpacing:"0.2px",
        boxShadow: btnLoading ? "none" : `0 6px 24px rgba(${acRgb},0.38)`,
        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        transition:"background 0.3s, box-shadow 0.3s",
      }}
    >
      {btnLoading ? <><Spinner /><span>Please wait...</span></> : children}
    </ShineBtn>
  );

  const GhostBtn = ({ children, onClick }) => (
    <ShineBtn onClick={onClick} style={{
      padding:"14px 18px", minWidth:50,
      background: isDark?"rgba(15,23,42,0.5)":"rgba(249,246,255,0.7)",
      color: isDark?"#64748b":"#9ca3af",
      border:`2px solid ${isDark?"rgba(245,158,11,0.12)":"rgba(124,58,237,0.18)"}`,
      borderRadius:12, fontWeight:700, fontFamily:"Inter,sans-serif",
      boxShadow:"none",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>{children}</ShineBtn>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Inter',sans-serif; }
        select option { background:${isDark?"#1e293b":"#fff"}; color:${isDark?"#f1f5f9":"#0f172a"}; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:${isDark?"rgba(245,158,11,0.3)":"rgba(124,58,237,0.25)"}; border-radius:99px; }
        @media (max-width: 768px) {
          .reg-left { display: none !important; }
          .reg-right { min-height: 100vh !important; padding: 32px 24px !important; }
        }
      `}</style>

      {confetti && <Confetti />}

      {/* ── OUTER WRAPPER ── */}
      <div style={{ display:"flex", minHeight:"100vh", fontFamily:"Inter,sans-serif" }}>

        {/* ══ LEFT PANEL ══ */}
        <div className="reg-left" style={{ flex:"0 0 42%" }}>
          <LeftPanel isDark={isDark} currentSection={step} />
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="reg-right" style={{
          flex:1, minHeight:"100vh", overflowY:"auto",
          background: isDark
            ? "linear-gradient(160deg,#080c18 0%,#0a0f1e 60%,#0c1020 100%)"
            : "linear-gradient(160deg,#faf8ff 0%,#f5f0ff 50%,#f0ebff 100%)",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          padding:"40px 48px", position:"relative",
        }}>

          {/* Theme/Language switcher */}
          <div style={{ position:"fixed", top:16, right:16, zIndex:100 }}>
            <ThemeLanguageSwitcher />
          </div>

          {/* Form card */}
          <motion.div
            initial={{ opacity:0, y:32, scale:0.96 }}
            animate={{ opacity:1, y:0, scale:1 }}
            transition={{ duration:0.65, ease:[0.34,1.3,0.64,1] }}
            style={{
              width:"100%", maxWidth:440,
              background: isDark ? "rgba(10,15,30,0.9)" : "rgba(255,255,255,0.85)",
              backdropFilter:"blur(30px)", WebkitBackdropFilter:"blur(30px)",
              borderRadius:24, padding:"40px 36px",
              border:`1px solid ${isDark?"rgba(245,158,11,0.12)":"rgba(124,58,237,0.2)"}`,
              boxShadow: isDark
                ? "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(245,158,11,0.08) inset"
                : "0 32px 80px rgba(109,40,217,0.14), 0 0 0 1px rgba(255,255,255,0.7) inset",
              position:"relative", overflow:"hidden",
            }}
          >
            {/* Card top shimmer */}
            <motion.div style={{ position:"absolute", top:0, left:0, right:0, height:1.5,
              background:`linear-gradient(90deg,transparent,${ac}90,transparent)`, borderRadius:"24px 24px 0 0" }}
              animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:3, repeat:Infinity }} />

            {step < 5 && (
              <>
                {/* Mini logo (mobile) */}
                <div style={{ display:"none", alignItems:"center", gap:10, marginBottom:24 }} className="mobile-logo">
                  <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${ac},${acSecondary})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <GraduationCap size={20} color="white" />
                  </div>
                  <span style={{ fontSize:16, fontWeight:900, color: isDark?"#f1f5f9":"#0f172a" }}>CampusConnect</span>
                </div>

                {/* Step title */}
                <AnimatePresence mode="wait">
                  <motion.div key={`hdr-${step}`}
                    initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                    transition={{ duration:0.3 }} style={{ marginBottom:24 }}
                  >
                    <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.7px", textTransform:"uppercase",
                      color: isDark?"#475569":"#94a3b8", marginBottom:4 }}>
                      Step {step} of 4
                    </p>
                    <h2 style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.6px",
                      color: isDark?"#f1f5f9":"#0f172a", lineHeight:1.25 }}>
                      {step===1 && "Personal Information"}
                      {step===2 && "Academic Details"}
                      {step===3 && "Email Verification"}
                      {step===4 && "Set Your Password"}
                    </h2>
                  </motion.div>
                </AnimatePresence>

                {/* Progress */}
                <StepProgress current={step} isDark={isDark} />
              </>
            )}

            {/* ── STEPS ── */}
            <div style={{ position:"relative", overflow:"hidden" }}>
              <AnimatePresence mode="wait" custom={dir}>

                {/* STEP 1 */}
                {step===1 && (
                  <motion.div key="s1" custom={dir} variants={slideV} initial="enter" animate="center" exit="exit"
                    transition={{ duration:0.22, ease:"easeOut" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                      <div style={{ display:"flex", gap:12 }}>
                        <div style={{ flex:1 }}>
                          <Field icon={User} label="First Name" placeholder="e.g. Shamim"
                            value={form.firstName} onChange={handleChange("firstName")}
                            onFocus={()=>setFoc({fn:true})} onBlur={()=>setFoc({})}
                            isFocused={foc.fn} isDark={isDark} />
                        </div>
                        <div style={{ flex:1 }}>
                          <Field icon={User} label="Last Name" placeholder="e.g. Pramanik"
                            value={form.lastName} onChange={handleChange("lastName")}
                            onFocus={()=>setFoc({ln:true})} onBlur={()=>setFoc({})}
                            isFocused={foc.ln} isDark={isDark} />
                        </div>
                      </div>
                      <div>
                        <Field icon={IdCard} label="Student ID (11 digits)" placeholder="22235103267"
                          value={form.studentId} onChange={handleChange("studentId")} maxLength={11}
                          onFocus={()=>setFoc({sid:true})} onBlur={()=>setFoc({})}
                          isFocused={foc.sid} isDark={isDark} />
                      </div>
                      <div>
                        <PrimaryBtn onClick={()=>next(1)}>Continue <ArrowRight size={17}/></PrimaryBtn>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 */}
                {step===2 && (
                  <motion.div key="s2" custom={dir} variants={slideV} initial="enter" animate="center" exit="exit"
                    transition={{ duration:0.22, ease:"easeOut" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                      {/* Encouragement pill */}
                      <motion.div initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }} transition={{ delay:0.05 }}
                        style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 14px",
                          background: isDark?"rgba(245,158,11,0.07)":"rgba(124,58,237,0.06)",
                          border:`1px solid ${isDark?"rgba(245,158,11,0.15)":"rgba(124,58,237,0.15)"}`,
                          borderRadius:10 }}>
                        <Sparkles size={14} color={ac}/>
                        <span style={{ fontSize:13, fontWeight:600, color:ac }}>You're almost there!</span>
                      </motion.div>
                      <motion.div initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}>
                        <SelectField icon={Building} label="Department"
                          value={form.department} onChange={handleChange("department")}
                          onFocus={()=>setFoc({dep:true})} onBlur={()=>setFoc({})}
                          isFocused={foc.dep} isDark={isDark}>
                          <option value="" disabled>Select Department</option>
                          <option value="CSE">Computer Science (CSE)</option>
                          <option value="EEE">Electrical (EEE)</option>
                          <option value="TEXTILE">Textile</option>
                          <option value="CIVIL">Civil</option>
                          <option value="BBA">BBA</option>
                          <option value="ENG">English</option>
                          <option value="ECON">Economics</option>
                          <option value="LLB">Law (LLB)</option>
                        </SelectField>
                      </motion.div>
                      <motion.div initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}>
                        <SelectField icon={BookOpen} label="Intake"
                          value={form.intake} onChange={handleChange("intake")}
                          onFocus={()=>setFoc({itk:true})} onBlur={()=>setFoc({})}
                          isFocused={foc.itk} isDark={isDark}>
                          <option value="" disabled>Select Intake</option>
                          {intakes.map(i=><option key={i} value={i}>Intake {i}</option>)}
                        </SelectField>
                      </motion.div>
                      {/* Email preview */}
                      <motion.div initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}
                        style={{ padding:"12px 14px",
                          background: isDark?"rgba(15,23,42,0.5)":"rgba(249,246,255,0.7)",
                          border:`1.5px dashed ${isDark?"rgba(245,158,11,0.18)":"rgba(124,58,237,0.2)"}`,
                          borderRadius:12 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                          <Mail size={13} color={ac}/>
                          <span style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px", color: isDark?"#475569":"#94a3b8" }}>University Email</span>
                        </div>
                        <p style={{ fontSize:13, fontFamily:"monospace", fontWeight:600, color: uniEmail?ac:(isDark?"#475569":"#9ca3af"), transition:"color 0.3s" }}>
                          {uniEmail || "Fill fields above to preview"}
                        </p>
                      </motion.div>
                      <motion.div initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.25 }}>
                        <div style={{ display:"flex", gap:10 }}>
                          <GhostBtn onClick={()=>back(2)}><ArrowLeft size={17}/></GhostBtn>
                          <div style={{ flex:1 }}>
                            <PrimaryBtn onClick={()=>next(2)} loading={isLoading}>Send Verification <Mail size={17}/></PrimaryBtn>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 */}
                {step===3 && (
                  <motion.div key="s3" custom={dir} variants={slideV} initial="enter" animate="center" exit="exit"
                    transition={{ duration:0.22, ease:"easeOut" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:18, alignItems:"center" }}>
                      <motion.div
                        animate={{ scale:[1,1.08,1], boxShadow:[`0 0 0 0 ${ac}30`,`0 0 0 14px ${ac}00`] }}
                        transition={{ duration:2.5, repeat:Infinity }}
                        style={{ width:60, height:60, borderRadius:18,
                          background: isDark?"rgba(245,158,11,0.1)":"rgba(124,58,237,0.08)",
                          border:`2px solid ${isDark?"rgba(245,158,11,0.2)":"rgba(124,58,237,0.2)"}`,
                          display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Mail size={26} color={ac}/>
                      </motion.div>
                      <div style={{ textAlign:"center", width:"100%" }}>
                        <p style={{ fontSize:13, color: isDark?"#94a3b8":"#6b7280", marginBottom:4 }}>6-digit code sent to</p>
                        <p style={{ fontSize:13, fontFamily:"monospace", fontWeight:700, color:ac }}>{uniEmail}</p>
                      </div>
                      {/* OTP boxes */}
                      <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                        {form.otp.map((d,i) => (
                          <motion.input key={i} id={`otp${i}`} type="text" maxLength={1}
                            value={d} onChange={e=>handleOtpChange(i,e.target.value)} onKeyDown={e=>handleOtpKey(i,e)}
                            initial={{ opacity:0, scale:0.6, y:16 }}
                            animate={{ opacity:1, scale:1, y:0 }}
                            transition={{ delay:i*0.06, type:"spring", stiffness:400, damping:20 }}
                            whileFocus={{ scale:1.1 }}
                            style={{
                              width:46, height:56, textAlign:"center", fontSize:20, fontWeight:800,
                              fontFamily:"Inter,sans-serif",
                              background: d ? (isDark?"rgba(245,158,11,0.1)":"rgba(124,58,237,0.07)") : (isDark?"rgba(15,23,42,0.5)":"rgba(249,246,255,0.8)"),
                              border:`2px solid ${d?ac:(isDark?"rgba(245,158,11,0.12)":"rgba(124,58,237,0.18)")}`,
                              borderRadius:12, color: isDark?"#f1f5f9":"#0f172a", outline:"none",
                              boxShadow: d?`0 0 10px ${ac}25`:"none", transition:"all 0.2s",
                            }} />
                        ))}
                      </div>
                      <p style={{ fontSize:13, color: isDark?"#64748b":"#9ca3af", textAlign:"center" }}>
                        Didn't receive it?{" "}
                        {timerSecs>0
                          ? <span style={{ fontWeight:700, color:ac }}>0:{String(timerSecs).padStart(2,"0")}</span>
                          : <motion.button onClick={async()=>{ try{ await api.post("request-otp/",{email:uniEmail}); toast.success("OTP resent!"); startTimer(); }catch(e){toast.error("Failed.");} }}
                              whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                              style={{ background:"none", border:"none", color:ac, fontWeight:700, fontSize:13, fontFamily:"Inter,sans-serif", cursor:"pointer" }}>
                              Resend Now
                            </motion.button>
                        }
                      </p>
                      <div style={{ display:"flex", gap:10, width:"100%" }}>
                        <GhostBtn onClick={()=>back(3)}><ArrowLeft size={17}/></GhostBtn>
                        <div style={{ flex:1 }}>
                          <PrimaryBtn onClick={verifyOtp} loading={isLoading}><Shield size={17}/> Verify OTP</PrimaryBtn>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4 */}
                {step===4 && (
                  <motion.div key="s4" custom={dir} variants={slideV}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration:0.22, ease:"easeOut" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                      <motion.div initial={{ opacity:0,scale:0.92 }} animate={{ opacity:1,scale:1 }} transition={{ delay:0.05 }}
                        style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 14px",
                          background: isDark?"rgba(245,158,11,0.07)":"rgba(124,58,237,0.06)",
                          border:`1px solid ${isDark?"rgba(245,158,11,0.15)":"rgba(124,58,237,0.15)"}`, borderRadius:10 }}>
                        <motion.div animate={{ rotate:[0,15,-15,0] }} transition={{ duration:1, delay:0.6, repeat:2 }}>
                          <Zap size={14} color={ac}/>
                        </motion.div>
                        <span style={{ fontSize:13, fontWeight:600, color:ac }}>Last step — you're almost in!</span>
                      </motion.div>

                      {/* Strength meter */}
                      {form.password.length>0 && (
                        <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                          style={{ overflow:"hidden" }}>
                          <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                            {[1,2,3,4].map(n => (
                              <motion.div key={n} style={{ flex:1, height:3, borderRadius:99,
                                background: form.password.length>=n*2 ? (n<=2?"#ef4444":n===3?"#f59e0b":"#10b981") : (isDark?"rgba(245,158,11,0.08)":"rgba(124,58,237,0.1)"),
                                transition:"background 0.3s" }} />
                            ))}
                          </div>
                          <p style={{ fontSize:11, color: isDark?"#64748b":"#9ca3af", margin:0 }}>
                            {form.password.length<4?"Too weak":form.password.length<6?"Weak":form.password.length<8?"Almost there":"Strong ✓"}
                          </p>
                        </motion.div>
                      )}

                      <motion.div initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}>
                        <Field icon={Lock} label="Create Password"
                          type={showPw?"text":"password"} placeholder="8+ characters"
                          value={form.password} onChange={handleChange("password")}
                          onFocus={()=>setFoc({pw:true})} onBlur={()=>setFoc({})}
                          isFocused={foc.pw} isDark={isDark}
                          suffix={
                            <motion.button type="button" onClick={()=>setShowPw(!showPw)}
                              whileHover={{scale:1.15}} whileTap={{scale:0.9}}
                              style={{ background:"none", border:"none", color: isDark?"#64748b":"#9ca3af", cursor:"pointer", padding:0, display:"flex" }}>
                              {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
                            </motion.button>
                          } />
                      </motion.div>
                      <motion.div initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.16 }}>
                        <Field icon={Lock} label="Confirm Password"
                          type={showCpw?"text":"password"} placeholder="Re-enter password"
                          value={form.confirm} onChange={handleChange("confirm")}
                          onFocus={()=>setFoc({cpw:true})} onBlur={()=>setFoc({})}
                          isFocused={foc.cpw} isDark={isDark}
                          suffix={
                            <motion.button type="button" onClick={()=>setShowCpw(!showCpw)}
                              whileHover={{scale:1.15}} whileTap={{scale:0.9}}
                              style={{ background:"none", border:"none",
                                color: form.confirm&&form.confirm===form.password?"#10b981":(isDark?"#64748b":"#9ca3af"),
                                cursor:"pointer", padding:0, display:"flex", transition:"color 0.3s" }}>
                              {showCpw?<EyeOff size={16}/>:(form.confirm&&form.confirm===form.password?<CheckCircle size={16}/>:<Eye size={16}/>)}
                            </motion.button>
                          } />
                      </motion.div>
                      <motion.div initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.22 }}>
                        <div style={{ display:"flex", gap:10 }}>
                          <GhostBtn onClick={()=>back(4)}><ArrowLeft size={17}/></GhostBtn>
                          <div style={{ flex:1 }}>
                            <PrimaryBtn onClick={register} loading={isLoading}>Create Account <CheckCircle size={17}/></PrimaryBtn>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 5 — Success */}
                {step===5 && (
                  <motion.div key="s5"
                    variants={{ enter:{ opacity:0, scale:0.75, filter:"blur(12px)" }, center:{ opacity:1, scale:1, filter:"blur(0px)" }, exit:{ opacity:0, scale:1.05 } }}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration:0.7, ease:[0.34,1.3,0.64,1] }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, textAlign:"center", paddingTop:8 }}>
                      <SuccessCheck isDark={isDark} />
                      <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.6 }}>
                        <h2 style={{ fontSize:26, fontWeight:900, letterSpacing:"-0.8px",
                          background:`linear-gradient(135deg,${ac},${acSecondary})`,
                          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                          backgroundClip:"text", marginBottom:8 }}>
                          Welcome Aboard! 🎉
                        </h2>
                        <p style={{ fontSize:14, color: isDark?"#94a3b8":"#6b7280", fontWeight:500 }}>
                          Your account is live and ready.<br/>Let's build your future together.
                        </p>
                      </motion.div>
                      <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.8 }}
                        style={{ width:"100%" }}>
                        <PrimaryBtn onClick={()=>navigate("/login")}><Zap size={17}/> Go to Login</PrimaryBtn>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer */}
            {step<5 && (
              <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
                style={{ textAlign:"center", fontSize:13, color: isDark?"#374151":"#9ca3af", marginTop:24 }}>
                Already have an account?{" "}
                <motion.button onClick={()=>navigate("/login")} whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                  style={{ background:"none", border:"none", cursor:"pointer", color:ac, fontWeight:700, fontSize:13, fontFamily:"Inter,sans-serif", padding:0 }}>
                  Login →
                </motion.button>
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
