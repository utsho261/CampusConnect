import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  LayoutDashboard, Users, LogOut, ShieldCheck, GraduationCap,
  Search, Bell, ChevronDown, X, UserCog, Ban, CheckCircle2,
  Activity, Clock, Settings2, ChevronRight, Eye, EyeOff,
  BookOpen, FileQuestion, FileText, FileEdit, Briefcase,
  Heart, Sparkles, ShoppingBag, Phone, Lock, Unlock,
  RefreshCw, TrendingUp, AlertTriangle, Menu,
} from "lucide-react";
import toast from "react-hot-toast";
import { useBreakpoint } from "../hooks";
import { cardsGridCols, formGridCols, headerPadding, mainOffset, pagePadding, statsGridCols } from "../utils/responsiveLayout";

const FEATURE_META = {
  notes:            { label: "Notes Repository",      icon: BookOpen,     color: "#7C3AED" },
  ct_questions:     { label: "CT Question Bank",      icon: FileQuestion, color: "#2563EB" },
  lab_cover:        { label: "Lab Cover Generator",   icon: FileText,     color: "#0D9488" },
  assignment_cover: { label: "Assignment Cover",      icon: FileEdit,     color: "#6366f1" },
  jobs:             { label: "Job & Internship",      icon: Briefcase,    color: "#4F46E5" },
  blood_donation:   { label: "Blood Donation",        icon: Heart,        color: "#DC2626" },
  clubs_events:     { label: "Club & Events",         icon: Sparkles,     color: "#d97706" },
  lost_found:       { label: "Lost & Found",          icon: Search,       color: "#059669" },
  book_marketplace: { label: "Book Marketplace",      icon: ShoppingBag,  color: "#EA580C" },
  emergency:        { label: "Emergency Contacts",    icon: Phone,        color: "#db2777" },
};

// ─── Admin Sidebar ─────────────────────────────────────────────────────────────
function AdminSidebar({ activeTab, setActiveTab, pendingJobCount = 0, isMobile, open, onClose }) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";

  const selectTab = (key) => {
    setActiveTab(key);
    if (isMobile) onClose?.();
  };

  const handleLogout = () => {
    ["access", "refresh", "username", "student_id", "role"].forEach(k => localStorage.removeItem(k));
    navigate("/admin/login");
  };

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "students", label: "Student Portal", icon: Users },
    { key: "jobs", label: "Job Approvals", icon: Briefcase, badge: pendingJobCount },
    { key: "settings", label: "Settings", icon: Settings2 },
  ];

  return (
    <aside style={{
      position: "fixed", top: 0, left: 0, bottom: 0, width: isMobile ? "min(86vw, 300px)" : "270px",
      background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
      display: "flex", flexDirection: "column",
      zIndex: 50, overflowY: "auto",
      borderRight: "1px solid rgba(245,158,11,0.1)",
      transition: "transform 0.3s ease",
      transform: isMobile && !open ? "translateX(-100%)" : "translateX(0)",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 22px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(245,158,11,0.4)", flexShrink: 0 }}>
          <ShieldCheck size={22} color="white" />
        </div>
        <div>
          <div style={{ fontSize: "17px", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.3px" }}>CampusConnect</div>
          <div style={{ fontSize: "10px", color: "#f59e0b", letterSpacing: "1.5px", fontWeight: "600" }}>ADMIN PANEL</div>
        </div>
      </div>

      {/* Admin user badge */}
      <div style={{ margin: "14px 14px 6px", padding: "14px 16px", background: "rgba(245,158,11,0.08)", borderRadius: "14px", border: "1px solid rgba(245,158,11,0.15)", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "800", color: "#0f172a", flexShrink: 0 }}>
          {username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#f1f5f9" }}>{username}</div>
          <div style={{ fontSize: "11px", color: "#f59e0b", marginTop: "1px", fontWeight: "600" }}>Administrator</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        <div style={{ fontSize: "10px", fontWeight: "700", color: "#475569", letterSpacing: "1px", textTransform: "uppercase", padding: "10px 12px 6px" }}>
          Navigation
        </div>
        {menuItems.map((item) => {
          const active = activeTab === item.key;
          return (
            <button key={item.key} onClick={() => selectTab(item.key)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "10px",
              padding: "12px 14px", borderRadius: "12px", border: "none", cursor: "pointer",
              textAlign: "left", marginBottom: "4px",
              background: active ? "rgba(245,158,11,0.12)" : "transparent",
              color: active ? "#f59e0b" : "#94a3b8",
              fontSize: "14px", fontWeight: active ? "700" : "500",
              transition: "all 0.15s", fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#e2e8f0"; }}}
            onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}}
            >
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: active ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                <item.icon size={17} color={active ? "#f59e0b" : "#64748b"} />
              </div>
              {item.label}
              {item.badge > 0 && (
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "white", fontSize: "10px", fontWeight: "800", padding: "2px 7px", borderRadius: "10px" }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "10px 10px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "12px", border: "none", cursor: "pointer", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontSize: "14px", fontWeight: "600", fontFamily: "Inter, sans-serif", transition: "all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
        >
          <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LogOut size={16} color="#ef4444" />
          </div>
          Logout
        </button>
      </div>
    </aside>
  );
}

// ─── Permission Modal ──────────────────────────────────────────────────────────
function PermissionModal({ student, permissions, onClose, onSave }) {
  const [localPerms, setLocalPerms] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalPerms(permissions.map(p => ({ ...p })));
  }, [permissions]);

  const togglePerm = (featureKey) => {
    setLocalPerms(prev => prev.map(p =>
      p.feature_key === featureKey ? { ...p, is_allowed: !p.is_allowed } : p
    ));
  };

  const updateLimit = (featureKey, value) => {
    const num = parseInt(value) || 0;
    setLocalPerms(prev => prev.map(p =>
      p.feature_key === featureKey ? { ...p, daily_limit: Math.max(0, num) } : p
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(student.id, localPerms);
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "white", borderRadius: "24px", width: "100%", maxWidth: "680px", maxHeight: "85vh", overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
              Feature Permissions
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
              {student.username} · {student.student_id}
            </p>
          </div>
          <button onClick={onClose} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 32px" }}>
          <div style={{ display: "grid", gap: "12px" }}>
            {localPerms.map((perm) => {
              const meta = FEATURE_META[perm.feature_key] || { label: perm.feature_key, icon: Settings2, color: "#6b7280" };
              const Icon = meta.icon;
              return (
                <div key={perm.feature_key} style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "16px 18px", borderRadius: "16px",
                  background: perm.is_allowed ? "#f8fafc" : "#fef2f2",
                  border: `1.5px solid ${perm.is_allowed ? "#e2e8f0" : "#fecaca"}`,
                  transition: "all 0.2s",
                }}>
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0,
                    background: perm.is_allowed ? `${meta.color}15` : "#fee2e2",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={20} color={perm.is_allowed ? meta.color : "#ef4444"} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{meta.label}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                      Usage: {perm.usage_count}{perm.daily_limit > 0 ? ` / ${perm.daily_limit}` : " (unlimited)"}
                    </div>
                  </div>

                  {/* Daily limit input */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>Limit:</div>
                    <input
                      type="number"
                      min="0"
                      value={perm.daily_limit}
                      onChange={(e) => updateLimit(perm.feature_key, e.target.value)}
                      style={{ width: "65px", padding: "8px 10px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "13px", fontWeight: "600", color: "#0f172a", textAlign: "center", outline: "none", fontFamily: "Inter, sans-serif" }}
                      placeholder="0"
                    />
                  </div>

                  {/* Toggle */}
                  <button onClick={() => togglePerm(perm.feature_key)} style={{
                    width: "52px", height: "28px", borderRadius: "14px", border: "none", cursor: "pointer",
                    background: perm.is_allowed ? "linear-gradient(135deg, #22c55e, #16a34a)" : "#e2e8f0",
                    position: "relative", transition: "background 0.2s", flexShrink: 0,
                  }}>
                    <div style={{
                      width: "22px", height: "22px", borderRadius: "50%", background: "white",
                      position: "absolute", top: "3px",
                      left: perm.is_allowed ? "27px" : "3px",
                      transition: "left 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "20px 32px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button onClick={onClose} style={{ padding: "12px 24px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: "700", fontSize: "14px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: "12px 28px", borderRadius: "12px", border: "none",
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#0f172a", fontWeight: "800", fontSize: "14px", cursor: saving ? "wait" : "pointer",
            fontFamily: "Inter, sans-serif", boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Permission modal
  const [permModalStudent, setPermModalStudent] = useState(null);
  const [permModalData, setPermModalData] = useState([]);

  // Job approvals
  const [adminJobs, setAdminJobs] = useState([]);
  const [pendingJobCount, setPendingJobCount] = useState(0);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobFilter, setJobFilter] = useState("pending");
  const [reviewJob, setReviewJob] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bp = useBreakpoint();
  const username = localStorage.getItem("username") || "Admin";

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("admin/student-usage/");
      setStats(res.data);
      setStudents(res.data.students || []);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 403) {
        toast.error("Admin access required");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const loadAdminJobs = useCallback(async (status = jobFilter) => {
    setJobsLoading(true);
    try {
      const res = await api.get("admin/jobs/", { params: status ? { status } : {} });
      setAdminJobs(res.data.jobs || []);
      setPendingJobCount(res.data.pending_count || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load job postings");
    } finally {
      setJobsLoading(false);
    }
  }, [jobFilter]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/admin/login");
      return;
    }
    loadStats();
    loadAdminJobs("pending");
  }, [loadStats, loadAdminJobs, navigate]);

  useEffect(() => {
    if (activeTab === "jobs") loadAdminJobs(jobFilter);
  }, [activeTab, jobFilter, loadAdminJobs]);

  const handleJobReview = async (jobId, action) => {
    setReviewing(true);
    try {
      await api.patch(`admin/jobs/${jobId}/review/`, {
        action,
        rejection_reason: action === "reject" ? rejectReason : "",
      });
      toast.success(action === "approve" ? "Job approved & published" : "Job rejected");
      setReviewJob(null);
      setRejectReason("");
      loadAdminJobs(jobFilter);
    } catch {
      toast.error("Review failed");
    } finally {
      setReviewing(false);
    }
  };

  const updateStudentControl = async (userId, updates) => {
    try {
      await api.patch(`admin/student-control/${userId}/`, updates);
      toast.success("Student updated");
      await loadStats();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update");
    }
  };

  const setStudentLimit = async (userId, limit) => {
    const parsed = Number(limit);
    if (Number.isNaN(parsed) || parsed < 0) return;
    await updateStudentControl(userId, { max_usage_limit: parsed });
  };

  const openPermissions = async (student) => {
    try {
      const res = await api.get(`admin/student-permissions/${student.id}/`);
      setPermModalData(res.data);
      setPermModalStudent(student);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load permissions");
    }
  };

  const savePermissions = async (studentId, perms) => {
    try {
      const payload = perms.map(p => ({
        feature_key: p.feature_key,
        is_allowed: p.is_allowed,
        daily_limit: p.daily_limit,
      }));
      await api.patch(`admin/student-permissions/${studentId}/`, { permissions: payload });
      toast.success("Permissions saved");
      setPermModalStudent(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save permissions");
    }
  };

  const filteredStudents = students.filter(s =>
    s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const greetEmoji = hour < 12 ? "🌅" : hour < 17 ? "☀️" : "🌙";

  const statCards = [
    { label: "Total Students",  value: stats?.total_students ?? "-",  icon: Users,          color: "#3b82f6", bg: "#eff6ff", gradient: "linear-gradient(135deg, #3b82f6, #2563eb)" },
    { label: "Active (24h)",    value: stats?.active_students ?? "-", icon: Activity,       color: "#22c55e", bg: "#f0fdf4", gradient: "linear-gradient(135deg, #22c55e, #16a34a)" },
    { label: "Blocked",         value: stats?.blocked_students ?? "-",icon: AlertTriangle,  color: "#ef4444", bg: "#fef2f2", gradient: "linear-gradient(135deg, #ef4444, #dc2626)" },
    { label: "Login Rate",      value: stats ? `${stats.active_students > 0 ? Math.round((stats.active_students / Math.max(stats.total_students, 1)) * 100) : 0}%` : "-", icon: TrendingUp, color: "#f59e0b", bg: "#fffbeb", gradient: "linear-gradient(135deg, #f59e0b, #d97706)" },
  ];

  return (
    <div className="cc-page" style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.25); border-radius: 10px; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important; }
      `}</style>

      {bp.isMobile && sidebarOpen && (
        <div className="cc-sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} pendingJobCount={pendingJobCount} isMobile={bp.isMobile} open={sidebarOpen || !bp.isMobile} onClose={() => setSidebarOpen(false)} />

      <div style={{ marginLeft: mainOffset(bp), flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid #f1f5f9",
          padding: headerPadding(bp), minHeight: "66px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          flexWrap: "wrap",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {bp.isMobile && (
              <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" style={{ width: 40, height: 40, borderRadius: 11, border: "1px solid #e5e7eb", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f59e0b", flexShrink: 0 }}>
                <Menu size={20} />
              </button>
            )}
          <div style={{ fontSize: bp.isMobile ? "14px" : "15px", fontWeight: "600", color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {greetEmoji} {greeting},{" "}
            <span style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {username}
            </span>
            <span className="cc-hide-mobile" style={{ fontSize: "12px", marginLeft: "8px", color: "#94a3b8" }}>· Administrator</span>
          </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={loadStats} style={{ width: "40px", height: "40px", borderRadius: "11px", border: "1px solid #e5e7eb", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f59e0b" }} title="Refresh">
              <RefreshCw size={18} />
            </button>
            <button style={{ width: "40px", height: "40px", borderRadius: "11px", border: "1px solid #e5e7eb", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", color: "#f59e0b" }}>
              <Bell size={18} />
              <span style={{ position: "absolute", top: "8px", right: "8px", width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", border: "2px solid white" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px 6px 6px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f172a", fontSize: "14px", fontWeight: "800" }}>
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="cc-hide-mobile" style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>{username}</span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: pagePadding(bp), overflowY: "auto", overflowX: "hidden" }}>

          {/* ─── DASHBOARD TAB ─── */}
          {activeTab === "dashboard" && (
            <>
              {/* Welcome Banner */}
              <div style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
                borderRadius: "22px", padding: bp.isMobile ? "22px 20px" : "30px 40px", marginBottom: "28px",
                position: "relative", overflow: "hidden",
                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                border: "1px solid rgba(245,158,11,0.15)",
              }}>
                <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(245,158,11,0.08)" }} />
                <div style={{ position: "absolute", bottom: "-60px", right: "140px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(245,158,11,0.04)" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px", position: "relative" }}>
                  <ShieldCheck size={24} color="#f59e0b" />
                  <h1 style={{ fontSize: "22px", fontWeight: "800", color: "white", margin: 0, letterSpacing: "-0.3px" }}>
                    Admin Dashboard
                  </h1>
                </div>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", margin: 0, position: "relative" }}>
                  Manage students, permissions, and platform activity
                </p>
              </div>

              {/* Stat Cards */}
              <div style={{ display: "grid", gridTemplateColumns: statsGridCols(bp), gap: "18px", marginBottom: "32px" }}>
                {statCards.map((s, i) => (
                  <div key={i} className="stat-card" style={{
                    background: "white", borderRadius: "18px", padding: "24px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9",
                    transition: "all 0.25s ease", cursor: "default",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: s.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${s.color}30` }}>
                        <s.icon size={22} color="white" />
                      </div>
                    </div>
                    <div style={{ fontSize: "30px", fontWeight: "900", color: "#0f172a", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px", fontWeight: "600" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Access: Student Portal */}
              <button onClick={() => setActiveTab("students")} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "22px 28px", borderRadius: "18px", border: "1.5px solid rgba(245,158,11,0.15)",
                background: "linear-gradient(135deg, rgba(245,158,11,0.04), rgba(217,119,6,0.06))",
                cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(245,158,11,0.3)" }}>
                    <Users size={22} color="white" />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Student Portal</div>
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>Manage students, set permissions & usage limits</div>
                  </div>
                </div>
                <ChevronRight size={20} color="#f59e0b" />
              </button>
            </>
          )}

          {/* ─── STUDENTS TAB ─── */}
          {activeTab === "students" && (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Student Portal</h2>
                  <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0" }}>View login activity, manage permissions & usage limits</p>
                </div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {[
                    { label: `Total: ${stats?.total_students ?? "-"}`, bg: "#eff6ff", color: "#1d4ed8" },
                    { label: `Active: ${stats?.active_students ?? "-"}`, bg: "#f0fdf4", color: "#166534" },
                    { label: `Blocked: ${stats?.blocked_students ?? "-"}`, bg: "#fef2f2", color: "#991b1b" },
                  ].map((badge, i) => (
                    <div key={i} style={{ padding: "10px 16px", borderRadius: "12px", background: badge.bg, color: badge.color, fontWeight: "700", fontSize: "13px" }}>
                      {badge.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Search bar */}
              <div style={{ marginBottom: "20px", position: "relative", maxWidth: "400px" }}>
                <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: searchFocused ? "#f59e0b" : "#9ca3af", transition: "color 0.2s" }} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  style={{
                    width: "100%", padding: "12px 36px 12px 40px",
                    borderRadius: "12px", border: searchFocused ? "2px solid #f59e0b" : "2px solid #e5e7eb",
                    background: "white", fontSize: "14px", color: "#111827", outline: "none",
                    fontFamily: "Inter, sans-serif", transition: "all 0.2s",
                    boxShadow: searchFocused ? "0 0 0 4px rgba(245,158,11,0.1)" : "none",
                  }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex" }}>
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Student Table */}
              <div style={{ background: "white", borderRadius: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                <div className="cc-table-wrap">
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: bp.isMobile ? "720px" : "1100px" }}>
                    <thead>
                      <tr style={{ background: "#fafbfc" }}>
                        {["Student", "ID", "Department", "Logins", "Limit", "Last Login", "Status", "Actions"].map((h, i) => (
                          <th key={i} style={{ textAlign: "left", padding: "14px 16px", color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={8} style={{ padding: "40px 16px", textAlign: "center", color: "#94a3b8" }}>
                            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", marginBottom: "8px" }} />
                            <div>Loading student data…</div>
                          </td>
                        </tr>
                      ) : filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: "40px 16px", textAlign: "center", color: "#94a3b8" }}>
                            <Users size={28} style={{ opacity: 0.3, marginBottom: "8px" }} />
                            <div style={{ fontWeight: "600" }}>No students found</div>
                          </td>
                        </tr>
                      ) : filteredStudents.map((student) => (
                        <tr key={student.id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.15s" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#fafbfc"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: student.is_blocked ? "linear-gradient(135deg, #ef4444, #dc2626)" : "linear-gradient(135deg, #7C3AED, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "14px", fontWeight: "800", flexShrink: 0 }}>
                              {student.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{student.username}</div>
                              <div style={{ fontSize: "11px", color: "#94a3b8" }}>{student.university_email}</div>
                            </div>
                          </td>
                          <td style={{ padding: "16px", color: "#475569", fontWeight: "600", fontSize: "13px" }}>{student.student_id}</td>
                          <td style={{ padding: "16px", color: "#64748b", fontSize: "13px" }}>{student.department}</td>
                          <td style={{ padding: "16px" }}>
                            <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: "8px", fontWeight: "700", fontSize: "13px" }}>
                              {student.login_count}
                            </span>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <input
                              type="number"
                              defaultValue={student.max_usage_limit || ""}
                              onBlur={(e) => setStudentLimit(student.id, e.target.value)}
                              placeholder="0 = ∞"
                              style={{ width: "80px", padding: "8px 10px", borderRadius: "10px", border: "1.5px solid #e2e8f0", color: "#0f172a", background: "#ffffff", fontSize: "13px", fontWeight: "600", textAlign: "center", outline: "none", fontFamily: "Inter, sans-serif" }}
                            />
                          </td>
                          <td style={{ padding: "16px", color: "#94a3b8", fontSize: "12px" }}>
                            {student.last_login ? new Date(student.last_login).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "5px",
                              padding: "5px 12px", borderRadius: "999px", fontWeight: "700", fontSize: "11px",
                              background: student.is_blocked ? "#fef2f2" : "#f0fdf4",
                              color: student.is_blocked ? "#991b1b" : "#166534",
                            }}>
                              {student.is_blocked ? <Ban size={12} /> : <CheckCircle2 size={12} />}
                              {student.is_blocked ? "Blocked" : "Active"}
                            </span>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={() => updateStudentControl(student.id, { is_blocked: !student.is_blocked })}
                                title={student.is_blocked ? "Unblock" : "Block"}
                                style={{
                                  width: "36px", height: "36px", borderRadius: "10px", border: "none", cursor: "pointer",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  background: student.is_blocked ? "#fef3c7" : "#fef2f2",
                                  color: student.is_blocked ? "#92400e" : "#ef4444",
                                  transition: "all 0.15s",
                                }}
                              >
                                {student.is_blocked ? <Unlock size={15} /> : <Lock size={15} />}
                              </button>
                              <button
                                onClick={() => openPermissions(student)}
                                title="Feature Permissions"
                                style={{
                                  width: "36px", height: "36px", borderRadius: "10px", border: "none", cursor: "pointer",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  background: "rgba(245,158,11,0.08)", color: "#f59e0b",
                                  transition: "all 0.15s",
                                }}
                              >
                                <Settings2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ─── JOB APPROVALS TAB ─── */}
          {activeTab === "jobs" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Job & Internship Approvals</h2>
                  <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0" }}>Review student-submitted opportunities before they go live</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["pending", "approved", "rejected"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setJobFilter(s)}
                      style={{
                        padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                        fontSize: 13, fontWeight: 700, fontFamily: "Inter, sans-serif",
                        background: jobFilter === s ? "#4F46E5" : "#f1f5f9",
                        color: jobFilter === s ? "white" : "#64748b",
                        textTransform: "capitalize",
                      }}
                    >
                      {s}
                      {s === "pending" && pendingJobCount > 0 && ` (${pendingJobCount})`}
                    </button>
                  ))}
                </div>
              </div>

              {jobsLoading ? (
                <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Loading job postings…</div>
              ) : adminJobs.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, background: "white", borderRadius: 18, border: "1px solid #f1f5f9" }}>
                  <Briefcase size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <div style={{ fontWeight: 600, color: "#64748b" }}>No {jobFilter} job postings</div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {adminJobs.map((job) => (
                    <div key={job.id} style={{ background: "white", borderRadius: 18, padding: "24px 28px", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 260 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                            <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: "#eef2ff", color: "#4F46E5", textTransform: "capitalize" }}>
                              {job.job_type?.replace("_", " ")}
                            </span>
                            <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: job.status === "pending" ? "#fffbeb" : job.status === "approved" ? "#ecfdf5" : "#fef2f2", color: job.status === "pending" ? "#d97706" : job.status === "approved" ? "#059669" : "#ef4444", textTransform: "capitalize" }}>
                              {job.status}
                            </span>
                          </div>
                          <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{job.title}</h3>
                          <p style={{ margin: "0 0 8px", fontSize: 14, color: "#64748b", fontWeight: 600 }}>{job.company_name} · {job.location}</p>
                          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Posted by <strong>{job.posted_by}</strong> · {new Date(job.created_at).toLocaleDateString()}</p>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <button onClick={() => setReviewJob(job)} style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#64748b", fontFamily: "Inter, sans-serif" }}>
                            <Eye size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />Review
                          </button>
                          {job.status === "pending" && (
                            <>
                              <button onClick={() => handleJobReview(job.id, "approve")} disabled={reviewing} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "Inter, sans-serif" }}>
                                Approve
                              </button>
                              <button onClick={() => { setReviewJob(job); setRejectReason(""); }} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#fef2f2", color: "#ef4444", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "Inter, sans-serif" }}>
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ─── SETTINGS TAB ─── */}
          {activeTab === "settings" && (
            <div style={{ maxWidth: "600px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px" }}>Settings</h2>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 28px" }}>Manage admin panel settings</p>

              <div style={{ background: "white", borderRadius: "18px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>Admin Account</div>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Logged in as <strong>{username}</strong></p>
                <div style={{ marginTop: "20px", padding: "16px", borderRadius: "12px", background: "#fefce8", border: "1px solid #fef08a" }}>
                  <div style={{ fontSize: "13px", color: "#854d0e", fontWeight: "600" }}>
                    💡 Tip: Use the Student Portal tab to manage individual student access and feature permissions.
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Job Review Modal */}
      {reviewJob && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={() => setReviewJob(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 640, maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{reviewJob.title}</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>{reviewJob.company_name} · by {reviewJob.posted_by}</p>
              </div>
              <button onClick={() => setReviewJob(null)} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={18} color="#64748b" />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12, marginBottom: 20 }}>
                {[
                  ["Type", reviewJob.job_type?.replace("_", " ")],
                  ["Location", reviewJob.location],
                  ["Work Mode", reviewJob.work_mode?.replace("_", " ")],
                  ["Salary", reviewJob.salary_range || "—"],
                  ["Deadline", reviewJob.deadline ? new Date(reviewJob.deadline).toLocaleDateString() : "—"],
                  ["Department", reviewJob.department || "All"],
                ].map(([k, v]) => (
                  <div key={k} style={{ padding: 12, borderRadius: 10, background: "#f8fafc" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 2, textTransform: "capitalize" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Description</div>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{reviewJob.description}</p>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Requirements</div>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{reviewJob.requirements}</p>
              </div>
              {(reviewJob.apply_link || reviewJob.apply_email) && (
                <div style={{ marginBottom: 16, fontSize: 13, color: "#64748b" }}>
                  Apply: {reviewJob.apply_link && <a href={reviewJob.apply_link} target="_blank" rel="noreferrer">{reviewJob.apply_link}</a>}
                  {reviewJob.apply_email && ` · ${reviewJob.apply_email}`}
                </div>
              )}
              {reviewJob.status === "pending" && (
                <div style={{ marginTop: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>Rejection reason (if rejecting)</label>
                  <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Optional feedback for the poster..." rows={3} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "Inter, sans-serif", resize: "vertical", boxSizing: "border-box" }} />
                </div>
              )}
            </div>
            {reviewJob.status === "pending" && (
              <div style={{ padding: "20px 28px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button onClick={() => setReviewJob(null)} style={{ padding: "12px 24px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Close</button>
                <button onClick={() => handleJobReview(reviewJob.id, "reject")} disabled={reviewing} style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "#fef2f2", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Reject</button>
                <button onClick={() => handleJobReview(reviewJob.id, "approve")} disabled={reviewing} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "white", fontWeight: 800, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>{reviewing ? "Processing…" : "Approve & Publish"}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {permModalStudent && (
        <PermissionModal
          student={permModalStudent}
          permissions={permModalData}
          onClose={() => setPermModalStudent(null)}
          onSave={savePermissions}
        />
      )}
    </div>
  );
}
