import { useState, useEffect, useMemo } from "react";
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  Search,
  X,
  Plus,
  Globe,
  Users,
  TrendingUp,
  Laptop,
  ExternalLink,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle2,
  Hourglass,
  XCircle,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useLanguage, useTheme, useBreakpoint } from "../hooks";
import { autoFillGrid, filterBarGrid, formGridCols, formGridCols3, heroTitleSize, pageShellPadding, statsAutoGrid } from "../utils/responsiveLayout";
import ThemeLanguageSwitcher from "../components/ThemeLanguageSwitcher";
import { getThemeColors } from "../utils/themeColors";
import toast from "react-hot-toast";

const ACCENT = "#059669";
const ACCENT_TEAL = "#0d9488";
const ACCENT_INDIGO = "#4F46E5";

const DEPARTMENTS = ["CSE", "EEE", "BBA", "English", "Civil", "Architecture", "Law"];
const JOB_TYPES = ["internship", "full_time", "part_time", "freelance"];
const WORK_MODES = ["on_site", "remote", "hybrid"];

const TYPE_COLORS = {
  internship: { bg: "#ecfdf5", color: "#059669", dark: "rgba(16,185,129,0.15)" },
  full_time: { bg: "#eef2ff", color: "#4F46E5", dark: "rgba(79,70,229,0.15)" },
  part_time: { bg: "#fff7ed", color: "#ea580c", dark: "rgba(234,88,12,0.15)" },
  freelance: { bg: "#fdf4ff", color: "#a21caf", dark: "rgba(162,28,175,0.15)" },
};

const selectStyle = (hasValue, colors, isDark) => ({
  width: "100%",
  padding: "13px 16px",
  border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
  borderRadius: 12,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  color: hasValue ? colors.text_primary : colors.text_muted,
  background: colors.bg_input,
  cursor: "pointer",
  appearance: "none",
  fontFamily: "Inter, sans-serif",
});

const emptyForm = {
  title: "",
  company_name: "",
  job_type: "",
  department: "",
  location: "",
  work_mode: "",
  salary_range: "",
  deadline: "",
  description: "",
  requirements: "",
  apply_link: "",
  apply_email: "",
  contact_phone: "",
};

export default function JobsBoard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = getThemeColors(theme);
  const isDark = theme === "dark";
  const bp = useBreakpoint();

  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("browse");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showPost, setShowPost] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const fetchJobs = async () => {
    try {
      const [approvedRes, mineRes] = await Promise.all([
        api.get("jobs/"),
        api.get("jobs/mine/"),
      ]);
      setJobs(approvedRes.data);
      setMyJobs(mineRes.data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      toast.error(t("messages.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const stats = useMemo(() => ({
    total: jobs.length,
    internships: jobs.filter((j) => j.job_type === "internship").length,
    companies: new Set(jobs.map((j) => j.company_name)).size,
    remote: jobs.filter((j) => j.work_mode === "remote" || j.work_mode === "hybrid").length,
  }), [jobs]);

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [j.title, j.company_name, j.location].some((v) => v?.toLowerCase().includes(q));
    const matchType = !filterType || j.job_type === filterType;
    const matchDept = !filterDept || !j.department || j.department === filterDept;
    const matchMode = !filterMode || j.work_mode === filterMode;
    return matchSearch && matchType && matchDept && matchMode;
  });

  const handleSubmit = async () => {
    if (!form.title || !form.company_name || !form.job_type || !form.location || !form.work_mode || !form.description || !form.requirements) {
      toast.error(t("messages.requiredFields"));
      return;
    }
    if (!form.apply_link && !form.apply_email) {
      toast.error(t("messages.requiredFields"));
      return;
    }

    setSubmitting(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, value]) => value !== "" && value != null)
      );
      await api.post("jobs/", payload);
      toast.success(t("jobs.pendingMessage"));
      setShowPost(false);
      setForm(emptyForm);
      fetchJobs();
      setActiveTab("my");
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData
        ? typeof errData === "string"
          ? errData
          : Object.entries(errData)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join("\n")
        : t("messages.uploadFailed");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabel = (type) => t(`jobs.types.${type}`) || type;
  const modeLabel = (mode) => t(`jobs.modes.${mode}`) || mode;
  const statusLabel = (status) => t(`jobs.status.${status}`) || status;

  const StatusBadge = ({ status }) => {
    const cfg = {
      pending: { icon: Hourglass, color: "#f59e0b", bg: isDark ? "rgba(245,158,11,0.12)" : "#fffbeb" },
      approved: { icon: CheckCircle2, color: "#059669", bg: isDark ? "rgba(16,185,129,0.12)" : "#ecfdf5" },
      rejected: { icon: XCircle, color: "#ef4444", bg: isDark ? "rgba(239,68,68,0.12)" : "#fef2f2" },
    }[status] || { icon: Hourglass, color: "#f59e0b", bg: isDark ? "rgba(245,158,11,0.12)" : "#fffbeb" };
    const Icon = cfg.icon;
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
        <Icon size={12} /> {statusLabel(status)}
      </span>
    );
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
    borderRadius: 10,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    color: colors.text_primary,
    background: colors.bg_input,
    fontFamily: "Inter, sans-serif",
  };

  if (selectedJob) {
    const tc = TYPE_COLORS[selectedJob.job_type] || TYPE_COLORS.internship;
    return (
      <div style={{ minHeight: "100vh", background: isDark ? "#0b1120" : "#f0fdf4", padding: "36px 24px", fontFamily: "Inter, sans-serif" }}>
        <ThemeLanguageSwitcher />
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <button onClick={() => setSelectedJob(null)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: ACCENT, fontSize: 15, fontWeight: 600, marginBottom: 24, padding: 0 }}>
            <ArrowLeft size={18} /> {t("common.back")}
          </button>

          <div style={{ background: colors.bg_card, borderRadius: 24, overflow: "hidden", border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#d1fae5"}`, boxShadow: `0 12px 40px rgba(5,150,105,${isDark ? "0.12" : "0.08"})` }}>
            <div style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_TEAL})`, padding: "36px 40px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "white", flexShrink: 0 }}>
                  {selectedJob.company_name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ display: "inline-block", padding: "5px 12px", borderRadius: 8, background: "rgba(255,255,255,0.2)", color: "white", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
                    {typeLabel(selectedJob.job_type)}
                  </span>
                  <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 900, color: "white" }}>{selectedJob.title}</h1>
                  <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{selectedJob.company_name}</p>
                </div>
                {selectedJob.status && selectedJob.status !== "approved" && <StatusBadge status={selectedJob.status} />}
              </div>
            </div>

            <div style={{ padding: "32px 40px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
                {[
                  { icon: MapPin, label: t("jobs.location"), value: selectedJob.location },
                  { icon: Laptop, label: t("jobs.workMode"), value: modeLabel(selectedJob.work_mode) },
                  selectedJob.salary_range && { icon: TrendingUp, label: t("jobs.salary"), value: selectedJob.salary_range },
                  selectedJob.deadline && { icon: Clock, label: t("jobs.deadline"), value: new Date(selectedJob.deadline).toLocaleDateString() },
                  selectedJob.department && { icon: Building2, label: t("common.department"), value: selectedJob.department },
                ].filter(Boolean).map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: isDark ? "rgba(5,150,105,0.08)" : "#ecfdf5", border: `1px solid ${isDark ? "rgba(5,150,105,0.2)" : "#a7f3d0"}` }}>
                    <item.icon size={16} color={ACCENT} />
                    <div>
                      <div style={{ fontSize: 10, color: colors.text_muted, fontWeight: 600, textTransform: "uppercase" }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: colors.text_primary }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 800, color: colors.text_primary }}>{t("jobs.aboutRole")}</h3>
                <p style={{ margin: 0, fontSize: 14, color: colors.text_tertiary, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selectedJob.description}</p>
              </div>

              <div style={{ marginBottom: 28 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 800, color: colors.text_primary }}>{t("jobs.requirements")}</h3>
                <p style={{ margin: 0, fontSize: 14, color: colors.text_tertiary, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selectedJob.requirements}</p>
              </div>

              {selectedJob.status === "rejected" && selectedJob.rejection_reason && (
                <div style={{ marginBottom: 24, padding: 16, borderRadius: 12, background: isDark ? "rgba(239,68,68,0.08)" : "#fef2f2", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 4 }}>{t("jobs.rejectionReason")}</div>
                  <div style={{ fontSize: 13, color: colors.text_tertiary }}>{selectedJob.rejection_reason}</div>
                </div>
              )}

              {selectedJob.status === "approved" && (
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {selectedJob.apply_link && (
                    <a href={selectedJob.apply_link} target="_blank" rel="noreferrer" style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 20px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_TEAL})`, color: "white", borderRadius: 14, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                      <ExternalLink size={16} /> {t("jobs.applyNow")}
                    </a>
                  )}
                  {selectedJob.apply_email && (
                    <a href={`mailto:${selectedJob.apply_email}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", background: colors.bg_secondary, color: ACCENT_INDIGO, border: `1.5px solid ${ACCENT_INDIGO}`, borderRadius: 14, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                      <Mail size={16} /> {selectedJob.apply_email}
                    </a>
                  )}
                  {selectedJob.contact_phone && (
                    <a href={`tel:${selectedJob.contact_phone}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", background: colors.bg_secondary, color: colors.text_secondary, border: `1.5px solid ${colors.border_secondary}`, borderRadius: 14, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                      <Phone size={16} /> {selectedJob.contact_phone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const JobCard = ({ job, showStatus }) => {
    const tc = TYPE_COLORS[job.job_type] || TYPE_COLORS.internship;
    return (
      <div
        onClick={() => setSelectedJob(job)}
        style={{
          background: colors.bg_card,
          borderRadius: 18,
          border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#d1fae5"}`,
          padding: 22,
          cursor: "pointer",
          transition: "all 0.28s cubic-bezier(0.34,1.2,0.64,1)",
          boxShadow: `0 4px 16px rgba(0,0,0,${isDark ? "0.12" : "0.04"})`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = `0 20px 40px rgba(5,150,105,${isDark ? "0.2" : "0.12"})`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,${isDark ? "0.12" : "0.04"})`;
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: isDark ? tc.dark : tc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: tc.color, flexShrink: 0 }}>
            {job.company_name.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: isDark ? tc.dark : tc.bg, color: tc.color }}>
                {typeLabel(job.job_type)}
              </span>
              {showStatus && <StatusBadge status={job.status} />}
            </div>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: colors.text_primary }}>{job.title}</h3>
            <p style={{ margin: 0, fontSize: 13, color: colors.text_muted, fontWeight: 600 }}>{job.company_name}</p>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: colors.text_muted }}>
            <MapPin size={13} color={ACCENT} /> {job.location}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: colors.text_muted }}>
            <Globe size={13} color={ACCENT_TEAL} /> {modeLabel(job.work_mode)}
          </span>
          {job.salary_range && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: colors.text_muted }}>
              <TrendingUp size={13} color={ACCENT_INDIGO} /> {job.salary_range}
            </span>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${colors.border_secondary}` }}>
          <span style={{ fontSize: 11, color: colors.text_muted }}>
            {job.deadline ? `${t("jobs.deadline")}: ${new Date(job.deadline).toLocaleDateString()}` : t("jobs.viewDetails")}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>{t("jobs.viewDetails")} →</span>
        </div>
      </div>
    );
  };

  return (
    <div className="cc-page" style={{ minHeight: "100vh", background: isDark ? "#0b1120" : "#f0fdf4", padding: pageShellPadding(bp), fontFamily: "Inter, sans-serif", color: colors.text_primary }}>
      <ThemeLanguageSwitcher />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div className="cc-container" style={{ maxWidth: 1400, margin: "0 auto", paddingLeft: 0, paddingRight: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_TEAL})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(5,150,105,0.35)" }}>
                <Briefcase size={26} color="white" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: heroTitleSize(bp), fontWeight: 900, letterSpacing: "-0.8px", background: isDark ? "linear-gradient(135deg,#6ee7b7,#5eead4)" : `linear-gradient(135deg,${ACCENT},${ACCENT_TEAL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {t("jobs.title")}
                </h1>
                <p style={{ margin: "4px 0 0", fontSize: 14, color: colors.text_tertiary, display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={14} color={ACCENT} /> {t("jobs.subtitle")}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowPost(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 24px", background: `linear-gradient(135deg, ${ACCENT_INDIGO}, #6366f1)`, color: "white", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(79,70,229,0.35)", fontFamily: "Inter, sans-serif" }}
          >
            <Plus size={18} /> {t("jobs.postOpportunity")}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: statsAutoGrid(bp), gap: 16, marginBottom: 28 }}>
          {[
            { label: t("jobs.openRoles"), value: stats.total, icon: Briefcase, grad: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_TEAL})` },
            { label: t("jobs.internships"), value: stats.internships, icon: GraduationCap, grad: "linear-gradient(135deg, #4F46E5, #6366f1)" },
            { label: t("jobs.companies"), value: stats.companies, icon: Building2, grad: "linear-gradient(135deg, #0d9488, #14b8a6)" },
            { label: t("jobs.remoteFriendly"), value: stats.remote, icon: Laptop, grad: "linear-gradient(135deg, #0891b2, #06b6d4)" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ background: colors.bg_card, borderRadius: 18, padding: 22, display: "flex", alignItems: "center", gap: 16, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#d1fae5"}`, transition: "transform 0.3s" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div style={{ width: 50, height: 50, borderRadius: 14, background: s.grad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: colors.text_muted, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: isDark ? "rgba(255,255,255,0.04)" : "#ecfdf5", padding: 6, borderRadius: 14, width: "fit-content", maxWidth: "100%", flexWrap: "wrap" }}>
          {[
            { key: "browse", label: t("jobs.browseTab"), icon: Briefcase },
            { key: "my", label: t("jobs.myTab"), icon: Users },
          ].map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "Inter, sans-serif", background: active ? (isDark ? ACCENT : "white") : "transparent", color: active ? (isDark ? "white" : ACCENT) : colors.text_muted, boxShadow: active ? "0 4px 12px rgba(5,150,105,0.2)" : "none", transition: "all 0.2s" }}
              >
                <tab.icon size={16} /> {tab.label}
                {tab.key === "my" && myJobs.filter((j) => j.status === "pending").length > 0 && (
                  <span style={{ background: "#f59e0b", color: "white", fontSize: 10, padding: "2px 6px", borderRadius: 10, fontWeight: 800 }}>
                    {myJobs.filter((j) => j.status === "pending").length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "browse" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: filterBarGrid(bp, 5), gap: 12, marginBottom: 24, alignItems: "end" }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: colors.text_muted, marginBottom: 6 }}>{t("common.search")}</label>
                <div style={{ position: "relative" }}>
                  <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: colors.text_muted }} />
                  <input type="text" placeholder={t("jobs.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 44 }} />
                </div>
              </div>
              <div style={{ minWidth: 140 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: colors.text_muted, marginBottom: 6 }}>{t("jobs.typeLabel")}</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle(filterType, colors, isDark)}>
                  <option value="">{t("jobs.allTypes")}</option>
                  {JOB_TYPES.map((type) => <option key={type} value={type}>{typeLabel(type)}</option>)}
                </select>
              </div>
              <div style={{ minWidth: 140 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: colors.text_muted, marginBottom: 6 }}>{t("common.department")}</label>
                <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={selectStyle(filterDept, colors, isDark)}>
                  <option value="">{t("jobs.allDepartments")}</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ minWidth: 130 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: colors.text_muted, marginBottom: 6 }}>{t("jobs.workMode")}</label>
                <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} style={selectStyle(filterMode, colors, isDark)}>
                  <option value="">{t("jobs.allModes")}</option>
                  {WORK_MODES.map((m) => <option key={m} value={m}>{modeLabel(m)}</option>)}
                </select>
              </div>
              <button onClick={() => { setSearch(""); setFilterType(""); setFilterDept(""); setFilterMode(""); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "13px 16px", background: colors.bg_secondary, border: `1.5px solid ${colors.border_secondary}`, borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, color: colors.text_secondary, height: 48, fontFamily: "Inter, sans-serif" }}>
                <X size={14} /> {t("jobs.clearFilters")}
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 80 }}>
                <div style={{ width: 44, height: 44, border: `3px solid ${colors.border_secondary}`, borderTop: `3px solid ${ACCENT}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: 80, background: colors.bg_card, borderRadius: 20, border: `1.5px dashed ${isDark ? "rgba(5,150,105,0.3)" : "#a7f3d0"}` }}>
                <Briefcase size={48} style={{ color: colors.text_muted, opacity: 0.4, marginBottom: 12 }} />
                <p style={{ color: colors.text_muted }}>{t("jobs.noJobs")}</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: autoFillGrid(320, bp), gap: 20 }}>
                {filtered.map((job) => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </>
        )}

        {activeTab === "my" && (
          <div>
            {myJobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, background: colors.bg_card, borderRadius: 20, border: `1.5px dashed ${colors.border_secondary}` }}>
                <p style={{ color: colors.text_muted, marginBottom: 16 }}>{t("jobs.noJobs")}</p>
                <button onClick={() => setShowPost(true)} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_TEAL})`, color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                  {t("jobs.postOpportunity")}
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: autoFillGrid(320, bp), gap: 20 }}>
                {myJobs.map((job) => <JobCard key={job.id} job={job} showStatus />)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Modal */}
      {showPost && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(6px)", padding: 20 }} onClick={(e) => e.target === e.currentTarget && setShowPost(false)}>
          <div className="cc-modal" style={{ width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", background: colors.bg_card, borderRadius: 24, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#d1fae5"}`, boxShadow: "0 32px 80px rgba(5,150,105,0.15)" }}>
            <div style={{ background: `linear-gradient(135deg, ${ACCENT_INDIGO}, #6366f1)`, padding: "28px 32px", position: "relative" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "white" }}>{t("jobs.postOpportunity")}</h2>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{t("jobs.postSubtitle")}</p>
              <button onClick={() => setShowPost(false)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "28px 32px", display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.text_muted, display: "block", marginBottom: 6 }}>{t("jobs.titleLabel")}</label>
                  <input style={inputStyle} placeholder={t("jobs.titlePlaceholder")} value={form.title} onChange={(e) => handleChange("title", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.text_muted, display: "block", marginBottom: 6 }}>{t("jobs.companyLabel")}</label>
                  <input style={inputStyle} placeholder={t("jobs.companyPlaceholder")} value={form.company_name} onChange={(e) => handleChange("company_name", e.target.value)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: formGridCols3(bp), gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.text_muted, display: "block", marginBottom: 6 }}>{t("jobs.typeLabel")}</label>
                  <select style={selectStyle(form.job_type, colors, isDark)} value={form.job_type} onChange={(e) => handleChange("job_type", e.target.value)}>
                    <option value="">{t("jobs.selectType")}</option>
                    {JOB_TYPES.map((type) => <option key={type} value={type}>{typeLabel(type)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.text_muted, display: "block", marginBottom: 6 }}>{t("jobs.deptLabel")}</label>
                  <select style={selectStyle(form.department, colors, isDark)} value={form.department} onChange={(e) => handleChange("department", e.target.value)}>
                    <option value="">{t("jobs.selectDept")}</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.text_muted, display: "block", marginBottom: 6 }}>{t("jobs.modeLabel")}</label>
                  <select style={selectStyle(form.work_mode, colors, isDark)} value={form.work_mode} onChange={(e) => handleChange("work_mode", e.target.value)}>
                    <option value="">{t("jobs.selectMode")}</option>
                    {WORK_MODES.map((m) => <option key={m} value={m}>{modeLabel(m)}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.text_muted, display: "block", marginBottom: 6 }}>{t("jobs.locationLabel")}</label>
                  <input style={inputStyle} placeholder={t("jobs.locationPlaceholder")} value={form.location} onChange={(e) => handleChange("location", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.text_muted, display: "block", marginBottom: 6 }}>{t("jobs.salaryLabel")}</label>
                  <input style={inputStyle} placeholder={t("jobs.salaryPlaceholder")} value={form.salary_range} onChange={(e) => handleChange("salary_range", e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.text_muted, display: "block", marginBottom: 6 }}>{t("jobs.deadlineLabel")}</label>
                <input type="date" style={inputStyle} value={form.deadline} onChange={(e) => handleChange("deadline", e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.text_muted, display: "block", marginBottom: 6 }}>{t("jobs.descLabel")}</label>
                <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} placeholder={t("jobs.descPlaceholder")} value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.text_muted, display: "block", marginBottom: 6 }}>{t("jobs.reqLabel")}</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} placeholder={t("jobs.reqPlaceholder")} value={form.requirements} onChange={(e) => handleChange("requirements", e.target.value)} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.text_muted, display: "block", marginBottom: 6 }}>{t("jobs.applyLinkLabel")}</label>
                  <input style={inputStyle} placeholder="https://..." value={form.apply_link} onChange={(e) => handleChange("apply_link", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.text_muted, display: "block", marginBottom: 6 }}>{t("jobs.applyEmailLabel")}</label>
                  <input style={inputStyle} placeholder="hr@company.com" value={form.apply_email} onChange={(e) => handleChange("apply_email", e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.text_muted, display: "block", marginBottom: 6 }}>{t("jobs.contactLabel")}</label>
                <input style={inputStyle} value={form.contact_phone} onChange={(e) => handleChange("contact_phone", e.target.value)} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12, marginTop: 8 }}>
                <button onClick={() => setShowPost(false)} style={{ padding: "12px 20px", background: colors.bg_secondary, border: `1.5px solid ${colors.border_secondary}`, borderRadius: 12, fontWeight: 700, cursor: "pointer", color: colors.text_secondary, fontFamily: "Inter, sans-serif" }}>
                  {t("common.cancel")}
                </button>
                <button onClick={handleSubmit} disabled={submitting} style={{ padding: "12px 20px", background: submitting ? "#86efac" : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_TEAL})`, color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: submitting ? "wait" : "pointer", fontFamily: "Inter, sans-serif" }}>
                  {submitting ? t("messages.uploading") : t("jobs.submitForReview")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
