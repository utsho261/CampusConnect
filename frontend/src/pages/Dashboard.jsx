import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, FileQuestion, FileText, FileEdit, Briefcase,
  Heart, Sparkles, Search, ShoppingBag, Phone,
  ArrowRight, GraduationCap, LayoutDashboard, LogOut,
  User, Bell, ChevronDown, Shield, Menu, X,
  TrendingUp, Activity, Users, MapPin, LineChart, BellRing, Settings
} from "lucide-react";
import { useLanguage, useTheme, useBreakpoint } from "../hooks";
import { cardsGridCols, headerPadding, mainOffset, pagePadding, statsGridCols } from "../utils/responsiveLayout";
import ThemeLanguageSwitcher from "../components/ThemeLanguageSwitcher";
import { getThemeColors } from "../utils/themeColors";
import api from "../services/api";

const navGroups = [
  {
    labelKey: "dashboard.groups.main",
    items: [{ titleKey: "common.dashboard", icon: LayoutDashboard, link: "/dashboard", color: "#7C3AED" }],
  },
  {
    labelKey: "dashboard.groups.academic",
    items: [
      { titleKey: "features.notes", icon: BookOpen, link: "/notes", color: "#8B5CF6" },
      { titleKey: "features.ctQuestions", icon: FileQuestion, link: "/ct-questions", color: "#3B82F6" },
      { titleKey: "features.assignmentCover", icon: FileEdit, link: "/assignment-cover", color: "#6366F1" },
    ],
  },
  {
    labelKey: "dashboard.groups.career",
    items: [{ titleKey: "features.jobs", icon: Briefcase, link: "/jobs", color: "#4F46E5" }],
  },
  {
    labelKey: "dashboard.groups.community",
    items: [
      { titleKey: "features.bloodDonation", icon: Heart, link: "/blood-donation", color: "#EF4444" },
      { titleKey: "features.clubsEvents", icon: Sparkles, link: "/clubs-events", color: "#F59E0B" },
      { titleKey: "features.lostFound", icon: Search, link: "/lost-found", color: "#10B981" },
      { titleKey: "features.emergency", icon: Phone, link: "/emergency", color: "#EC4899" },
    ],
  },
  {
    labelKey: "dashboard.groups.marketplace",
    items: [{ titleKey: "features.bookMarketplace", icon: ShoppingBag, link: "/book-marketplace", color: "#F97316" }],
  },
  {
    labelKey: "dashboard.groups.security",
    items: [{ titleKey: "features.verification", icon: Shield, link: "/verification", color: "#059669" }],
  },
];

const dashboardCards = [
  { titleKey: "features.notes", descKey: "features.notesDesc", icon: BookOpen, color: "#8B5CF6", link: "/notes" },
  { titleKey: "features.ctQuestions", descKey: "features.ctQuestionsDesc", icon: FileQuestion, color: "#3B82F6", link: "/ct-questions" },
  { titleKey: "features.assignmentCover", descKey: "features.assignmentCoverDesc", icon: FileEdit, color: "#6366F1", link: "/assignment-cover" },
  { titleKey: "features.jobs", descKey: "features.jobsDesc", icon: Briefcase, color: "#4F46E5", link: "/jobs" },
  { titleKey: "features.bloodDonation", descKey: "features.bloodDonationDesc", icon: Heart, color: "#EF4444", link: "/blood-donation" },
  { titleKey: "features.clubsEvents", descKey: "features.clubsEventsDesc", icon: Sparkles, color: "#F59E0B", link: "/clubs-events" },
  { titleKey: "features.lostFound", descKey: "features.lostFoundDesc", icon: Search, color: "#10B981", link: "/lost-found" },
  { titleKey: "features.bookMarketplace", descKey: "features.bookMarketplaceDesc", icon: ShoppingBag, color: "#F97316", link: "/book-marketplace" },
  { titleKey: "features.emergency", descKey: "features.emergencyDesc", icon: Phone, color: "#EC4899", link: "/emergency" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

function Sidebar({ isMobile, open, onClose, onLogoutClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = getThemeColors(theme);
  const isDark = theme === "dark";

  const go = (link) => {
    navigate(link);
    if (isMobile) onClose?.();
  };

  return (
    <aside style={{
      position: "fixed", top: 0, left: 0, bottom: 0, width: isMobile ? "min(86vw, 300px)" : "280px",
      background: isDark ? "rgba(15, 23, 42, 0.75)" : "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderRight: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)",
      display: "flex", flexDirection: "column",
      zIndex: 50,
      boxShadow: isDark ? "4px 0 24px rgba(0,0,0,0.4)" : "4px 0 24px rgba(0,0,0,0.03)",
      transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      transform: isMobile && !open ? "translateX(-100%)" : "translateX(0)",
    }}>
      {/* Brand Header */}
      <div style={{ padding: "32px 24px 20px", display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #7C3AED, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(124,58,237,0.3)" }}>
          <GraduationCap size={22} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontSize: "19px", fontWeight: "800", color: colors.text_primary, letterSpacing: "-0.5px" }}>CampusConnect</div>
          <div style={{ fontSize: "12px", color: "#7C3AED", fontWeight: "600", letterSpacing: "0.5px", marginTop: "2px", textTransform: "uppercase" }}>Premium Portal</div>
        </div>
      </div>

      {/* Navigation Scroll Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {navGroups.map((group) => (
          <div key={group.labelKey}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: isDark ? "#64748B" : "#94A3B8", letterSpacing: "1.2px", textTransform: "uppercase", padding: "0 12px 10px" }}>
              {t(group.labelKey)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {group.items.map((item) => {
                const active = location.pathname === item.link;
                const activeBg = isDark ? `linear-gradient(90deg, ${item.color}25 0%, transparent 100%)` : `linear-gradient(90deg, ${item.color}15 0%, transparent 100%)`;
                const inactiveColor = isDark ? "#94A3B8" : "#64748B";

                return (
                  <motion.button 
                    key={item.titleKey} 
                    onClick={() => go(item.link)} 
                    whileHover={{ x: 4, backgroundColor: isDark ? `${item.color}15` : `${item.color}10` }}
                    whileTap={{ backgroundColor: isDark ? `${item.color}35` : `${item.color}25` }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "12px",
                      padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer",
                      textAlign: "left", position: "relative",
                      background: active ? activeBg : "transparent",
                      color: active ? (isDark ? "#F8FAFC" : "#0F172A") : inactiveColor,
                      fontSize: "14px", fontWeight: active ? "600" : "500",
                      transition: "all 0.25s ease", fontFamily: "Inter, sans-serif"
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.color = isDark ? "#E2E8F0" : "#1E293B";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.color = inactiveColor;
                    }}
                  >
                    {active && (
                      <motion.div layoutId="activeIndicator" style={{ position: "absolute", left: 0, top: "15%", bottom: "15%", width: "3px", borderRadius: "0 4px 4px 0", background: item.color, boxShadow: `0 0 10px ${item.color}80` }} />
                    )}
                    <div className="icon-wrapper" style={{ width: "24px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: item.color }}>
                      <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                    </div>
                    {t(item.titleKey)}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Fixed Logout Button */}
      <div style={{ padding: "16px", borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)", flexShrink: 0 }}>
        <motion.button 
          onClick={onLogoutClick}
          whileHover={{ scale: 1.02, backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.08)" }}
          whileTap={{ scale: 0.96 }}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "12px",
            padding: "12px 16px", borderRadius: "12px", border: isDark ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(239, 68, 68, 0.1)", 
            cursor: "pointer", background: "transparent",
            color: "#EF4444", fontSize: "14px", fontWeight: "600",
            transition: "all 0.2s ease", fontFamily: "Inter, sans-serif"
          }}
        >
          <LogOut size={18} strokeWidth={2.5} />
          {t("common.logout")}
        </motion.button>
      </div>
    </aside>
  );
}

function PremiumDashboardCard({ titleKey, descKey, icon: Icon, color, link }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === "dark";

  return (
    <motion.div variants={itemVariants}
      onClick={() => navigate(link)}
      whileHover={{ y: -8, scale: 1.03, boxShadow: isDark ? `0 20px 40px rgba(0,0,0,0.6)` : `0 20px 40px rgba(0,0,0,0.08)` }}
      whileTap={{ 
        scale: 0.95, 
        y: 4, 
        boxShadow: `0 0 0 4px ${color}50, 0 0 40px ${color}80`,
        transition: { type: "spring", stiffness: 500, damping: 25 }
      }}
      style={{
        background: isDark ? "rgba(30,41,59,0.7)" : "#ffffff",
        backdropFilter: "blur(24px)",
        borderRadius: "24px", cursor: "pointer",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
        boxShadow: isDark ? `0 12px 40px rgba(0,0,0,0.4)` : `0 12px 30px rgba(0,0,0,0.04)`,
        display: "flex", flexDirection: "column",
        overflow: "hidden", position: "relative"
      }}
      onMouseEnter={(e) => {
        const arrow = e.currentTarget.querySelector('.arrow-icon');
        if (arrow) arrow.style.transform = "translateX(6px)";
      }}
      onMouseLeave={(e) => {
        const arrow = e.currentTarget.querySelector('.arrow-icon');
        if (arrow) arrow.style.transform = "translateX(0)";
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: "160px", height: "160px", background: color, borderRadius: "50%", filter: "blur(70px)", opacity: isDark ? 0.2 : 0.12, transform: "translate(30%, -30%)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100px", height: "100px", background: color, borderRadius: "50%", filter: "blur(60px)", opacity: isDark ? 0.15 : 0.08, transform: "translate(-30%, 30%)" }} />

      <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", flex: 1, position: "relative", zIndex: 1 }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "18px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", marginBottom: "24px",
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          boxShadow: `0 10px 25px ${color}50`
        }}>
          <Icon size={26} strokeWidth={2.5} />
        </div>

        <div style={{ fontSize: "19px", fontWeight: "800", color: isDark ? "#F8FAFC" : "#0F172A", marginBottom: "8px", letterSpacing: "-0.3px" }}>
          {t(titleKey)}
        </div>
        <p style={{ fontSize: "14px", color: isDark ? "#94A3B8" : "#64748B", lineHeight: "1.6", margin: "0 0 24px", flex: 1, fontWeight: "500" }}>
          {t(descKey)}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "700", color: isDark ? "#E2E8F0" : "#1E293B", marginTop: "auto" }}>
          {t("common.open")} 
          <div className="arrow-icon" style={{ transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)", display: "flex", alignItems: "center", color: color }}>
            <ArrowRight size={18} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatWidget({ title, value, icon: Icon, color }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  return (
    <motion.div variants={itemVariants} whileHover={{ y: -4 }} style={{
      background: isDark ? "linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.8) 100%)" : "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)",
      backdropFilter: "blur(24px)",
      borderRadius: "24px", padding: "24px 28px", display: "flex", alignItems: "center", gap: "24px",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.8)"}`,
      boxShadow: isDark ? "0 8px 30px rgba(0,0,0,0.3)" : "0 8px 30px rgba(15,23,42,0.04)",
      position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "100px", height: "100px", background: color, borderRadius: "50%", filter: "blur(50px)", opacity: isDark ? 0.15 : 0.08 }} />
      
      <div style={{ width: "56px", height: "56px", borderRadius: "18px", background: isDark ? `linear-gradient(135deg, ${color}25 0%, ${color}10 100%)` : `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: color, border: `1px solid ${isDark ? `${color}40` : `${color}25`}`, boxShadow: `0 8px 20px ${color}15`, position: "relative", zIndex: 1 }}>
        <Icon size={26} strokeWidth={2.2} />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: "32px", fontWeight: "800", color: isDark ? "#F8FAFC" : "#0F172A", lineHeight: 1, letterSpacing: "-1px" }}>{value}</div>
        <div style={{ fontSize: "14px", color: isDark ? "#94A3B8" : "#64748B", marginTop: "8px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</div>
      </div>
    </motion.div>
  );
}

// Format ISO date to relative time
function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

const iconMap = {
  academic: { icon: FileText, color: "#8B5CF6" },
  career: { icon: Briefcase, color: "#3B82F6" },
  community: { icon: Heart, color: "#EF4444" },
  default: { icon: Sparkles, color: "#10B981" }
};

export default function Dashboard() {
  const [username, setUsername] = useState("Student");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const bp = useBreakpoint();
  const colors = getThemeColors(theme);
  const isDark = theme === "dark";

  // Dashboard state for real data
  const [stats, setStats] = useState({
    total_notes: "...",
    total_jobs: "...",
    total_posts: "...",
    total_blood_requests: "...",
    recent_activity: [],
    graph_data: [10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20]
  });

  useEffect(() => {
    const name = localStorage.getItem("username");
    if (name) setUsername(name);
    const role = localStorage.getItem("role");

    if (role === "admin") {
      navigate("/admin/dashboard");
      return;
    }

    if (!role || !localStorage.getItem("access")) {
      navigate("/login");
    }

    api.get("dashboard/stats/")
      .then(res => setStats(res.data))
      .catch(err => console.error("Failed to fetch dashboard stats", err));
  }, [navigate]);

  const confirmLogout = () => {
    ["access", "refresh", "username", "student_id", "role"].forEach((k) => localStorage.removeItem(k));
    navigate("/login");
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("dashboard.greeting.morning") : hour < 17 ? t("dashboard.greeting.afternoon") : t("dashboard.greeting.evening");

  const filteredCards = dashboardCards.filter((card) => {
    const q = searchQuery.toLowerCase();
    return t(card.titleKey).toLowerCase().includes(q) || t(card.descKey).toLowerCase().includes(q);
  });

  return (
    <div className="cc-page" style={{ display: "flex", minHeight: "100vh", background: isDark ? "#020617" : "#F8FAFC", fontFamily: "Inter, sans-serif", color: colors.text_primary, transition: "background-color 0.3s ease", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}; border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
        ::-webkit-scrollbar-thumb:hover { background-color: ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}; }
      `}</style>

      {/* Decorative background gradients */}
      <div style={{ position: "fixed", top: "-20%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-20%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {bp.isMobile && sidebarOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} aria-hidden="true" style={{ position: "fixed", inset: 0, background: isDark ? "rgba(2,6,23,0.8)" : "rgba(15,23,42,0.4)", backdropFilter: "blur(8px)", zIndex: 40 }} />
      )}
      <Sidebar isMobile={bp.isMobile} open={sidebarOpen || !bp.isMobile} onClose={() => setSidebarOpen(false)} onLogoutClick={() => setShowLogoutModal(true)} />

      <div style={{ marginLeft: mainOffset(bp), flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 10 }}>
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          background: isDark ? "rgba(2,6,23,0.6)" : "rgba(248,250,252,0.6)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
          padding: headerPadding(bp), minHeight: "80px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {bp.isMobile && (
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSidebarOpen(true)} aria-label="Open menu" style={{ width: 44, height: 44, borderRadius: 14, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`, background: isDark ? "rgba(255,255,255,0.05)" : "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: colors.text_primary, boxShadow: isDark ? "none" : "0 4px 10px rgba(0,0,0,0.05)" }}>
                <Menu size={22} />
              </motion.button>
            )}
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: "800", color: isDark ? "#F8FAFC" : "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>{greeting}, {username}</h1>
              <div style={{ fontSize: "14px", color: isDark ? "#94A3B8" : "#64748B", marginTop: "4px", fontWeight: "500" }}>Here's your premium campus overview.</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <ThemeLanguageSwitcher />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ width: "44px", height: "44px", borderRadius: "50%", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`, background: isDark ? "rgba(255,255,255,0.05)" : "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", color: colors.text_primary, boxShadow: isDark ? "none" : "0 4px 10px rgba(0,0,0,0.05)" }}>
              <BellRing size={20} strokeWidth={2} />
              <span style={{ position: "absolute", top: "10px", right: "10px", width: "10px", height: "10px", borderRadius: "50%", background: "#EF4444", border: `2px solid ${isDark ? "#0F172A" : "white"}` }} />
            </motion.button>

            <div style={{ position: "relative" }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setDropdownOpen(!dropdownOpen)} style={{ display: "flex", alignItems: "center", gap: "10px", border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "18px", fontWeight: "800", boxShadow: "0 4px 14px rgba(124,58,237,0.3)", border: "2px solid rgba(255,255,255,0.2)" }}>
                  {username.charAt(0).toUpperCase()}
                </div>
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} style={{ position: "absolute", top: "calc(100% + 16px)", right: 0, background: isDark ? "rgba(30,41,59,0.95)" : "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderRadius: "20px", boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.6)" : "0 20px 60px rgba(15,23,42,0.1)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`, padding: "12px", minWidth: "240px", zIndex: 100 }}>
                    <div style={{ padding: "12px 16px", marginBottom: "8px", background: isDark ? "rgba(0,0,0,0.2)" : "rgba(241,245,249,0.5)", borderRadius: "12px" }}>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: isDark ? "#F8FAFC" : "#0F172A" }}>{username}</div>
                      <div style={{ fontSize: "13px", color: isDark ? "#94A3B8" : "#64748B", marginTop: "2px" }}>Premium Student</div>
                    </div>
                    <button onClick={() => { navigate("/profile"); setDropdownOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", border: "none", background: "transparent", cursor: "pointer", color: isDark ? "#E2E8F0" : "#334155", fontSize: "14px", fontWeight: "600", transition: "all 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}><Settings size={18} /> {t("common.profileSettings")}</button>
                    <div style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", margin: "8px 0" }} />
                    <button onClick={() => { setShowLogoutModal(true); setDropdownOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", border: "none", background: "transparent", cursor: "pointer", color: "#EF4444", fontSize: "14px", fontWeight: "600", transition: "all 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}><LogOut size={18} /> {t("common.logout")}</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: pagePadding(bp), overflowY: "auto", overflowX: "hidden" }}>
          <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ maxWidth: "1400px", margin: "0 auto" }}>
            
            <div style={{ display: "grid", gridTemplateColumns: statsGridCols(bp), gap: "24px", marginBottom: "40px" }}>
              <StatWidget title="Total Notes" value={stats.total_notes} icon={BookOpen} color="#8B5CF6" />
              <StatWidget title="Active Jobs" value={stats.total_jobs} icon={Briefcase} color="#3B82F6" />
              <StatWidget title="Community Posts" value={stats.total_posts} icon={Users} color="#10B981" />
              <StatWidget title="Blood Requests" value={stats.total_blood_requests} icon={Heart} color="#EF4444" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: bp.isMobile ? "1fr" : "2fr 1fr", gap: "24px", marginBottom: "40px" }}>
              <motion.div variants={itemVariants} style={{ background: isDark ? "linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.8) 100%)" : "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)", backdropFilter: "blur(24px)", borderRadius: "28px", padding: "32px", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.8)"}`, boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.3)" : "0 12px 40px rgba(15,23,42,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: isDark ? "#F8FAFC" : "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "10px", letterSpacing: "-0.5px" }}><LineChart size={22} color="#8B5CF6" strokeWidth={2.5} /> Platform Activity</h2>
                  <select style={{ background: isDark ? "rgba(15,23,42,0.8)" : "white", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, padding: "8px 16px", borderRadius: "12px", color: isDark ? "#E2E8F0" : "#334155", fontSize: "13px", fontWeight: "600", outline: "none", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <option>Last 12 Days</option>
                  </select>
                </div>
                {/* Simulated Graph Using Mock Data for better visuals */}
                <div style={{ height: "220px", display: "flex", alignItems: "flex-end", gap: "14px" }}>
                  {[40, 60, 30, 80, 50, 90, 70, 100, 40, 60, 85, 45].map((h, i) => {
                    return (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.8, delay: i * 0.04, type: "spring", damping: 20 }} style={{ flex: 1, background: `linear-gradient(180deg, #8B5CF6 ${h}%, rgba(139,92,246,0.05) 100%)`, borderRadius: "8px", opacity: 0.85, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "white", opacity: 0.3, borderRadius: "4px 4px 0 0" }} />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} style={{ background: isDark ? "linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.8) 100%)" : "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)", backdropFilter: "blur(24px)", borderRadius: "28px", padding: "32px", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.8)"}`, boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.3)" : "0 12px 40px rgba(15,23,42,0.04)", display: "flex", flexDirection: "column" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: isDark ? "#F8FAFC" : "#0F172A", margin: "0 0 32px", display: "flex", alignItems: "center", gap: "10px", letterSpacing: "-0.5px" }}><Activity size={22} color="#10B981" strokeWidth={2.5} /> Live Updates</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
                  {stats.recent_activity.length > 0 ? stats.recent_activity.map((activity, i) => {
                    const mapping = iconMap[activity.type] || iconMap.default;
                    const IconComp = mapping.icon;
                    return (
                      <motion.div key={activity.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} style={{ display: "flex", gap: "16px", alignItems: "center", cursor: "pointer", padding: "8px", borderRadius: "16px", margin: "-8px", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: isDark ? `linear-gradient(135deg, ${mapping.color}30 0%, ${mapping.color}10 100%)` : `linear-gradient(135deg, ${mapping.color}20 0%, ${mapping.color}05 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: mapping.color, border: `1px solid ${isDark ? `${mapping.color}40` : `${mapping.color}20`}` }}>
                          <IconComp size={20} strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: isDark ? "#F8FAFC" : "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.2px" }}>{activity.title}</div>
                          <div style={{ fontSize: "13px", color: isDark ? "#94A3B8" : "#64748B", marginTop: "4px", fontWeight: "500" }}>{getRelativeTime(activity.time)}</div>
                        </div>
                      </motion.div>
                    );
                  }) : (
                    <div style={{ fontSize: "14px", color: isDark ? "#94A3B8" : "#64748B", textAlign: "center", marginTop: "40px", fontWeight: "500" }}>No recent activity.</div>
                  )}
                </div>
              </motion.div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
              <h2 style={{ fontSize: "26px", fontWeight: "800", color: isDark ? "#F8FAFC" : "#0F172A", margin: 0, letterSpacing: "-0.8px" }}>Explore Features</h2>
            </div>

            <motion.div variants={containerVariants} style={{ display: "grid", gridTemplateColumns: cardsGridCols(bp), gap: "24px", alignItems: "stretch", paddingBottom: "60px" }}>
              {filteredCards.map((card) => (
                <PremiumDashboardCard key={card.titleKey} {...card} />
              ))}
            </motion.div>

          </motion.div>
        </main>
      </div>

      {/* Premium Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ position: "absolute", inset: 0, background: isDark ? "rgba(2,6,23,0.8)" : "rgba(15,23,42,0.4)", backdropFilter: "blur(12px)" }}
              onClick={() => setShowLogoutModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{ position: "relative", width: "100%", maxWidth: "400px", background: isDark ? "#0F172A" : "white", borderRadius: "28px", padding: "32px", boxShadow: isDark ? "0 24px 60px rgba(0,0,0,0.6)" : "0 24px 60px rgba(15,23,42,0.15)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}` }}
            >
              <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", marginBottom: "24px", border: `1px solid rgba(239,68,68,0.2)` }}>
                <LogOut size={32} strokeWidth={2} />
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: isDark ? "#F8FAFC" : "#0F172A", margin: "0 0 12px", letterSpacing: "-0.5px" }}>Log Out?</h2>
              <p style={{ fontSize: "15px", color: isDark ? "#94A3B8" : "#64748B", margin: "0 0 32px", lineHeight: 1.6 }}>Are you sure you want to log out of your premium session? You will need to sign in again to access the dashboard.</p>
              
              <div style={{ display: "flex", gap: "12px" }}>
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogoutModal(false)}
                  style={{ flex: 1, padding: "14px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9", border: "none", color: isDark ? "#E2E8F0" : "#334155", fontSize: "15px", fontWeight: "700", cursor: "pointer", transition: "background 0.2s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0"}
                  onMouseLeave={(e) => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9"}
                >
                  Cancel
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={confirmLogout}
                  style={{ flex: 1, padding: "14px", borderRadius: "14px", background: "#EF4444", border: "none", color: "white", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 8px 20px rgba(239,68,68,0.3)" }}
                >
                  Log Out
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
