import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Download,
  Eye,
  Search,
  ArrowLeft,
  X,
  FileText,
  Plus,
  Layers,
  GraduationCap,
  Users,
  Sparkles,
} from "lucide-react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useLanguage, useTheme, useBreakpoint } from "../hooks";
import { autoFillGrid, filterBarGrid, formGridCols, heroTitleSize, modalPadding, pageShellPadding, sectionTitleSize, statsAutoGrid } from "../utils/responsiveLayout";
import ThemeLanguageSwitcher from "../components/ThemeLanguageSwitcher";
import { getThemeColors } from "../utils/themeColors";
import toast from "react-hot-toast";

const ACCENT = "#7C3AED";
const ACCENT_PINK = "#ec4899";
const DEPARTMENTS = ["CSE", "EEE", "BBA", "English", "Civil", "Architecture", "Law"];
const INTAKES = Array.from({ length: 171 }, (_, i) => String(i + 30));

const DEPT_COLORS = {
  CSE: "#7C3AED",
  EEE: "#2563EB",
  BBA: "#059669",
  English: "#db2777",
  Civil: "#d97706",
  Architecture: "#0891b2",
  Law: "#4f46e5",
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
  transition: "all 0.3s ease",
});

export default function NotesRepository() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = getThemeColors(theme);
  const isDark = theme === "dark";
  const bp = useBreakpoint();

  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterIntake, setFilterIntake] = useState("");
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    subject: "",
    department: "",
    intake: "",
    description: "",
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const username = localStorage.getItem("username") || t("common.student");

  const handleFormChange = (field, value) =>
    setUploadForm((prev) => ({ ...prev, [field]: value }));

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file) {
      setUploadFile(file);
      toast.success(t("messages.fileSelected"));
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await api.get("notes/");
      setNotes(res.data);
    } catch (error) {
      if (error.response?.status === 401) navigate("/login");
      toast.error(t("messages.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      toast.error(t("messages.selectFile"));
      return;
    }

    if (!uploadForm.title || !uploadForm.subject || !uploadForm.department || !uploadForm.intake) {
      toast.error(t("messages.requiredFields"));
      return;
    }

    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    Object.entries(uploadForm).forEach(([k, v]) => formData.append(k, v));
    formData.append("pdf_file", uploadFile);

    try {
      await api.post("notes/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("messages.uploadSuccess"));
      resetModal();
      fetchNotes();
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error(t("messages.sessionExpired"));
        navigate("/login");
      } else {
        const errData = err.response?.data;
        const msg = errData
          ? Object.entries(errData).map(([k, v]) => `${k}: ${v}`).join("\n")
          : t("messages.uploadFailed");
        setUploadError(msg);
        toast.error(t("messages.uploadFailed"));
      }
    } finally {
      setUploading(false);
    }
  };

  const resetModal = () => {
    setShowUpload(false);
    setUploadFile(null);
    setUploadError(null);
    setUploadForm({ title: "", subject: "", department: "", intake: "", description: "" });
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const stats = useMemo(() => ({
    total: notes.length,
    departments: new Set(notes.map((n) => n.department)).size,
    subjects: new Set(notes.map((n) => n.subject)).size,
    contributors: new Set(notes.map((n) => n.uploaded_by)).size,
  }), [notes]);

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      n.subject?.toLowerCase().includes(q) ||
      n.title?.toLowerCase().includes(q) ||
      n.department?.toLowerCase().includes(q) ||
      n.intake?.toLowerCase().includes(q);
    const matchesDept = !filterDept || n.department === filterDept;
    const matchesIntake = !filterIntake || String(n.intake) === filterIntake;
    return matchesSearch && matchesDept && matchesIntake;
  });

  const getDeptColor = (dept) => DEPT_COLORS[dept] || ACCENT;

  const inputStyle = {
    width: "100%",
    padding: "13px 16px",
    border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
    borderRadius: 12,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    color: colors.text_primary,
    background: colors.bg_input,
    fontFamily: "Inter, sans-serif",
    transition: "all 0.3s ease",
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    color: colors.text_secondary,
    marginBottom: 8,
  };

  if (selectedNote) {
    const deptColor = getDeptColor(selectedNote.department);
    return (
      <div className="cc-page" style={{ minHeight: "100vh", background: isDark ? "#0b1120" : "#faf5ff", padding: pageShellPadding(bp), fontFamily: "Inter, sans-serif" }}>
        <ThemeLanguageSwitcher />
        <div className="cc-container" style={{ maxWidth: 960, margin: "0 auto", paddingLeft: 0, paddingRight: 0 }}>
          <button
            onClick={() => setSelectedNote(null)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: ACCENT, fontSize: 15, fontWeight: 600, marginBottom: 24, padding: 0, fontFamily: "Inter, sans-serif" }}
          >
            <ArrowLeft size={18} /> {t("common.back")}
          </button>

          <div style={{ background: colors.bg_card, borderRadius: 24, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f3e8ff"}`, overflow: "hidden", boxShadow: `0 8px 32px rgba(124,58,237,${isDark ? "0.15" : "0.08"})` }}>
            <div style={{ background: `linear-gradient(135deg, ${deptColor}, ${ACCENT_PINK})`, padding: bp.isMobile ? "24px 20px" : "36px 40px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%", transform: "translate(40%, -40%)" }} />
              <div style={{ position: "relative" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", background: "rgba(255,255,255,0.2)", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "white", marginBottom: 16 }}>
                  <Sparkles size={14} /> {selectedNote.subject}
                </span>
                <h1 style={{ margin: "0 0 10px", fontSize: sectionTitleSize(bp), fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>
                  {selectedNote.title}
                </h1>
                <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
                  {selectedNote.department} • {t("notes.intakeLabel", { value: selectedNote.intake })}
                </p>
              </div>
            </div>

            <div style={{ padding: modalPadding(bp) }}>
              <div style={{ display: "grid", gridTemplateColumns: statsAutoGrid(bp, 140), gap: 14, marginBottom: 28 }}>
                {[
                  { label: t("notes.subjectBadge"), value: selectedNote.subject },
                  { label: t("common.department"), value: selectedNote.department },
                  { label: t("common.intake"), value: selectedNote.intake },
                  { label: t("notes.uploadedByLabel"), value: selectedNote.uploaded_by || username },
                  { label: t("notes.uploadDate"), value: new Date(selectedNote.created_at).toLocaleDateString() },
                ].map((item, i) => (
                  <div key={i} style={{ background: isDark ? "rgba(124,58,237,0.08)" : "#faf5ff", padding: 16, borderRadius: 14, border: `1px solid ${isDark ? "rgba(124,58,237,0.2)" : "#ede9fe"}` }}>
                    <div style={{ fontSize: 11, color: colors.text_muted, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>{item.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: colors.text_primary }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {selectedNote.description && (
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: colors.text_primary }}>{t("notes.description")}</h3>
                  <p style={{ margin: 0, fontSize: 14, color: colors.text_tertiary, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selectedNote.description}</p>
                </div>
              )}

              <div style={{ display: "flex", gap: 12 }}>
                {selectedNote.pdf_file && (
                  <>
                    <button
                      onClick={() => window.open(selectedNote.pdf_file, "_blank")}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 20px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})`, color: "white", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.3s" }}
                    >
                      <Eye size={16} /> {t("notes.viewPdf")}
                    </button>
                    <a
                      href={selectedNote.pdf_file}
                      download
                      target="_blank"
                      rel="noreferrer"
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 20px", background: colors.bg_secondary, color: ACCENT, border: `1.5px solid ${ACCENT}`, borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "none", fontFamily: "Inter, sans-serif" }}
                    >
                      <Download size={16} /> {t("common.download")}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cc-page" style={{ minHeight: "100vh", background: isDark ? "#0b1120" : "#faf5ff", padding: pageShellPadding(bp), fontFamily: "Inter, sans-serif", color: colors.text_primary, transition: "all 0.35s ease" }}>
      <ThemeLanguageSwitcher />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: ${colors.text_muted} !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>

      <div className="cc-container" style={{ maxWidth: 1400, margin: "0 auto", paddingLeft: 0, paddingRight: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px rgba(124,58,237,0.35)` }}>
                <BookOpen size={24} color="white" />
              </div>
              <h1 style={{ margin: 0, fontSize: heroTitleSize(bp), fontWeight: 900, letterSpacing: "-1px", background: isDark ? "linear-gradient(135deg,#c4b5fd,#f472b6)" : `linear-gradient(135deg,${ACCENT},${ACCENT_PINK})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {t("notes.title")}
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 15, color: colors.text_tertiary, paddingLeft: bp.isMobile ? 0 : 60 }}>{t("notes.subtitle")}</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 24px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})`, color: "white", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif", boxShadow: `0 8px 24px rgba(124,58,237,0.35)`, transition: "all 0.3s" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <Plus size={18} /> {t("notes.uploadNotes")}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: statsAutoGrid(bp), gap: 16, marginBottom: 32 }}>
          {[
            { label: t("notes.totalNotes"), value: stats.total, icon: BookOpen, grad: `linear-gradient(135deg, ${ACCENT}, #9333ea)` },
            { label: t("notes.departmentsCovered"), value: stats.departments, icon: Layers, grad: "linear-gradient(135deg, #2563EB, #0891b2)" },
            { label: t("notes.uniqueSubjects"), value: stats.subjects, icon: GraduationCap, grad: `linear-gradient(135deg, ${ACCENT_PINK}, #f97316)` },
            { label: t("notes.contributors"), value: stats.contributors, icon: Users, grad: "linear-gradient(135deg, #059669, #10b981)" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                style={{ background: colors.bg_card, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#ede9fe"}`, borderRadius: 18, padding: 22, display: "flex", alignItems: "center", gap: 16, boxShadow: `0 4px 16px rgba(124,58,237,${isDark ? "0.1" : "0.06"})`, transition: "all 0.3s" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: stat.grad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: colors.text_primary, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: colors.text_muted, marginTop: 4, fontWeight: 600 }}>{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div style={{ display: "grid", gridTemplateColumns: filterBarGrid(bp, 3), gap: 12, marginBottom: 28, alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: colors.text_muted, marginBottom: 6 }}>{t("common.search")}</label>
            <div style={{ position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: colors.text_muted }} />
              <input
                type="text"
                placeholder={t("notes.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 44, borderRadius: 12 }}
                onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                onBlur={(e) => (e.target.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb")}
              />
            </div>
          </div>
          <div style={{ minWidth: 160 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: colors.text_muted, marginBottom: 6 }}>{t("common.department")}</label>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={selectStyle(filterDept, colors, isDark)}>
              <option value="">{t("notes.allDepartments")}</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ minWidth: 130 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: colors.text_muted, marginBottom: 6 }}>{t("common.intake")}</label>
            <select value={filterIntake} onChange={(e) => setFilterIntake(e.target.value)} style={selectStyle(filterIntake, colors, isDark)}>
              <option value="">{t("notes.allIntakes")}</option>
              {INTAKES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <button
            onClick={() => { setSearch(""); setFilterDept(""); setFilterIntake(""); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "13px 16px", background: colors.bg_secondary, border: `1.5px solid ${colors.border_secondary}`, borderRadius: 12, color: colors.text_secondary, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "Inter, sans-serif", height: 48 }}
          >
            <X size={14} /> {t("notes.clearFilters")}
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 44, height: 44, border: `3px solid ${colors.border_secondary}`, borderTop: `3px solid ${ACCENT}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: colors.text_muted, fontSize: 15 }}>{t("messages.loadingNotes")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: colors.bg_card, borderRadius: 20, border: `1.5px dashed ${isDark ? "rgba(124,58,237,0.3)" : "#ddd6fe"}` }}>
            <BookOpen size={52} style={{ color: colors.text_muted, marginBottom: 16, opacity: 0.5 }} />
            <p style={{ color: colors.text_muted, fontSize: 16, fontWeight: 500 }}>{t("notes.noNotes")}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: autoFillGrid(300, bp), gap: 20 }}>
            {filtered.map((note) => {
              const deptColor = getDeptColor(note.department);
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  style={{
                    background: colors.bg_card,
                    borderRadius: 18,
                    border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f3e8ff"}`,
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    transition: "all 0.28s cubic-bezier(0.34,1.2,0.64,1)",
                    boxShadow: `0 4px 16px rgba(0,0,0,${isDark ? "0.15" : "0.04"})`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = `0 20px 40px rgba(124,58,237,${isDark ? "0.25" : "0.15"})`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,${isDark ? "0.15" : "0.04"})`;
                  }}
                >
                  {/* Book spine */}
                  <div style={{ width: 8, flexShrink: 0, background: `linear-gradient(180deg, ${deptColor}, ${ACCENT_PINK})` }} />

                  <div style={{ flex: 1, padding: "20px 22px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${deptColor}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileText size={20} color={deptColor} />
                      </div>
                      <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: `${deptColor}15`, color: deptColor }}>
                        {note.department}
                      </span>
                    </div>

                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: isDark ? "rgba(236,72,153,0.12)" : "#fce7f3", color: ACCENT_PINK, marginBottom: 8 }}>
                      {note.subject}
                    </span>

                    <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: colors.text_primary, lineHeight: 1.35 }}>
                      {note.title}
                    </h3>

                    {note.description && (
                      <p style={{ margin: "0 0 12px", fontSize: 12, color: colors.text_muted, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {note.description}
                      </p>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${colors.border_secondary}` }}>
                      <span style={{ fontSize: 11, color: colors.text_muted, fontWeight: 600 }}>
                        {t("notes.intakeLabel", { value: note.intake })}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (note.pdf_file) window.open(note.pdf_file, "_blank");
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})`, color: "white", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
                      >
                        <Download size={12} /> {t("common.download")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999, backdropFilter: "blur(6px)", padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) resetModal(); }}
        >
          <div className="cc-modal" style={{ width: "100%", maxWidth: 520, background: colors.bg_card, borderRadius: 24, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#ede9fe"}`, overflow: "hidden", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(124,58,237,0.2)" }}>
            <div style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})`, padding: "28px 32px", position: "relative" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "white" }}>{t("notes.uploadNotes")}</h2>
              <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{t("notes.uploadSubtitle")}</p>
              <button onClick={resetModal} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "28px 32px" }}>
              {uploadError && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: "#ef4444", whiteSpace: "pre-line" }}>
                  {uploadError}
                </div>
              )}

              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
                  <div>
                    <label style={labelStyle}>{t("notes.titleLabel")}</label>
                    <input type="text" placeholder={t("notes.titlePlaceholder")} value={uploadForm.title} onChange={(e) => handleFormChange("title", e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t("notes.subjectLabel")}</label>
                    <input type="text" placeholder={t("notes.subjectPlaceholder")} value={uploadForm.subject} onChange={(e) => handleFormChange("subject", e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
                  <div>
                    <label style={labelStyle}>{t("notes.departmentRequired")}</label>
                    <select value={uploadForm.department} onChange={(e) => handleFormChange("department", e.target.value)} style={selectStyle(uploadForm.department, colors, isDark)}>
                      <option value="">{t("notes.selectDepartment")}</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>{t("notes.intakeRequired")}</label>
                    <select value={uploadForm.intake} onChange={(e) => handleFormChange("intake", e.target.value)} style={selectStyle(uploadForm.intake, colors, isDark)}>
                      <option value="">{t("notes.selectIntake")}</option>
                      {INTAKES.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{t("notes.description")}</label>
                  <textarea placeholder={t("notes.descriptionPlaceholder")} value={uploadForm.description} onChange={(e) => handleFormChange("description", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => document.getElementById("notesFileInput")?.click()}
                  style={{ border: `2px dashed ${dragOver ? ACCENT : uploadFile ? "#10b981" : colors.border_secondary}`, borderRadius: 14, padding: 28, textAlign: "center", cursor: "pointer", background: dragOver ? `${ACCENT}08` : uploadFile ? "rgba(16,185,129,0.06)" : colors.bg_secondary, transition: "all 0.2s" }}
                >
                  <input type="file" id="notesFileInput" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ display: "none" }} onChange={handleFileDrop} />
                  {uploadFile ? (
                    <>
                      <FileText size={36} style={{ color: "#10b981", marginBottom: 8 }} />
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#10b981" }}>{uploadFile.name}</div>
                      <div style={{ fontSize: 12, color: colors.text_muted, marginTop: 4 }}>{t("notes.clickToChange")}</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: colors.text_secondary }}>{t("notes.clickToUpload")}</div>
                      <div style={{ fontSize: 12, color: colors.text_muted, marginTop: 6 }}>{t("notes.fileTypes")}</div>
                    </>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
                  <button onClick={resetModal} style={{ padding: "12px 20px", background: colors.bg_secondary, border: `1.5px solid ${colors.border_secondary}`, borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", color: colors.text_secondary, fontFamily: "Inter, sans-serif" }}>
                    {t("common.cancel")}
                  </button>
                  <button onClick={handleUploadSubmit} disabled={uploading} style={{ padding: "12px 20px", background: uploading ? "#a78bfa" : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})`, color: "white", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: uploading ? "wait" : "pointer", fontFamily: "Inter, sans-serif", opacity: uploading ? 0.7 : 1 }}>
                    {uploading ? t("messages.uploading") : t("notes.uploadNotes")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
