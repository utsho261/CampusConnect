import { useState, useEffect } from "react";
import {
  FileQuestion,
  Edit,
  Trash2,
  Download,
  Eye,
  Search,
  ArrowLeft,
  ChevronDown,
  X,
  Plus,
  Filter,
  BarChart3,
  Zap,
} from "lucide-react";
import api from "../services/api";
import { cachedGet, invalidateCache } from "../services/apiCache";
import { useNavigate } from "react-router-dom";
import { useLanguage, useTheme, useBreakpoint } from "../hooks";
import { autoFillGrid, filterBarGrid, formGridCols, heroTitleSize, modalPadding, pageShellPadding, sectionTitleSize, statsAutoGrid } from "../utils/responsiveLayout";
import ThemeLanguageSwitcher from "../components/ThemeLanguageSwitcher";
import { getThemeColors } from "../utils/themeColors";
import toast from "react-hot-toast";
import FloatingBackButton from "../components/FloatingBackButton";
import { downloadFile } from "../utils/downloadHelper";

const ACCENT = "#2563EB";
const DEPARTMENTS = ["CSE", "EEE", "BBA", "English", "Civil", "Architecture", "Law"];
const COURSES = ["Programming", "Database", "DSA", "Web Dev", "Mobile Dev", "AI/ML", "Networks"];
const INTAKES = Array.from({ length: 171 }, (_, i) => String(i + 30));

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

export default function CTQuestionBank() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const colors = getThemeColors(theme);
  const isDark = theme === "dark";
  const bp = useBreakpoint();

  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterIntake, setFilterIntake] = useState("");
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    course: "",
    department: "",
    intake: "",
    totalQuestions: "",
    difficulty: "medium",
    description: "",
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const username = localStorage.getItem("username") || t("common.student");

  const handleFormChange = (field, value) =>
    setUploadForm((prev) => ({ ...prev, [field]: value }));

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadFile(file);
      toast.success(t("messages.fileSelected"));
    } else {
      toast.error(t("messages.onlyPdfAllowed"));
    }
  };

  const fetchQuestions = async () => {
    const hasCached = !!localStorage.getItem('cc_cache_ct_questions');
    try {
      const freshData = await cachedGet(api, "ct-questions/", {
        cacheKey: "ct_questions",
        ttl: 3 * 60 * 1000,
        onCacheHit: (d) => {
          setQuestions(d);
          setStats({ total: d.length, easy: d.filter(q => q.difficulty === 'easy').length, medium: d.filter(q => q.difficulty === 'medium').length, hard: d.filter(q => q.difficulty === 'hard').length });
          setLoading(false);
        },
      });
      if (freshData) {
        setQuestions(freshData);
        setStats({ total: freshData.length, easy: freshData.filter(q => q.difficulty === 'easy').length, medium: freshData.filter(q => q.difficulty === 'medium').length, hard: freshData.filter(q => q.difficulty === 'hard').length });
      }
    } catch (error) {
      if (error.response?.status === 401) navigate("/login");
      console.error(error);
      if (!hasCached) toast.error(t("messages.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async () => {
    if (editQuestionId) {
      handleEditSubmit();
      return;
    }

    if (!uploadFile) {
      toast.error(t("messages.selectFile"));
      return;
    }

    if (
      !uploadForm.title ||
      !uploadForm.course ||
      !uploadForm.department ||
      !uploadForm.intake ||
      !uploadForm.totalQuestions
    ) {
      toast.error(t("messages.requiredFields"));
      return;
    }

    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("title", uploadForm.title);
    formData.append("course", uploadForm.course);
    formData.append("department", uploadForm.department);
    formData.append("intake", uploadForm.intake);
    formData.append("total_questions", uploadForm.totalQuestions);
    formData.append("difficulty", uploadForm.difficulty);
    formData.append("description", uploadForm.description);
    formData.append("pdf_file", uploadFile);

    try {
      await api.post("ct-questions/", formData);
      toast.success(`${t("messages.uploadSuccess")} +10 points earned!`);
      resetModal();
      invalidateCache("ct_questions");
      fetchQuestions();
    } catch (error) {
      const errData = error.response?.data;
      let msg = t("messages.uploadFailed");
      if (typeof errData === 'string') {
        msg = errData;
      } else if (errData && typeof errData === 'object') {
        msg = Object.entries(errData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join("\n");
      }
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (
      !uploadForm.title ||
      !uploadForm.course ||
      !uploadForm.department ||
      !uploadForm.intake ||
      !uploadForm.totalQuestions
    ) {
      toast.error(t("messages.requiredFields"));
      return;
    }

    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("title", uploadForm.title);
    formData.append("course", uploadForm.course);
    formData.append("department", uploadForm.department);
    formData.append("intake", uploadForm.intake);
    formData.append("total_questions", uploadForm.totalQuestions);
    formData.append("difficulty", uploadForm.difficulty);
    formData.append("description", uploadForm.description);
    if (uploadFile) formData.append("pdf_file", uploadFile);

    try {
      await api.patch(`ct-questions/${editQuestionId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Updated successfully");
      resetModal();
      invalidateCache("ct_questions");
      fetchQuestions();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    setDeleteLoading(true);
    try {
      await api.delete(`ct-questions/${id}/`);
      toast.success("Deleted successfully");
      if (selectedQuestion?.id === id) setSelectedQuestion(null);
      invalidateCache("ct_questions");
      fetchQuestions();
    } catch (e) {
      toast.error("Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (q) => {
    setEditQuestionId(q.id);
    setUploadForm({
      title: q.title,
      course: q.course,
      department: q.department,
      intake: q.intake,
      totalQuestions: q.total_questions,
      difficulty: q.difficulty,
      description: q.description || "",
    });
    setUploadFile(null);
    setShowUpload(true);
  };

  const resetModal = () => {
    setShowUpload(false);
    setUploadFile(null);
    setUploadError(null);
    setEditQuestionId(null);
    setUploadForm({
      title: "",
      course: "",
      department: "",
      intake: "",
      totalQuestions: "",
      difficulty: "medium",
      description: "",
    });
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.course.toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || q.department === filterDept;
    const matchIntake = !filterIntake || q.intake === filterIntake;
    return matchSearch && matchDept && matchIntake;
  });

  const getFileUrl = (question) => question.file_url || question.pdf_file;

  const getDifficultyColor = (difficulty) => {
    if (difficulty === "easy") return "#10b981";
    if (difficulty === "medium") return "#f59e0b";
    return "#ef4444";
  };

  const getDifficultyBg = (difficulty, isDark) => {
    if (difficulty === "easy") return isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.1)";
    if (difficulty === "medium") return isDark ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.1)";
    return isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.1)";
  };

  if (selectedQuestion) {
    return (
      <div
        className="cc-page"
        style={{
          minHeight: "100vh",
          background: isDark ? "#0b1120" : "#f8f7ff",
          padding: pageShellPadding(bp),
          fontFamily: "Inter, sans-serif",
        }}
      >
        <ThemeLanguageSwitcher />
        <div className="cc-container" style={{ maxWidth: "1200px", margin: "0 auto", paddingLeft: 0, paddingRight: 0 }}>
          <button
            onClick={() => setSelectedQuestion(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: ACCENT,
              fontSize: "15px",
              fontWeight: "600",
              marginBottom: "24px",
              padding: 0,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <ArrowLeft size={18} /> {t("common.back")}
          </button>

          <div
            style={{
              background: colors.bg_card,
              borderRadius: "20px",
              border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6"}`,
              padding: modalPadding(bp),
              boxShadow: `0 2px 12px rgba(0,0,0,${isDark ? "0.18" : "0.05"})`,
            }}
          >
            <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ margin: "0 0 8px", fontSize: sectionTitleSize(bp), fontWeight: "800", color: colors.text_primary }}>
                  {selectedQuestion.title}
                </h1>
                <p style={{ margin: 0, fontSize: "14px", color: colors.text_tertiary }}>
                  {selectedQuestion.course} • {t("ctQuestions.intakeLabel", { value: selectedQuestion.intake })}
                </p>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 14px",
                  background: getDifficultyBg(selectedQuestion.difficulty, isDark),
                  borderRadius: "8px",
                }}
              >
                <Zap size={14} color={getDifficultyColor(selectedQuestion.difficulty)} />
                <span
                  style={{
                    color: getDifficultyColor(selectedQuestion.difficulty),
                    fontWeight: "700",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {selectedQuestion.difficulty}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: statsAutoGrid(bp, 150), gap: "16px", marginBottom: "32px" }}>
              {[
                { label: t("dashboard.quickStats.totalQuestions"), value: selectedQuestion.total_questions },
                { label: t("common.department"), value: selectedQuestion.department },
                { label: t("common.intake"), value: selectedQuestion.intake },
                { label: t("ctQuestions.uploadDate"), value: new Date(selectedQuestion.created_at).toLocaleDateString() },
                { label: t("ctQuestions.uploadedByLabel"), value: selectedQuestion.uploaded_by || username },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    background: colors.bg_secondary,
                    padding: "16px",
                    borderRadius: "12px",
                    border: `1px solid ${colors.border_secondary}`,
                  }}
                >
                  <div style={{ fontSize: "12px", color: colors.text_muted, marginBottom: "4px" }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: colors.text_primary }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {selectedQuestion.description && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: "700", color: colors.text_primary }}>
                  {t("ctQuestions.description")}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: colors.text_tertiary,
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedQuestion.description}
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => window.open(getFileUrl(selectedQuestion), "_blank")}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "14px 20px",
                  background: `linear-gradient(135deg, ${ACCENT}, #1e40af)`,
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
              >
                <Eye size={16} /> {t("ctQuestions.viewPdf")}
              </button>
              <button
                onClick={() => {
                  downloadFile(getFileUrl(selectedQuestion), `${selectedQuestion.title}.pdf`);
                }}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "14px 20px",
                  background: colors.bg_secondary,
                  color: ACCENT,
                  border: `1.5px solid ${ACCENT}`,
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.background = `${ACCENT}20`)}
                onMouseLeave={(e) => (e.target.style.background = colors.bg_secondary)}
              >
                <Download size={16} /> {t("common.download")}
              </button>
              { (selectedQuestion.uploaded_by === username || selectedQuestion.uploaded_by?.split(' ')[0] === username) && (
                <>
                  <button
                    onClick={() => openEditModal(selectedQuestion)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "14px 20px",
                      background: colors.bg_secondary,
                      color: ACCENT,
                      border: `1.5px solid ${ACCENT}`,
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      transition: "all 0.3s",
                    }}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(selectedQuestion.id)}
                    disabled={deleteLoading}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "14px 20px",
                      background: "rgba(239,68,68,0.1)",
                      color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      transition: "all 0.3s",
                    }}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="cc-page"
      style={{
        minHeight: "100vh",
        background: isDark ? "#0b1120" : "#f8f7ff",
        padding: pageShellPadding(bp),
        fontFamily: "Inter, sans-serif",
        color: colors.text_primary,
        transition: "all 0.35s ease",
      }}
    >
      <FloatingBackButton />
      <ThemeLanguageSwitcher />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: ${colors.text_muted} !important; }
      `}</style>

      <div className="cc-container" style={{ maxWidth: "1400px", margin: "0 auto", paddingLeft: 0, paddingRight: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ margin: "0 0 8px", fontSize: heroTitleSize(bp), fontWeight: "900", letterSpacing: "-1px" }}>
              {t("features.ctQuestions")}
            </h1>
            <p style={{ margin: 0, fontSize: "15px", color: colors.text_tertiary }}>
              {t("features.ctQuestionsDesc")}
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 24px",
              background: `linear-gradient(135deg, ${ACCENT}, #1e40af)`,
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
          >
            <Plus size={18} /> {t("common.upload")}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: statsAutoGrid(bp), gap: "16px", marginBottom: "32px" }}>
          {[
            { label: t("ctQuestions.totalPapers"), value: stats.total, icon: FileQuestion, color: ACCENT },
            { label: t("ctQuestions.easy"), value: stats.easy, icon: BarChart3, color: "#10b981" },
            { label: t("ctQuestions.medium"), value: stats.medium, icon: BarChart3, color: "#f59e0b" },
            { label: t("ctQuestions.hard"), value: stats.hard, icon: BarChart3, color: "#ef4444" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                style={{
                  background: colors.bg_card,
                  border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6"}`,
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  boxShadow: `0 2px 12px rgba(0,0,0,${isDark ? "0.18" : "0.05"})`,
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "12px",
                    background: `${stat.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={24} color={stat.color} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: colors.text_muted, marginBottom: "4px" }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div
          style={{
            background: colors.bg_card,
            border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6"}`,
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "24px",
            display: "grid",
            gridTemplateColumns: filterBarGrid(bp, 3),
            gap: "14px",
            alignItems: "end",
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: colors.text_muted, marginBottom: "6px" }}>
              {t("common.search")}
            </label>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: colors.text_muted }} />
              <input
                type="text"
                placeholder={t("ctQuestions.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "40px",
                  padding: "12px 16px",
                  border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  background: colors.bg_input,
                  color: colors.text_primary,
                  boxSizing: "border-box",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.3s",
                }}
                onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                onBlur={(e) => (e.target.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb")}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: colors.text_muted, marginBottom: "6px" }}>
              {t("common.department")}
            </label>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={selectStyle(filterDept, colors, isDark)}>
              <option value="">{t("ctQuestions.allDepartments")}</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: colors.text_muted, marginBottom: "6px" }}>
              {t("common.intake")}
            </label>
            <select value={filterIntake} onChange={(e) => setFilterIntake(e.target.value)} style={selectStyle(filterIntake, colors, isDark)}>
              <option value="">{t("ctQuestions.allIntakes")}</option>
              {INTAKES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setFilterDept("");
              setFilterIntake("");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "11px 16px",
              background: colors.bg_secondary,
              border: `1.5px solid ${colors.border_secondary}`,
              borderRadius: "10px",
              color: colors.text_secondary,
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.3s",
              height: "43px",
            }}
            onMouseEnter={(e) => (e.target.style.background = colors.bg_tertiary)}
            onMouseLeave={(e) => (e.target.style.background = colors.bg_secondary)}
          >
            <X size={14} /> {t("ctQuestions.clearFilters")}
          </button>
        </div>

        {/* Questions Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: `3px solid ${colors.border_secondary}`,
                borderTop: `3px solid ${ACCENT}`,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: colors.bg_card,
              borderRadius: "16px",
              border: `1.5px dashed ${colors.border_secondary}`,
            }}
          >
            <FileQuestion size={48} style={{ color: colors.text_muted, marginBottom: "16px" }} />
            <p style={{ color: colors.text_muted, fontSize: "15px" }}>
              {t("messages.noQuestionsFound")}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: autoFillGrid(300, bp), gap: "18px" }}>
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                onClick={() => setSelectedQuestion(question)}
                style={{
                  background: colors.bg_card,
                  border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6"}`,
                  borderRadius: "16px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.34,1.2,0.64,1)",
                  boxShadow: `0 2px 12px rgba(0,0,0,${isDark ? "0.18" : "0.05"})`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = `0 20px 40px rgba(${ACCENT.slice(1).match(/.{1,2}/g).map(x => parseInt(x, 16)).join(",")},0.3), 0 4px 16px rgba(0,0,0,${isDark ? "0.25" : "0.05"})`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `0 2px 12px rgba(0,0,0,${isDark ? "0.18" : "0.05"})`;
                }}
              >
                <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: `${ACCENT}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileQuestion size={20} color={ACCENT} />
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 10px",
                      background: getDifficultyBg(question.difficulty, isDark),
                      borderRadius: "6px",
                    }}
                  >
                    <span
                      style={{
                        color: getDifficultyColor(question.difficulty),
                        fontWeight: "700",
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {question.difficulty}
                    </span>
                  </div>
                </div>

                <h3 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: "700", color: colors.text_primary }}>
                  {question.title}
                </h3>
                <p style={{ margin: "0 0 12px", fontSize: "12px", color: colors.text_muted }}>
                  {question.course} • {t("ctQuestions.intakeLabel", { value: question.intake })}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: `1px solid ${colors.border_secondary}` }}>
                  <span style={{ fontSize: "12px", color: colors.text_muted }}>
                    {question.total_questions} {t("ctQuestions.questions")}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    { (question.uploaded_by === username || question.uploaded_by?.split(' ')[0] === username) && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(question);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "6px 12px",
                            background: colors.bg_secondary,
                            color: ACCENT,
                            border: `1px solid ${ACCENT}`,
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                            cursor: "pointer",
                            fontFamily: "Inter, sans-serif",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                        >
                          <Edit size={12} /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(question.id);
                          }}
                          disabled={deleteLoading}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "6px 12px",
                            background: "rgba(239,68,68,0.1)",
                            color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                            cursor: "pointer",
                            fontFamily: "Inter, sans-serif",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = getFileUrl(question);
                        if (url) {
                          window.open(url, "_blank");
                        } else {
                          setSelectedQuestion(question);
                        }
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "6px 12px",
                        background: colors.bg_secondary,
                        color: ACCENT,
                        border: `1px solid ${ACCENT}`,
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                      onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                    >
                      <Eye size={12} /> View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(getFileUrl(question), `${question.title}.pdf`);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "6px 12px",
                        background: ACCENT,
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                      onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                    >
                      <Download size={12} /> {t("common.download")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            backdropFilter: "blur(4px)",
            padding: "20px",
          }}
          onClick={() => setShowUpload(false)}
        >
          <div
            style={{
              background: colors.bg_card,
              borderRadius: "20px",
              border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6"}`,
              padding: "32px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: colors.text_primary }}>
                {editQuestionId ? "Edit Paper" : t("ctQuestions.uploadPaper")}
              </h2>
              <button
                onClick={() => resetModal()}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: colors.text_muted,
                  padding: "4px",
                }}
              >
                <X size={24} />
              </button>
            </div>

            {uploadError && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#ef4444",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {uploadError}
              </div>
            )}

            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: colors.text_muted, marginBottom: "6px" }}>
                  {t("ctQuestions.titleLabel")}
                </label>
                <input
                  type="text"
                  placeholder={t("ctQuestions.titlePlaceholder")}
                  value={uploadForm.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    background: colors.bg_input,
                    color: colors.text_primary,
                    boxSizing: "border-box",
                    fontFamily: "Inter, sans-serif",
                    transition: "all 0.3s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                  onBlur={(e) => (e.target.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb")}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: colors.text_muted, marginBottom: "6px" }}>
                    {t("ctQuestions.departmentRequired")}
                  </label>
                  <select value={uploadForm.department} onChange={(e) => handleFormChange("department", e.target.value)} style={selectStyle(uploadForm.department, colors, isDark)}>
                    <option value="">{t("ctQuestions.selectDepartment")}</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: colors.text_muted, marginBottom: "6px" }}>
                    {t("ctQuestions.intakeRequired")}
                  </label>
                  <select value={uploadForm.intake} onChange={(e) => handleFormChange("intake", e.target.value)} style={selectStyle(uploadForm.intake, colors, isDark)}>
                    <option value="">{t("ctQuestions.selectIntake")}</option>
                    {INTAKES.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: colors.text_muted, marginBottom: "6px" }}>
                  {t("ctQuestions.courseLabel")}
                </label>
                <input
                  type="text"
                  placeholder="e.g. CSE101"
                  value={uploadForm.course}
                  onChange={(e) => handleFormChange("course", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    background: colors.bg_input,
                    color: colors.text_primary,
                    boxSizing: "border-box",
                    fontFamily: "Inter, sans-serif",
                    transition: "all 0.3s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                  onBlur={(e) => (e.target.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb")}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: colors.text_muted, marginBottom: "6px" }}>
                    {t("ctQuestions.totalQuestionsLabel")}
                  </label>
                  <input
                    type="number"
                    placeholder={t("ctQuestions.totalQuestionsPlaceholder")}
                    value={uploadForm.totalQuestions}
                    onChange={(e) => handleFormChange("totalQuestions", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
                      borderRadius: "10px",
                      fontSize: "14px",
                      outline: "none",
                      background: colors.bg_input,
                      color: colors.text_primary,
                      boxSizing: "border-box",
                      fontFamily: "Inter, sans-serif",
                      transition: "all 0.3s",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: colors.text_muted, marginBottom: "6px" }}>
                    {t("ctQuestions.difficultyLabel")}
                  </label>
                  <select value={uploadForm.difficulty} onChange={(e) => handleFormChange("difficulty", e.target.value)} style={selectStyle(uploadForm.difficulty, colors, isDark)}>
                    <option value="easy">{t("ctQuestions.easy")}</option>
                    <option value="medium">{t("ctQuestions.medium")}</option>
                    <option value="hard">{t("ctQuestions.hard")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: colors.text_muted, marginBottom: "6px" }}>
                  {t("ctQuestions.description")}
                </label>
                <textarea
                  placeholder={t("ctQuestions.descriptionPlaceholder")}
                  value={uploadForm.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    background: colors.bg_input,
                    color: colors.text_primary,
                    boxSizing: "border-box",
                    fontFamily: "Inter, sans-serif",
                    minHeight: "100px",
                    resize: "vertical",
                    transition: "all 0.3s",
                  }}
                />
              </div>

              <div
                onDragOver={() => setDragOver(true)}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                style={{
                  border: `2px dashed ${dragOver ? ACCENT : colors.border_secondary}`,
                  borderRadius: "10px",
                  padding: "24px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: dragOver ? `${ACCENT}10` : colors.bg_secondary,
                  transition: "all 0.3s",
                }}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileDrop}
                  style={{ display: "none" }}
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  style={{
                    display: "block",
                    cursor: "pointer",
                    color: uploadFile ? ACCENT : colors.text_secondary,
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>📄</div>
                  <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>
                    {uploadFile ? uploadFile.name : t("ctQuestions.clickToUpload")}
                  </div>
                  <div style={{ fontSize: "12px", color: colors.text_muted }}>
                    {t("ctQuestions.fileTypes")}
                  </div>
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: "12px" }}>
                <button
                  onClick={() => setShowUpload(false)}
                  style={{
                    padding: "12px 20px",
                    background: colors.bg_secondary,
                    border: `1.5px solid ${colors.border_secondary}`,
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    color: colors.text_secondary,
                    fontFamily: "Inter, sans-serif",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = colors.bg_tertiary)}
                  onMouseLeave={(e) => (e.target.style.background = colors.bg_secondary)}
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleUploadSubmit}
                  disabled={uploading}
                  style={{
                    padding: "12px 20px",
                    background: `linear-gradient(135deg, ${ACCENT}, #1e40af)`,
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: uploading ? "wait" : "pointer",
                    fontFamily: "Inter, sans-serif",
                    transition: "all 0.3s",
                    opacity: uploading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => !uploading && (e.target.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => !uploading && (e.target.style.transform = "translateY(0)")}
                >
                  {uploading ? t("admin.permissions.saving") : (editQuestionId ? "Save Changes" : t("common.upload"))}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
