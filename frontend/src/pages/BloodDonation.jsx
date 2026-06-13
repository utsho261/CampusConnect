import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, Droplets, Search, Plus, Users, Activity,
  AlertTriangle, Clock, MapPin, Phone, Mail, Calendar,
  Shield, Star, Award, Zap, TrendingUp, Share2,
  MessageCircle, ThumbsUp, Camera, Send, ArrowLeft,
  CheckCircle, XCircle, ChevronDown, X, Filter,
  Bell, BarChart2, Sparkles, UserPlus, FileText,
  ArrowRight, RefreshCw, Eye, Edit3
} from "lucide-react";
import { useNavigate as useNav } from "react-router-dom";
import api from "../services/api";
import { useTheme, useLanguage, useBreakpoint } from "../hooks";
import { autoFillGrid, bloodFilterGrid, formGridCols, formGridCols3, headerPadding, heroTitleSize, pagePadding, splitSidebarGrid, statsAutoGrid } from "../utils/responsiveLayout";
import { getThemeColors } from "../utils/themeColors";
import ThemeLanguageSwitcher from "../components/ThemeLanguageSwitcher";
import toast from "react-hot-toast";

// ─── Bangladesh Location Data ──────────────────────────────────────────────
const BD_LOCATIONS = {
  dhaka: {
    label: "Dhaka",
    districts: {
      dhaka_city: { label: "Dhaka", upazilas: ["Dhanmondi", "Gulshan", "Mirpur", "Mohammadpur", "Tejgaon", "Uttara", "Wari"] },
      gazipur: { label: "Gazipur", upazilas: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"] },
      narayanganj: { label: "Narayanganj", upazilas: ["Narayanganj Sadar", "Araihazar", "Bandar", "Rupganj", "Sonargaon"] },
      narsingdi: { label: "Narsingdi", upazilas: ["Narsingdi Sadar", "Belabo", "Monohardi", "Palash", "Raipura", "Shibpur"] },
    }
  },
  chittagong: {
    label: "Chittagong",
    districts: {
      chittagong_city: { label: "Chittagong", upazilas: ["Panchlaish", "Double Mooring", "Kotwali", "Pahartali", "Hathazari"] },
      cox_bazar: { label: "Cox's Bazar", upazilas: ["Cox's Bazar Sadar", "Chakaria", "Kutubdia", "Ramu", "Teknaf", "Ukhiya"] },
      comilla: { label: "Comilla", upazilas: ["Comilla Sadar", "Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram"] },
    }
  },
  sylhet: {
    label: "Sylhet",
    districts: {
      sylhet_city: { label: "Sylhet", upazilas: ["Sylhet Sadar", "Beanibazar", "Bishwanath", "Companiganj", "Fenchuganj"] },
      habiganj: { label: "Habiganj", upazilas: ["Habiganj Sadar", "Ajmiriganj", "Baniachang", "Bahubal", "Chunarughat"] },
      moulvibazar: { label: "Moulvibazar", upazilas: ["Moulvibazar Sadar", "Barlekha", "Juri", "Kamalganj", "Kulaura"] },
    }
  },
  rajshahi: {
    label: "Rajshahi",
    districts: {
      rajshahi_city: { label: "Rajshahi", upazilas: ["Rajshahi Sadar", "Bagha", "Bagmara", "Charghat", "Durgapur"] },
      bogura: { label: "Bogura", upazilas: ["Bogura Sadar", "Adamdighi", "Dhunat", "Dupchanchia", "Gabtali"] },
      natore: { label: "Natore", upazilas: ["Natore Sadar", "Bagatipara", "Baraigram", "Gurudaspur", "Lalpur"] },
    }
  },
  khulna: {
    label: "Khulna",
    districts: {
      khulna_city: { label: "Khulna", upazilas: ["Khulna Sadar", "Batiaghata", "Dacope", "Dumuria", "Dighalia"] },
      jessore: { label: "Jessore", upazilas: ["Jessore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha"] },
      satkhira: { label: "Satkhira", upazilas: ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Kaliganj"] },
    }
  },
  barisal: {
    label: "Barisal",
    districts: {
      barisal_city: { label: "Barisal", upazilas: ["Barisal Sadar", "Agailjhara", "Babuganj", "Bakerganj", "Banaripara"] },
      patuakhali: { label: "Patuakhali", upazilas: ["Patuakhali Sadar", "Bauphal", "Dashmina", "Dumki", "Galachipa"] },
    }
  },
  rangpur: {
    label: "Rangpur",
    districts: {
      rangpur_city: { label: "Rangpur", upazilas: ["Rangpur Sadar", "Badarganj", "Gangachara", "Kaunia", "Mithapukur"] },
      dinajpur: { label: "Dinajpur", upazilas: ["Dinajpur Sadar", "Birampur", "Birganj", "Biral", "Bochaganj"] },
    }
  },
  mymensingh: {
    label: "Mymensingh",
    districts: {
      mymensingh_city: { label: "Mymensingh", upazilas: ["Mymensingh Sadar", "Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon"] },
      netrokona: { label: "Netrokona", upazilas: ["Netrokona Sadar", "Atpara", "Barhatta", "Durgapur", "Kalmakanda"] },
    }
  },
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const BLOOD_GROUP_COLORS = {
  "A+": "#ef4444", "A-": "#dc2626", "B+": "#f97316", "B-": "#ea580c",
  "AB+": "#8b5cf6", "AB-": "#7c3aed", "O+": "#3b82f6", "O-": "#2563eb",
};
const URGENCY_COLORS = {
  normal: { bg: "#ecfdf5", color: "#059669", darkBg: "rgba(5,150,105,0.15)" },
  urgent: { bg: "#fffbeb", color: "#d97706", darkBg: "rgba(217,119,6,0.15)" },
  critical: { bg: "#fef2f2", color: "#dc2626", darkBg: "rgba(220,38,38,0.15)" },
};
const STATUS_COLORS = {
  open: { bg: "#eff6ff", color: "#2563eb", darkBg: "rgba(37,99,235,0.15)" },
  urgent: { bg: "#fef2f2", color: "#dc2626", darkBg: "rgba(220,38,38,0.15)" },
  in_progress: { bg: "#fffbeb", color: "#d97706", darkBg: "rgba(217,119,6,0.15)" },
  fulfilled: { bg: "#ecfdf5", color: "#059669", darkBg: "rgba(5,150,105,0.15)" },
  closed: { bg: "#f3f4f6", color: "#6b7280", darkBg: "rgba(107,114,128,0.15)" },
};
const BADGE_CONFIG = {
  new_donor: { label: "New Donor", icon: "🌱", color: "#059669", bg: "#ecfdf5" },
  active_donor: { label: "Active Donor", icon: "💪", color: "#2563eb", bg: "#eff6ff" },
  emergency_hero: { label: "Emergency Hero", icon: "⚡", color: "#dc2626", bg: "#fef2f2" },
  life_saver: { label: "Life Saver", icon: "❤️", color: "#7c3aed", bg: "#f5f3ff" },
  top_contributor: { label: "Top Contributor", icon: "🏆", color: "#d97706", bg: "#fffbeb" },
};

// Reusable Skeleton Loader
const SkeletonCard = ({ isDark }) => (
  <div style={{
    background: isDark ? "#1e293b" : "#fff",
    borderRadius: 18,
    padding: 22,
    border: `1.5px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}`,
    animation: "pulse 1.8s ease-in-out infinite",
  }}>
    <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: isDark ? "#334155" : "#e5e7eb" }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 14, background: isDark ? "#334155" : "#e5e7eb", borderRadius: 7, width: "60%", marginBottom: 8 }} />
        <div style={{ height: 11, background: isDark ? "#334155" : "#e5e7eb", borderRadius: 6, width: "40%" }} />
      </div>
    </div>
    <div style={{ height: 11, background: isDark ? "#334155" : "#e5e7eb", borderRadius: 6, marginBottom: 8 }} />
    <div style={{ height: 11, background: isDark ? "#334155" : "#e5e7eb", borderRadius: 6, width: "80%" }} />
  </div>
);

// Countdown Timer component
const CountdownTimer = ({ targetDate, colors }) => {
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return setTimeLeft({ expired: true });
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  if (timeLeft.expired) return <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700 }}>⚠️ EXPIRED</span>;
  return (
    <div style={{ display: "flex", gap: 6, fontSize: 12, fontWeight: 800 }}>
      {[["H", timeLeft.hours], ["M", timeLeft.minutes], ["S", timeLeft.seconds]].map(([u, v]) => (
        <div key={u} style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#dc2626", color: "white", borderRadius: 6, padding: "3px 7px", minWidth: 32 }}>
          <span style={{ fontSize: 15 }}>{String(v ?? 0).padStart(2, "0")}</span>
          <span style={{ fontSize: 9, opacity: 0.8 }}>{u}</span>
        </div>
      ))}
    </div>
  );
};

// Blood Group Badge
const BloodGroupBadge = ({ group, size = "md" }) => {
  const color = BLOOD_GROUP_COLORS[group] || "#dc2626";
  const sz = size === "lg" ? { width: 56, height: 56, fontSize: 18 } : size === "sm" ? { width: 32, height: 32, fontSize: 11 } : { width: 44, height: 44, fontSize: 14 };
  return (
    <div style={{
      ...sz, borderRadius: "50%",
      background: `radial-gradient(circle at 30% 30%, ${color}dd, ${color})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: 900, letterSpacing: "-0.5px",
      boxShadow: `0 4px 14px ${color}55`,
      flexShrink: 0,
    }}>
      {group}
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function BloodDonation() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const isDark = theme === "dark";
  const bp = useBreakpoint();

  const ACCENT = "#DC2626";
  const ACCENT_LIGHT = isDark ? "#ef4444" : "#dc2626";
  const ACCENT_BG = isDark ? "rgba(220,38,38,0.1)" : "#fef2f2";

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [donationRecords, setDonationRecords] = useState([]);
  const [smartMatches, setSmartMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Filter states
  const [filterBloodGroup, setFilterBloodGroup] = useState("");
  const [filterDivision, setFilterDivision] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showDonorForm, setShowDonorForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [donorFormStep, setDonorFormStep] = useState(1);

  // Form states
  const [donorForm, setDonorForm] = useState({
    full_name: "", blood_group: "", phone: "", email: "", gender: "",
    date_of_birth: "", weight: "", division: "", district: "", upazila: "",
    address: "", last_donation_date: "", is_available: true, emergency_available: false, medical_notes: "",
  });
  const [requestForm, setRequestForm] = useState({
    patient_name: "", blood_group: "", bags_needed: 1, hospital_name: "",
    hospital_location: "", division: "", district: "", contact_person: "",
    contact_number: "", urgency: "normal", required_date: "", additional_notes: "",
  });
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState("story");
  const [submitting, setSubmitting] = useState(false);

  const username = localStorage.getItem("username") || "User";

  // Fetch data
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, donorsRes, requestsRes, communityRes] = await Promise.allSettled([
        api.get("blood/stats/"),
        api.get("blood/donors/"),
        api.get("blood/requests/"),
        api.get("blood/community/"),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (donorsRes.status === "fulfilled") setDonors(donorsRes.value.data);
      if (requestsRes.status === "fulfilled") setRequests(requestsRes.value.data);
      if (communityRes.status === "fulfilled") setCommunityPosts(communityRes.value.data);

      // Try fetching my profile
      try {
        const profileRes = await api.get("blood/donors/my-profile/");
        setMyProfile(profileRes.data);
        const recordsRes = await api.get("blood/records/");
        setDonationRecords(recordsRes.data);
      } catch (_) { /* not a donor yet */ }
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role || !localStorage.getItem("access")) { navigate("/login"); return; }
    fetchAll();
  }, [fetchAll, navigate]);

  // Get districts for selected division
  const availableDistricts = useMemo(() => {
    if (!filterDivision || !BD_LOCATIONS[filterDivision]) return [];
    return Object.entries(BD_LOCATIONS[filterDivision].districts).map(([k, v]) => ({ key: k, label: v.label }));
  }, [filterDivision]);

  const donorDistricts = useMemo(() => {
    if (!donorForm.division || !BD_LOCATIONS[donorForm.division]) return [];
    return Object.entries(BD_LOCATIONS[donorForm.division].districts).map(([k, v]) => ({ key: k, label: v.label }));
  }, [donorForm.division]);

  const donorUpazilas = useMemo(() => {
    if (!donorForm.district || !donorForm.division || !BD_LOCATIONS[donorForm.division]) return [];
    return BD_LOCATIONS[donorForm.division].districts[donorForm.district]?.upazilas || [];
  }, [donorForm.division, donorForm.district]);

  const requestDistricts = useMemo(() => {
    if (!requestForm.division || !BD_LOCATIONS[requestForm.division]) return [];
    return Object.entries(BD_LOCATIONS[requestForm.division].districts).map(([k, v]) => ({ key: k, label: v.label }));
  }, [requestForm.division]);

  // Filtered donors
  const filteredDonors = useMemo(() => {
    return donors.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || d.full_name?.toLowerCase().includes(q) || d.district?.toLowerCase().includes(q);
      const matchBG = !filterBloodGroup || d.blood_group === filterBloodGroup;
      const matchDiv = !filterDivision || d.division === filterDivision;
      const matchDist = !filterDistrict || d.district?.toLowerCase().includes(filterDistrict.toLowerCase());
      const matchAvail = !filterAvailability || (filterAvailability === "available" ? d.is_available : d.emergency_available);
      return matchSearch && matchBG && matchDiv && matchDist && matchAvail;
    });
  }, [donors, searchQuery, filterBloodGroup, filterDivision, filterDistrict, filterAvailability]);

  const emergencyRequests = useMemo(() =>
    requests.filter(r => r.urgency === "critical" || r.status === "urgent"),
    [requests]
  );

  // Submit donor registration
  const handleDonorSubmit = async () => {
    if (!donorForm.full_name || !donorForm.blood_group || !donorForm.phone || !donorForm.gender) {
      toast.error("Please fill in all required fields."); return;
    }
    setSubmitting(true);
    try {
      await api.post("blood/donors/", donorForm);
      toast.success("🎉 You are now registered as a blood donor!");
      setShowDonorForm(false);
      setDonorFormStep(1);
      fetchAll();
    } catch (err) {
      const msg = err.response?.data ? Object.values(err.response.data).flat().join(" ") : "Registration failed.";
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  // Submit blood request
  const handleRequestSubmit = async () => {
    if (!requestForm.patient_name || !requestForm.blood_group || !requestForm.hospital_name || !requestForm.contact_number) {
      toast.error("Please fill required fields."); return;
    }
    setSubmitting(true);
    try {
      await api.post("blood/requests/", requestForm);
      toast.success("Blood request posted successfully!");
      setShowRequestForm(false);
      fetchAll();
      setActiveTab("requests");
    } catch (err) {
      toast.error("Failed to create request. Please try again.");
    } finally { setSubmitting(false); }
  };

  // Submit community post
  const handlePostSubmit = async () => {
    if (!postContent.trim()) { toast.error("Write something first!"); return; }
    setSubmitting(true);
    try {
      await api.post("blood/community/", { content: postContent, post_type: postType });
      toast.success("Post shared successfully!");
      setShowPostModal(false);
      setPostContent("");
      fetchAll();
    } catch (err) {
      toast.error("Failed to post.");
    } finally { setSubmitting(false); }
  };

  // Toggle like
  const handleLike = async (postId) => {
    try {
      const res = await api.post(`blood/community/${postId}/toggle-like/`);
      setCommunityPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, likes_count: res.data.likes_count, is_liked: res.data.liked } : p
      ));
    } catch (_) { toast.error("Could not process like."); }
  };

  // Share request
  const handleShare = async (requestId) => {
    try {
      await api.post(`blood/requests/${requestId}/share/`);
      navigator.clipboard?.writeText(`${window.location.origin}/blood-donation?request=${requestId}`);
      toast.success("Link copied! Please share with others 🙏");
    } catch (_) { toast.success("Share link copied!"); }
  };

  // ─── STYLES ──────────────────────────────────────────────────────────────
  const inputStyle = {
    width: "100%", padding: "12px 14px", border: `1.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`,
    borderRadius: 12, fontSize: 14, outline: "none", boxSizing: "border-box",
    color: colors.text_primary, background: colors.bg_input, fontFamily: "Inter, sans-serif",
    transition: "border-color 0.2s",
  };
  const selectStyle = { ...inputStyle, appearance: "none", cursor: "pointer" };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: colors.text_muted, marginBottom: 6, letterSpacing: "0.3px" };
  const btnPrimary = {
    display: "flex", alignItems: "center", gap: 8, padding: "13px 24px",
    background: `linear-gradient(135deg, ${ACCENT}, #b91c1c)`,
    color: "white", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700,
    cursor: "pointer", fontFamily: "Inter, sans-serif",
    boxShadow: "0 6px 20px rgba(220,38,38,0.35)", transition: "all 0.2s",
  };

  // ─── TABS ─────────────────────────────────────────────────────────────────
  const TABS = [
    { key: "dashboard", label: "Dashboard", icon: BarChart2 },
    { key: "donors", label: "Find Donors", icon: Search },
    { key: "requests", label: "Requests", icon: Droplets, badge: emergencyRequests.length },
    { key: "emergency", label: "Emergency", icon: AlertTriangle, badge: emergencyRequests.length },
    { key: "community", label: "Community", icon: Users },
    { key: "activity", label: "My Activity", icon: Activity },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="cc-page" style={{ minHeight: "100vh", background: isDark ? "#0b1120" : "#fff5f5", fontFamily: "Inter, sans-serif", color: colors.text_primary }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.15)} 28%{transform:scale(1)} 42%{transform:scale(1.12)} }
        @keyframes emergencyPulse { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.6)} 50%{box-shadow:0 0 0 16px rgba(220,38,38,0)} }
        @keyframes shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(220,38,38,0.25); border-radius: 10px; }
        .bd-card:hover { transform: translateY(-5px) !important; }
        .bd-btn:hover { transform: translateY(-2px) !important; filter: brightness(1.08); }
        .like-btn:hover { transform: scale(1.1); }
        .tab-btn { transition: all 0.2s !important; }
        .tab-btn:hover { opacity: 0.85; }
      `}</style>
      <ThemeLanguageSwitcher />

      {/* ── HEADER ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: isDark ? "rgba(11,17,32,0.96)" : "rgba(255,245,245,0.96)",
        backdropFilter: "blur(16px)", borderBottom: `1px solid ${isDark ? "rgba(220,38,38,0.15)" : "rgba(220,38,38,0.12)"}`,
        padding: headerPadding(bp), minHeight: 66,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: colors.text_muted, display: "flex", padding: 4 }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#dc2626,#b91c1c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(220,38,38,0.4)", animation: "heartbeat 2s ease-in-out infinite" }}>
              <Heart size={18} color="white" fill="white" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: colors.text_primary, letterSpacing: "-0.3px" }}>Blood Donation</div>
              <div style={{ fontSize: 10, color: colors.text_muted }}>Save lives · CampusConnect</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {!myProfile && (
            <button className="bd-btn" onClick={() => setShowDonorForm(true)} style={btnPrimary}>
              <UserPlus size={16} /> <span className="cc-hide-mobile">Become a Donor</span>
            </button>
          )}
          <button className="bd-btn" onClick={() => setShowRequestForm(true)} style={{ ...btnPrimary, background: `linear-gradient(135deg,#7c3aed,#4f46e5)`, boxShadow: "0 6px 20px rgba(124,58,237,0.35)" }}>
            <Plus size={16} /> <span className="cc-hide-mobile">Request Blood</span>
          </button>
        </div>
      </div>

      {/* ── EMERGENCY BANNER ── */}
      {emergencyRequests.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg,#7f1d1d,#dc2626)",
          padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          animation: "emergencyPulse 2s infinite",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={18} color="white" style={{ animation: "heartbeat 1.5s infinite" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
              🚨 {emergencyRequests.length} CRITICAL blood request{emergencyRequests.length > 1 ? "s" : ""} need immediate response!
            </span>
          </div>
          <button onClick={() => setActiveTab("emergency")} style={{ background: "rgba(255,255,255,0.25)", border: "none", color: "white", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            View Now →
          </button>
        </div>
      )}

      <div className="cc-container" style={{ maxWidth: 1400, margin: "0 auto", padding: pagePadding(bp) }}>

        {/* ── TABS ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28, background: isDark ? "rgba(255,255,255,0.04)" : "#fff", padding: 6, borderRadius: 16, width: "fit-content", maxWidth: "100%", border: `1px solid ${isDark ? "rgba(220,38,38,0.1)" : "rgba(220,38,38,0.1)"}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexWrap: "wrap" }}>
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button key={tab.key} className="tab-btn" onClick={() => setActiveTab(tab.key)} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "9px 18px",
                borderRadius: 11, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: active ? 700 : 500,
                fontFamily: "Inter, sans-serif", position: "relative",
                background: active ? (isDark ? ACCENT : ACCENT) : "transparent",
                color: active ? "white" : colors.text_muted,
                boxShadow: active ? "0 4px 14px rgba(220,38,38,0.35)" : "none",
              }}>
                <TabIcon size={15} />
                {tab.label}
                {tab.badge > 0 && (
                  <span style={{ position: "absolute", top: 4, right: 4, width: 14, height: 14, background: active ? "white" : "#dc2626", color: active ? "#dc2626" : "white", borderRadius: "50%", fontSize: 8, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB: DASHBOARD */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <div style={{ animation: "slideUp 0.4s ease" }}>
            {/* Hero Banner */}
            <div style={{
              background: "linear-gradient(135deg,#7f1d1d 0%,#dc2626 40%,#b91c1c 70%,#991b1b 100%)",
              borderRadius: 22, padding: bp.isMobile ? "22px 20px" : "32px 40px", marginBottom: 28, position: "relative", overflow: "hidden",
              boxShadow: "0 16px 48px rgba(220,38,38,0.4)",
            }}>
              <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
              <div style={{ position: "absolute", bottom: -40, right: 160, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Heart size={32} color="white" fill="white" style={{ animation: "heartbeat 1.8s infinite" }} />
                  <h1 style={{ margin: 0, fontSize: heroTitleSize(bp), fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>
                    Blood Donation Community
                  </h1>
                </div>
                <p style={{ margin: "0 0 20px", fontSize: 14, color: "rgba(255,255,255,0.8)", maxWidth: 500 }}>
                  Every drop counts. Connect with donors, create requests, and save lives together in our campus community.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="bd-btn" onClick={() => setShowDonorForm(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 12, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                    <UserPlus size={15} /> Become a Donor
                  </button>
                  <button className="bd-btn" onClick={() => setShowRequestForm(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", background: "white", border: "none", borderRadius: 12, color: "#dc2626", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                    <Plus size={15} /> Create Request
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: statsAutoGrid(bp), gap: 16, marginBottom: 28 }}>
                {[1,2,3,4].map(i => <SkeletonCard key={i} isDark={isDark} />)}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: statsAutoGrid(bp, 190), gap: 16, marginBottom: 28 }}>
                {[
                  { label: "Total Donors", value: stats?.total_donors ?? donors.length, icon: Users, grad: "linear-gradient(135deg,#dc2626,#b91c1c)", shadow: "rgba(220,38,38,0.3)" },
                  { label: "Active Donors", value: stats?.active_donors ?? 0, icon: Heart, grad: "linear-gradient(135deg,#059669,#047857)", shadow: "rgba(5,150,105,0.3)" },
                  { label: "Emergency Donors", value: stats?.emergency_donors ?? 0, icon: Zap, grad: "linear-gradient(135deg,#d97706,#b45309)", shadow: "rgba(217,119,6,0.3)" },
                  { label: "Open Requests", value: stats?.open_requests ?? requests.filter(r => r.status === "open").length, icon: Droplets, grad: "linear-gradient(135deg,#2563eb,#1d4ed8)", shadow: "rgba(37,99,235,0.3)" },
                  { label: "Lives Saved", value: `${stats?.lives_saved ?? 0}+`, icon: Sparkles, grad: "linear-gradient(135deg,#7c3aed,#4f46e5)", shadow: "rgba(124,58,237,0.3)" },
                  { label: "Fulfilled Requests", value: stats?.fulfilled_requests ?? 0, icon: CheckCircle, grad: "linear-gradient(135deg,#0d9488,#0f766e)", shadow: "rgba(13,148,136,0.3)" },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="bd-card" style={{
                      background: colors.bg_card, borderRadius: 18, padding: "20px 22px",
                      display: "flex", alignItems: "center", gap: 14,
                      border: `1.5px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}`,
                      boxShadow: `0 4px 16px rgba(0,0,0,${isDark ? "0.15" : "0.04"})`,
                      cursor: "default", transition: "all 0.25s cubic-bezier(0.34,1.2,0.64,1)",
                    }}>
                      <div style={{ width: 50, height: 50, borderRadius: 14, background: s.grad, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 18px ${s.shadow}`, flexShrink: 0 }}>
                        <Icon size={22} color="white" />
                      </div>
                      <div>
                        <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1, color: colors.text_primary }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: colors.text_muted, marginTop: 3, fontWeight: 600 }}>{s.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Blood Group Distribution */}
            <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 20, marginBottom: 28 }}>
              {/* Chart */}
              <div style={{ background: colors.bg_card, borderRadius: 20, padding: "26px 28px", border: `1.5px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}`, boxShadow: `0 4px 16px rgba(0,0,0,${isDark ? "0.15" : "0.04"})` }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 800, color: colors.text_primary }}>Blood Group Distribution</h3>
                <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 10 }}>
                  {BLOOD_GROUPS.map(bg => {
                    const count = stats?.blood_group_distribution?.[bg] || donors.filter(d => d.blood_group === bg).length;
                    const total = donors.length || 1;
                    const pct = Math.round((count / total) * 100);
                    const color = BLOOD_GROUP_COLORS[bg];
                    return (
                      <div key={bg} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <BloodGroupBadge group={bg} size="sm" />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: colors.text_secondary }}>{bg}</span>
                            <span style={{ fontSize: 11, color: colors.text_muted }}>{count}</span>
                          </div>
                          <div style={{ height: 5, borderRadius: 3, background: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 1s ease" }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Stats */}
              <div style={{ background: colors.bg_card, borderRadius: 20, padding: "26px 28px", border: `1.5px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}`, boxShadow: `0 4px 16px rgba(0,0,0,${isDark ? "0.15" : "0.04"})` }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 800, color: colors.text_primary }}>Monthly Activity</h3>
                {stats?.monthly_stats?.length > 0 ? (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                    {stats.monthly_stats.map((m, i) => {
                      const maxVal = Math.max(...stats.monthly_stats.map(x => x.donations + x.requests), 1);
                      const h = Math.max(((m.donations + m.requests) / maxVal) * 100, 8);
                      return (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ width: "100%", height: `${h}%`, background: `linear-gradient(to top, #dc2626, #ef4444)`, borderRadius: "4px 4px 0 0", transition: "height 1s ease", minHeight: 8 }} title={`Donations: ${m.donations}, Requests: ${m.requests}`} />
                          <span style={{ fontSize: 9, color: colors.text_muted, textAlign: "center", whiteSpace: "nowrap" }}>{m.month.split(" ")[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120, color: colors.text_muted, fontSize: 13 }}>
                    No activity data yet
                  </div>
                )}
              </div>
            </div>

            {/* Recent Requests Preview */}
            <div style={{ background: colors.bg_card, borderRadius: 20, padding: "26px 28px", border: `1.5px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: colors.text_primary }}>Recent Blood Requests</h3>
                <button onClick={() => setActiveTab("requests")} style={{ background: ACCENT_BG, border: "none", color: ACCENT, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  View All →
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: autoFillGrid(280, bp), gap: 14 }}>
                {loading ? [1,2,3].map(i => <SkeletonCard key={i} isDark={isDark} />) :
                  requests.slice(0, 3).map(req => <RequestCard key={req.id} req={req} isDark={isDark} colors={colors} ACCENT={ACCENT} onShare={handleShare} onView={() => setSelectedRequest(req)} />)
                }
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB: FIND DONORS */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === "donors" && (
          <div style={{ animation: "slideUp 0.4s ease" }}>
            {/* Filter Bar */}
            <div style={{ background: colors.bg_card, borderRadius: 18, padding: "20px 24px", marginBottom: 24, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}` }}>
              <div style={{ display: "grid", gridTemplateColumns: bloodFilterGrid(bp), gap: 12, alignItems: "end" }}>
                <div>
                  <label style={labelStyle}>SEARCH DONOR</label>
                  <div style={{ position: "relative" }}>
                    <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: colors.text_muted }} />
                    <input type="text" placeholder="Name or location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ ...inputStyle, paddingLeft: 38 }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>BLOOD GROUP</label>
                  <select value={filterBloodGroup} onChange={e => setFilterBloodGroup(e.target.value)} style={selectStyle}>
                    <option value="">All Groups</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>DIVISION</label>
                  <select value={filterDivision} onChange={e => { setFilterDivision(e.target.value); setFilterDistrict(""); }} style={selectStyle}>
                    <option value="">All Divisions</option>
                    {Object.entries(BD_LOCATIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>AVAILABILITY</label>
                  <select value={filterAvailability} onChange={e => setFilterAvailability(e.target.value)} style={selectStyle}>
                    <option value="">All</option>
                    <option value="available">Available</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>RESULTS</label>
                  <div style={{ height: 44, display: "flex", alignItems: "center", paddingLeft: 14, background: isDark ? "rgba(220,38,38,0.1)" : "#fef2f2", borderRadius: 12, fontSize: 15, fontWeight: 800, color: ACCENT }}>
                    {filteredDonors.length}
                  </div>
                </div>
                <button onClick={() => { setFilterBloodGroup(""); setFilterDivision(""); setFilterDistrict(""); setFilterAvailability(""); setSearchQuery(""); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", height: 44, background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6", border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`, borderRadius: 12, cursor: "pointer", fontSize: 12, fontWeight: 700, color: colors.text_muted, fontFamily: "Inter, sans-serif", alignSelf: "flex-end" }}>
                  <X size={14} /> Clear
                </button>
              </div>
            </div>

            {/* Donor Grid */}
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: autoFillGrid(300, bp), gap: 20 }}>
                {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} isDark={isDark} />)}
              </div>
            ) : filteredDonors.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px", background: colors.bg_card, borderRadius: 20, border: `2px dashed ${isDark ? "rgba(220,38,38,0.2)" : "#fecaca"}` }}>
                <Heart size={48} style={{ color: colors.text_muted, opacity: 0.3, marginBottom: 12 }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.text_muted }}>No donors found</div>
                <div style={{ fontSize: 13, color: colors.text_muted, marginTop: 4 }}>Try different filters or be the first to register!</div>
                <button className="bd-btn" onClick={() => setShowDonorForm(true)} style={{ ...btnPrimary, margin: "16px auto 0", width: "fit-content" }}>
                  <UserPlus size={15} /> Become a Donor
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: autoFillGrid(300, bp), gap: 20 }}>
                {filteredDonors.map(donor => (
                  <DonorCard key={donor.id} donor={donor} isDark={isDark} colors={colors} ACCENT={ACCENT} onContact={() => setSelectedDonor(donor)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB: BLOOD REQUESTS */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === "requests" && (
          <div style={{ animation: "slideUp 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: colors.text_primary }}>Blood Requests</h2>
                <p style={{ margin: 0, fontSize: 13, color: colors.text_muted }}>{requests.length} total · {requests.filter(r => r.status === "open" || r.status === "urgent").length} open</p>
              </div>
              <button className="bd-btn" onClick={() => setShowRequestForm(true)} style={btnPrimary}>
                <Plus size={16} /> New Request
              </button>
            </div>
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: autoFillGrid(340, bp), gap: 20 }}>
                {[1,2,3].map(i => <SkeletonCard key={i} isDark={isDark} />)}
              </div>
            ) : requests.length === 0 ? (
              <div style={{ textAlign: "center", padding: 80, background: colors.bg_card, borderRadius: 20, border: `2px dashed ${isDark ? "rgba(220,38,38,0.2)" : "#fecaca"}` }}>
                <Droplets size={48} style={{ color: colors.text_muted, opacity: 0.3, marginBottom: 12 }} />
                <div style={{ fontSize: 15, color: colors.text_muted }}>No blood requests yet</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: autoFillGrid(340, bp), gap: 20 }}>
                {requests.map(req => (
                  <RequestCard key={req.id} req={req} isDark={isDark} colors={colors} ACCENT={ACCENT} onShare={handleShare} onView={() => setSelectedRequest(req)} expanded />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB: EMERGENCY */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === "emergency" && (
          <div style={{ animation: "slideUp 0.4s ease" }}>
            <div style={{ background: "linear-gradient(135deg,#7f1d1d,#dc2626)", borderRadius: 20, padding: "24px 28px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", animation: "emergencyPulse 1.5s infinite" }}>
                <AlertTriangle size={28} color="white" />
              </div>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: "white" }}>Emergency Blood Requests</h2>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                  {emergencyRequests.length} critical request{emergencyRequests.length !== 1 ? "s" : ""} requiring immediate attention
                </p>
              </div>
            </div>

            {emergencyRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: 80, background: colors.bg_card, borderRadius: 20, border: `2px dashed ${isDark ? "rgba(5,150,105,0.3)" : "#a7f3d0"}` }}>
                <CheckCircle size={48} style={{ color: "#059669", marginBottom: 12 }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.text_primary }}>No emergency requests right now</div>
                <div style={{ fontSize: 13, color: colors.text_muted, marginTop: 4 }}>Great news! All critical situations are resolved.</div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 20 }}>
                {emergencyRequests.map(req => (
                  <EmergencyCard key={req.id} req={req} isDark={isDark} colors={colors} onShare={handleShare} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB: COMMUNITY */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === "community" && (
          <div style={{ animation: "slideUp 0.4s ease", maxWidth: 680, margin: "0 auto" }}>
            {/* Create post */}
            <div style={{ background: colors.bg_card, borderRadius: 18, padding: "20px 24px", marginBottom: 20, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#dc2626,#b91c1c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "white", flexShrink: 0 }}>
                  {username.charAt(0).toUpperCase()}
                </div>
                <button onClick={() => setShowPostModal(true)} style={{ flex: 1, padding: "12px 16px", background: isDark ? "rgba(255,255,255,0.04)" : "#f8f8f8", border: `1.5px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb"}`, borderRadius: 12, cursor: "pointer", textAlign: "left", color: colors.text_muted, fontSize: 14, fontFamily: "Inter, sans-serif" }}>
                  Share your donation story or awareness...
                </button>
                <button className="bd-btn" onClick={() => setShowPostModal(true)} style={{ ...btnPrimary, padding: "12px 16px" }}>
                  <Edit3 size={15} />
                </button>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}` }}>
                {[{ type: "story", label: "📖 Story", color: "#2563eb" }, { type: "awareness", label: "💡 Awareness", color: "#059669" }, { type: "request", label: "🩸 Request", color: "#dc2626" }].map(t => (
                  <button key={t.type} onClick={() => { setPostType(t.type); setShowPostModal(true); }} style={{ padding: "7px 14px", background: "transparent", border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`, borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, color: colors.text_secondary, fontFamily: "Inter, sans-serif" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Feed */}
            {loading ? (
              <div style={{ display: "grid", gap: 16 }}>{[1,2,3].map(i => <SkeletonCard key={i} isDark={isDark} />)}</div>
            ) : communityPosts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, background: colors.bg_card, borderRadius: 20, border: `2px dashed ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}` }}>
                <Users size={40} style={{ color: colors.text_muted, opacity: 0.3, marginBottom: 12 }} />
                <div style={{ fontSize: 14, color: colors.text_muted }}>Be the first to share in the community!</div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                {communityPosts.map(post => (
                  <CommunityPostCard key={post.id} post={post} isDark={isDark} colors={colors} ACCENT={ACCENT} onLike={() => handleLike(post.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB: MY ACTIVITY */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === "activity" && (
          <div style={{ animation: "slideUp 0.4s ease" }}>
            {!myProfile ? (
              <div style={{ textAlign: "center", padding: "80px 20px", background: colors.bg_card, borderRadius: 20, border: `2px dashed ${isDark ? "rgba(220,38,38,0.2)" : "#fecaca"}` }}>
                <Heart size={56} style={{ color: "#dc2626", marginBottom: 16, opacity: 0.6 }} />
                <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: colors.text_primary }}>Not Registered as a Donor</h3>
                <p style={{ margin: "0 0 20px", color: colors.text_muted, fontSize: 14 }}>Join our community and start your journey to saving lives!</p>
                <button className="bd-btn" onClick={() => setShowDonorForm(true)} style={{ ...btnPrimary, margin: "0 auto" }}>
                  <UserPlus size={16} /> Become a Donor Now
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: splitSidebarGrid(bp), gap: 24, alignItems: "start" }}>
                {/* Donor Profile Card */}
                <div>
                  <div style={{ background: colors.bg_card, borderRadius: 20, overflow: "hidden", border: `1.5px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}`, marginBottom: 16 }}>
                    <div style={{ background: "linear-gradient(135deg,#7f1d1d,#dc2626)", padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 76, height: 76, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "white", border: "3px solid rgba(255,255,255,0.4)" }}>
                        {myProfile.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "white" }}>{myProfile.full_name}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{myProfile.division} · {myProfile.district}</div>
                      </div>
                      <BloodGroupBadge group={myProfile.blood_group} size="lg" />
                    </div>
                    <div style={{ padding: "20px 24px" }}>
                      {/* Badge */}
                      {(() => {
                        const badge = BADGE_CONFIG[myProfile.donor_badge] || BADGE_CONFIG.new_donor;
                        return (
                          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: isDark ? `${badge.color}18` : badge.bg, borderRadius: 12, marginBottom: 16 }}>
                            <span style={{ fontSize: 20 }}>{badge.icon}</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: badge.color }}>{badge.label}</div>
                              <div style={{ fontSize: 11, color: colors.text_muted }}>Your current badge</div>
                            </div>
                          </div>
                        );
                      })()}
                      <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
                        {[
                          { label: "Total Donations", value: myProfile.total_donations, icon: "🩸" },
                          { label: "Lives Saved", value: `${myProfile.lives_saved}+`, icon: "❤️" },
                          { label: "Available", value: myProfile.is_available ? "Yes" : "No", icon: "✅" },
                          { label: "Emergency", value: myProfile.emergency_available ? "Active" : "Off", icon: "⚡" },
                        ].map((s, i) => (
                          <div key={i} style={{ padding: "12px 14px", background: isDark ? "rgba(255,255,255,0.04)" : "#f8f8f8", borderRadius: 12, textAlign: "center" }}>
                            <div style={{ fontSize: 18 }}>{s.icon}</div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: colors.text_primary }}>{s.value}</div>
                            <div style={{ fontSize: 10, color: colors.text_muted, fontWeight: 600 }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 16, padding: "12px 14px", background: myProfile.is_eligible_to_donate ? (isDark ? "rgba(5,150,105,0.15)" : "#ecfdf5") : (isDark ? "rgba(217,119,6,0.15)" : "#fffbeb"), borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}>
                        {myProfile.is_eligible_to_donate ? <CheckCircle size={16} color="#059669" /> : <Clock size={16} color="#d97706" />}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: myProfile.is_eligible_to_donate ? "#059669" : "#d97706" }}>
                            {myProfile.is_eligible_to_donate ? "Eligible to Donate Now!" : "Not Yet Eligible"}
                          </div>
                          {myProfile.next_eligible_date && (
                            <div style={{ fontSize: 11, color: colors.text_muted }}>
                              Next eligible: {new Date(myProfile.next_eligible_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => {
                      setDonorForm({ ...myProfile });
                      setShowDonorForm(true);
                      setDonorFormStep(1);
                    }} style={{ flex: 1, padding: "12px", background: colors.bg_card, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`, borderRadius: 12, cursor: "pointer", color: colors.text_secondary, fontSize: 13, fontWeight: 700, fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Edit3 size={14} /> Edit Profile
                    </button>
                  </div>
                </div>

                {/* Donation History */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: colors.text_primary }}>Donation Timeline</h3>
                  </div>
                  {donationRecords.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 60, background: colors.bg_card, borderRadius: 18, border: `2px dashed ${isDark ? "rgba(220,38,38,0.2)" : "#fecaca"}` }}>
                      <Droplets size={36} style={{ color: colors.text_muted, opacity: 0.3, marginBottom: 10 }} />
                      <div style={{ fontSize: 14, color: colors.text_muted }}>No donation records yet</div>
                      <div style={{ fontSize: 12, color: colors.text_muted, marginTop: 4 }}>Records will appear after you donate</div>
                    </div>
                  ) : (
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 2, background: isDark ? "rgba(220,38,38,0.2)" : "#fecaca", borderRadius: 2 }} />
                      {donationRecords.map((rec, i) => (
                        <div key={rec.id} style={{ display: "flex", gap: 20, marginBottom: 16, paddingLeft: 52, position: "relative" }}>
                          <div style={{ position: "absolute", left: 11, top: 12, width: 20, height: 20, borderRadius: "50%", background: rec.verified ? "#dc2626" : "#d97706", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid white", boxShadow: "0 0 0 2px rgba(220,38,38,0.2)", zIndex: 1 }}>
                            <Droplets size={10} color="white" />
                          </div>
                          <div style={{ flex: 1, background: colors.bg_card, borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}` }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: colors.text_primary }}>
                                Donated to {rec.donated_to || "Anonymous"}
                              </span>
                              <span style={{ fontSize: 11, color: colors.text_muted }}>
                                {new Date(rec.donation_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: colors.text_muted }}>{rec.hospital || "Hospital not specified"} · {rec.bags} bag{rec.bags > 1 ? "s" : ""}</div>
                            {rec.verified && <span style={{ fontSize: 10, color: "#059669", fontWeight: 700 }}>✓ Verified</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODALS */}
      {/* ════════════════════════════════════════════════════════════════════ */}

      {/* ── DONOR REGISTRATION MODAL ── */}
      {showDonorForm && (
        <Modal onClose={() => { setShowDonorForm(false); setDonorFormStep(1); }} isDark={isDark} colors={colors}
          title="Become a Blood Donor" subtitle="Join our community and help save lives"
          headerGrad="linear-gradient(135deg,#7f1d1d,#dc2626)"
        >
          {/* Step indicator */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[{ n: 1, label: "Profile" }, { n: 2, label: "Location" }, { n: 3, label: "Medical" }].map(step => (
              <div key={step.n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: donorFormStep >= step.n ? "#dc2626" : (isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: donorFormStep >= step.n ? "white" : colors.text_muted, transition: "all 0.3s" }}>{step.n}</div>
                <div style={{ fontSize: 11, color: donorFormStep >= step.n ? "#dc2626" : colors.text_muted, fontWeight: 600 }}>{step.label}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 2, background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6", borderRadius: 2, marginBottom: 24, position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${((donorFormStep - 1) / 2) * 100}%`, background: "linear-gradient(90deg,#dc2626,#ef4444)", borderRadius: 2, transition: "width 0.4s ease" }} />
          </div>

          {/* Step 1: Profile */}
          {donorFormStep === 1 && (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
                <div>
                  <label style={labelStyle}>FULL NAME *</label>
                  <input style={inputStyle} placeholder="Your full name" value={donorForm.full_name} onChange={e => setDonorForm(p => ({ ...p, full_name: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>BLOOD GROUP *</label>
                  <select style={selectStyle} value={donorForm.blood_group} onChange={e => setDonorForm(p => ({ ...p, blood_group: e.target.value }))}>
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
                <div>
                  <label style={labelStyle}>PHONE NUMBER *</label>
                  <input style={inputStyle} placeholder="+880 XXXX-XXXXXX" value={donorForm.phone} onChange={e => setDonorForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>EMAIL</label>
                  <input style={inputStyle} type="email" placeholder="your@email.com" value={donorForm.email} onChange={e => setDonorForm(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: formGridCols3(bp), gap: 12 }}>
                <div>
                  <label style={labelStyle}>GENDER *</label>
                  <select style={selectStyle} value={donorForm.gender} onChange={e => setDonorForm(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>DATE OF BIRTH</label>
                  <input style={inputStyle} type="date" value={donorForm.date_of_birth} onChange={e => setDonorForm(p => ({ ...p, date_of_birth: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>WEIGHT (KG)</label>
                  <input style={inputStyle} type="number" placeholder="e.g. 60" min="50" value={donorForm.weight} onChange={e => setDonorForm(p => ({ ...p, weight: e.target.value }))} />
                </div>
              </div>
              {donorForm.blood_group && (
                <div style={{ padding: "14px 16px", background: isDark ? "rgba(220,38,38,0.1)" : "#fef2f2", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
                  <BloodGroupBadge group={donorForm.blood_group} size="md" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>Blood Group Preview</div>
                    <div style={{ fontSize: 11, color: colors.text_muted }}>Compatible for donation to multiple blood types</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Location */}
          {donorFormStep === 2 && (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
                <div>
                  <label style={labelStyle}>DIVISION</label>
                  <select style={selectStyle} value={donorForm.division} onChange={e => setDonorForm(p => ({ ...p, division: e.target.value, district: "", upazila: "" }))}>
                    <option value="">Select Division</option>
                    {Object.entries(BD_LOCATIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>DISTRICT</label>
                  <select style={selectStyle} value={donorForm.district} onChange={e => setDonorForm(p => ({ ...p, district: e.target.value, upazila: "" }))} disabled={!donorForm.division}>
                    <option value="">Select District</option>
                    {donorDistricts.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
                <div>
                  <label style={labelStyle}>UPAZILA</label>
                  <select style={selectStyle} value={donorForm.upazila} onChange={e => setDonorForm(p => ({ ...p, upazila: e.target.value }))} disabled={!donorForm.district}>
                    <option value="">Select Upazila</option>
                    {donorUpazilas.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>LAST DONATION DATE</label>
                  <input style={inputStyle} type="date" value={donorForm.last_donation_date} onChange={e => setDonorForm(p => ({ ...p, last_donation_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>ADDRESS</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} placeholder="Your detailed address..." value={donorForm.address} onChange={e => setDonorForm(p => ({ ...p, address: e.target.value }))} />
              </div>
            </div>
          )}

          {/* Step 3: Medical & Availability */}
          {donorFormStep === 3 && (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
                <div style={{ padding: "16px", background: isDark ? "rgba(5,150,105,0.1)" : "#ecfdf5", borderRadius: 14, border: `1.5px solid ${isDark ? "rgba(5,150,105,0.2)" : "#a7f3d0"}`, cursor: "pointer" }} onClick={() => setDonorForm(p => ({ ...p, is_available: !p.is_available }))}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>Available to Donate</span>
                    <div style={{ width: 42, height: 24, borderRadius: 12, background: donorForm.is_available ? "#059669" : (isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"), position: "relative", transition: "background 0.2s" }}>
                      <div style={{ position: "absolute", top: 3, left: donorForm.is_available ? 20 : 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: colors.text_muted }}>Show as available in donor search</div>
                </div>
                <div style={{ padding: "16px", background: isDark ? "rgba(220,38,38,0.1)" : "#fef2f2", borderRadius: 14, border: `1.5px solid ${isDark ? "rgba(220,38,38,0.2)" : "#fecaca"}`, cursor: "pointer" }} onClick={() => setDonorForm(p => ({ ...p, emergency_available: !p.emergency_available }))}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>⚡ Emergency Available</span>
                    <div style={{ width: 42, height: 24, borderRadius: 12, background: donorForm.emergency_available ? "#dc2626" : (isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"), position: "relative", transition: "background 0.2s" }}>
                      <div style={{ position: "absolute", top: 3, left: donorForm.emergency_available ? 20 : 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: colors.text_muted }}>Available 24/7 for emergencies</div>
                </div>
              </div>
              <div>
                <label style={labelStyle}>MEDICAL NOTES (OPTIONAL)</label>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} placeholder="Any medical conditions, medications, or notes for recipients..." value={donorForm.medical_notes} onChange={e => setDonorForm(p => ({ ...p, medical_notes: e.target.value }))} />
              </div>
              <div style={{ padding: "14px 16px", background: isDark ? "rgba(37,99,235,0.1)" : "#eff6ff", borderRadius: 12, fontSize: 12, color: colors.text_secondary, lineHeight: 1.7 }}>
                ℹ️ <strong>Eligibility:</strong> You must weigh at least 50kg, be 18–65 years old, and not have donated blood in the last 90 days. By registering, you agree to be contacted for blood donation requests.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            {donorFormStep > 1 && (
              <button onClick={() => setDonorFormStep(s => s - 1)} style={{ flex: 1, padding: "13px", background: colors.bg_secondary, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`, borderRadius: 12, fontWeight: 700, cursor: "pointer", color: colors.text_secondary, fontFamily: "Inter, sans-serif" }}>
                ← Back
              </button>
            )}
            {donorFormStep < 3 ? (
              <button onClick={() => {
                if (donorFormStep === 1 && (!donorForm.full_name || !donorForm.blood_group || !donorForm.phone || !donorForm.gender)) {
                  toast.error("Please fill in required fields."); return;
                }
                setDonorFormStep(s => s + 1);
              }} style={{ ...btnPrimary, flex: 1, justifyContent: "center" }}>
                Next Step →
              </button>
            ) : (
              <button onClick={handleDonorSubmit} disabled={submitting} style={{ ...btnPrimary, flex: 1, justifyContent: "center", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Registering..." : "🎉 Register as Donor"}
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* ── BLOOD REQUEST MODAL ── */}
      {showRequestForm && (
        <Modal onClose={() => setShowRequestForm(false)} isDark={isDark} colors={colors}
          title="Create Blood Request" subtitle="Fill in patient details to find matching donors"
          headerGrad="linear-gradient(135deg,#4f46e5,#7c3aed)"
        >
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
              <div>
                <label style={labelStyle}>PATIENT NAME *</label>
                <input style={inputStyle} placeholder="Patient's full name" value={requestForm.patient_name} onChange={e => setRequestForm(p => ({ ...p, patient_name: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>BLOOD GROUP NEEDED *</label>
                <select style={selectStyle} value={requestForm.blood_group} onChange={e => setRequestForm(p => ({ ...p, blood_group: e.target.value }))}>
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: formGridCols3(bp), gap: 12 }}>
              <div>
                <label style={labelStyle}>BAGS NEEDED *</label>
                <input style={inputStyle} type="number" min="1" max="10" value={requestForm.bags_needed} onChange={e => setRequestForm(p => ({ ...p, bags_needed: parseInt(e.target.value) || 1 }))} />
              </div>
              <div>
                <label style={labelStyle}>URGENCY *</label>
                <select style={selectStyle} value={requestForm.urgency} onChange={e => setRequestForm(p => ({ ...p, urgency: e.target.value }))}>
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent (within 24h)</option>
                  <option value="critical">Critical (immediately!)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>REQUIRED DATE</label>
                <input style={inputStyle} type="date" value={requestForm.required_date} onChange={e => setRequestForm(p => ({ ...p, required_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>HOSPITAL NAME *</label>
              <input style={inputStyle} placeholder="Name of hospital" value={requestForm.hospital_name} onChange={e => setRequestForm(p => ({ ...p, hospital_name: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
              <div>
                <label style={labelStyle}>DIVISION</label>
                <select style={selectStyle} value={requestForm.division} onChange={e => setRequestForm(p => ({ ...p, division: e.target.value, district: "" }))}>
                  <option value="">Select Division</option>
                  {Object.entries(BD_LOCATIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>DISTRICT</label>
                <select style={selectStyle} value={requestForm.district} onChange={e => setRequestForm(p => ({ ...p, district: e.target.value }))} disabled={!requestForm.division}>
                  <option value="">Select District</option>
                  {requestDistricts.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
              <div>
                <label style={labelStyle}>CONTACT PERSON *</label>
                <input style={inputStyle} placeholder="Contact person name" value={requestForm.contact_person} onChange={e => setRequestForm(p => ({ ...p, contact_person: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>CONTACT NUMBER *</label>
                <input style={inputStyle} placeholder="+880 XXXX-XXXXXX" value={requestForm.contact_number} onChange={e => setRequestForm(p => ({ ...p, contact_number: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>ADDITIONAL NOTES</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} placeholder="Any additional information..." value={requestForm.additional_notes} onChange={e => setRequestForm(p => ({ ...p, additional_notes: e.target.value }))} />
            </div>
            {requestForm.urgency === "critical" && (
              <div style={{ padding: "12px 14px", background: isDark ? "rgba(220,38,38,0.12)" : "#fef2f2", borderRadius: 12, display: "flex", alignItems: "center", gap: 8, border: "1px solid rgba(220,38,38,0.2)" }}>
                <AlertTriangle size={16} color="#dc2626" style={{ animation: "heartbeat 1.5s infinite" }} />
                <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 700 }}>CRITICAL request will be highlighted in the emergency section immediately!</span>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12, marginTop: 8 }}>
              <button onClick={() => setShowRequestForm(false)} style={{ padding: "13px", background: colors.bg_secondary, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`, borderRadius: 12, fontWeight: 700, cursor: "pointer", color: colors.text_secondary, fontFamily: "Inter, sans-serif" }}>
                Cancel
              </button>
              <button onClick={handleRequestSubmit} disabled={submitting} style={{ ...btnPrimary, justifyContent: "center", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 6px 20px rgba(79,70,229,0.35)", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Posting..." : "📢 Post Request"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── COMMUNITY POST MODAL ── */}
      {showPostModal && (
        <Modal onClose={() => setShowPostModal(false)} isDark={isDark} colors={colors}
          title="Share with Community" subtitle="Inspire others with your story"
          headerGrad="linear-gradient(135deg,#059669,#0d9488)"
        >
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={labelStyle}>POST TYPE</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ type: "story", label: "📖 Story" }, { type: "awareness", label: "💡 Awareness" }, { type: "request", label: "🩸 Request Share" }].map(t => (
                  <button key={t.type} onClick={() => setPostType(t.type)} style={{ flex: 1, padding: "10px", background: postType === t.type ? "#059669" : (isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6"), border: `1.5px solid ${postType === t.type ? "#059669" : (isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb")}`, borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: postType === t.type ? "white" : colors.text_secondary, fontFamily: "Inter, sans-serif", transition: "all 0.2s" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>YOUR MESSAGE</label>
              <textarea style={{ ...inputStyle, minHeight: 140, resize: "vertical" }} placeholder="Share your donation experience, awareness message, or blood request details..." value={postContent} onChange={e => setPostContent(e.target.value)} />
              <div style={{ textAlign: "right", fontSize: 11, color: colors.text_muted, marginTop: 4 }}>{postContent.length}/500</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
              <button onClick={() => setShowPostModal(false)} style={{ padding: "13px", background: colors.bg_secondary, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`, borderRadius: 12, fontWeight: 700, cursor: "pointer", color: colors.text_secondary, fontFamily: "Inter, sans-serif" }}>
                Cancel
              </button>
              <button onClick={handlePostSubmit} disabled={submitting} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", background: "linear-gradient(135deg,#059669,#047857)", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: submitting ? "wait" : "pointer", fontFamily: "Inter, sans-serif", opacity: submitting ? 0.7 : 1 }}>
                <Send size={15} /> {submitting ? "Posting..." : "Share Post"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── DONOR CONTACT MODAL ── */}
      {selectedDonor && (
        <Modal onClose={() => setSelectedDonor(null)} isDark={isDark} colors={colors}
          title="Contact Donor" subtitle="Please be respectful and only contact for genuine needs"
          headerGrad="linear-gradient(135deg,#7f1d1d,#dc2626)"
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <BloodGroupBadge group={selectedDonor.blood_group} size="lg" />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: colors.text_primary }}>{selectedDonor.full_name}</div>
              <div style={{ fontSize: 13, color: colors.text_muted, marginTop: 4 }}>{selectedDonor.division} · {selectedDonor.district}</div>
            </div>
            {(() => {
              const badge = BADGE_CONFIG[selectedDonor.donor_badge] || BADGE_CONFIG.new_donor;
              return <span style={{ padding: "5px 14px", borderRadius: 20, background: isDark ? `${badge.color}18` : badge.bg, color: badge.color, fontSize: 12, fontWeight: 700 }}>{badge.icon} {badge.label}</span>;
            })()}
          </div>
          <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total Donations", value: `${selectedDonor.total_donations} times`, icon: Droplets },
              { label: "Last Donation", value: selectedDonor.last_donation_date ? new Date(selectedDonor.last_donation_date).toLocaleDateString() : "Never", icon: Calendar },
              { label: "Eligible to Donate", value: selectedDonor.is_eligible_to_donate ? "Yes ✓" : "Not yet", icon: CheckCircle },
            ].map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: isDark ? "rgba(255,255,255,0.04)" : "#f8f8f8", borderRadius: 12 }}>
                  <ItemIcon size={16} color="#dc2626" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: colors.text_muted, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: colors.text_primary }}>{item.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
            {selectedDonor.phone && (
              <a href={`tel:${selectedDonor.phone}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "white", borderRadius: 12, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
                <Phone size={16} /> Call Donor
              </a>
            )}
            {selectedDonor.email && (
              <a href={`mailto:${selectedDonor.email}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", background: colors.bg_secondary, color: "#2563eb", border: `1.5px solid #2563eb`, borderRadius: 12, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
                <Mail size={16} /> Email Donor
              </a>
            )}
          </div>
        </Modal>
      )}

      {/* ── REQUEST DETAIL MODAL ── */}
      {selectedRequest && (() => {
        const req = selectedRequest;
        const urgCfg = URGENCY_COLORS[req.urgency] || URGENCY_COLORS.normal;
        const stsCfg = STATUS_COLORS[req.status] || STATUS_COLORS.open;
        return (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(10px)", padding: 20 }}
            onClick={e => e.target === e.currentTarget && setSelectedRequest(null)}
          >
            <div style={{ width: "100%", maxWidth: 560, maxHeight: "94vh", overflowY: "auto", background: isDark ? "#1e293b" : "#fff", borderRadius: 26, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6"}`, boxShadow: "0 40px 120px rgba(0,0,0,0.35)", animation: "slideUp 0.3s ease" }}>

              {/* Header */}
              <div style={{ background: req.urgency === "critical" ? "linear-gradient(135deg,#7f1d1d,#dc2626)" : "linear-gradient(135deg,#4f46e5,#7c3aed)", padding: "28px 32px", borderRadius: "24px 24px 0 0", position: "relative" }}>
                {req.urgency === "critical" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "rgba(255,255,255,0.2)", borderRadius: 8, marginBottom: 14, width: "fit-content" }}>
                    <AlertTriangle size={12} color="white" style={{ animation: "heartbeat 1.5s infinite" }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: "white", letterSpacing: "0.5px" }}>CRITICAL — IMMEDIATE RESPONSE NEEDED</span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <BloodGroupBadge group={req.blood_group} size="lg" />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 4 }}>{req.patient_name}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 6 }}>
                      <MapPin size={13} /> {req.hospital_name}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <span style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, background: isDark ? urgCfg.darkBg : "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}>{req.urgency.toUpperCase()}</span>
                  <span style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: isDark ? stsCfg.darkBg : "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)" }}>{req.status.replace("_", " ").toUpperCase()}</span>
                </div>
                <button onClick={() => setSelectedRequest(null)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: "28px 32px" }}>

                {/* Key info grid */}
                <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12, marginBottom: 22 }}>
                  {[
                    { label: "Blood Group Needed", value: req.blood_group, icon: Droplets, color: BLOOD_GROUP_COLORS[req.blood_group] || "#dc2626" },
                    { label: "Bags Required", value: `${req.bags_needed} bag${req.bags_needed > 1 ? "s" : ""}`, icon: Activity, color: "#7c3aed" },
                    { label: "Hospital", value: req.hospital_name, icon: MapPin, color: "#2563eb" },
                    { label: "Location", value: [req.district, req.division].filter(Boolean).map(v => v.replace(/_/g, " ")).join(", ") || "Not specified", icon: MapPin, color: "#059669" },
                    { label: "Contact Person", value: req.contact_person || "—", icon: Users, color: "#d97706" },
                    { label: "Contact Number", value: req.contact_number || "—", icon: Phone, color: "#dc2626" },
                    { label: "Required By", value: req.required_date ? new Date(req.required_date).toLocaleDateString("en-BD", { weekday: "short", year: "numeric", month: "short", day: "numeric" }) : "Not specified", icon: Calendar, color: "#0d9488" },
                    { label: "Posted On", value: new Date(req.created_at).toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric" }), icon: Clock, color: "#6b7280" },
                  ].filter(i => i.value && i.value !== "—" || i.label === "Contact Person").map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: isDark ? "rgba(255,255,255,0.04)" : "#f8faff", borderRadius: 13, border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#eff0f6"}` }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <ItemIcon size={14} color={item.color} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: colors.text_muted, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 3 }}>{item.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: colors.text_primary, wordBreak: "break-word" }}>{item.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Countdown timer for urgent */}
                {req.required_date && (req.urgency === "critical" || req.urgency === "urgent") && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: isDark ? "rgba(220,38,38,0.1)" : "#fef2f2", borderRadius: 14, marginBottom: 18, border: "1px solid rgba(220,38,38,0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock size={16} color="#dc2626" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>Time Remaining</span>
                    </div>
                    <CountdownTimer targetDate={req.required_date} colors={colors} />
                  </div>
                )}

                {/* Additional notes */}
                {req.additional_notes && (
                  <div style={{ padding: "14px 16px", background: isDark ? "rgba(255,255,255,0.04)" : "#f8f8f8", borderRadius: 13, marginBottom: 20, border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#ebebeb"}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: colors.text_muted, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 8 }}>Additional Notes</div>
                    <p style={{ margin: 0, fontSize: 14, color: colors.text_secondary, lineHeight: 1.7 }}>{req.additional_notes}</p>
                  </div>
                )}

                {/* Requested by */}
                {req.requested_by_username && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: isDark ? "rgba(124,58,237,0.1)" : "#f5f3ff", borderRadius: 11, marginBottom: 20, border: "1px solid rgba(124,58,237,0.15)" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white", flexShrink: 0 }}>
                      {req.requested_by_username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: colors.text_muted, fontWeight: 600, textTransform: "uppercase" }}>Posted by</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed" }}>@{req.requested_by_username}</div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 12 }}>
                  <a
                    href={`tel:${req.contact_number}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "white", borderRadius: 14, textDecoration: "none", fontSize: 14, fontWeight: 800, boxShadow: "0 6px 20px rgba(220,38,38,0.4)" }}
                  >
                    <Phone size={16} /> 📞 Call Now
                  </a>
                  <button
                    onClick={() => { handleShare(req.id); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6", border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`, borderRadius: 14, cursor: "pointer", fontSize: 14, fontWeight: 700, color: colors.text_secondary, fontFamily: "Inter, sans-serif" }}
                  >
                    <Share2 size={16} /> Share Request
                  </button>
                </div>

                {req.contact_number && (
                  <a
                    href={`https://wa.me/${req.contact_number.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", background: "linear-gradient(135deg,#25d366,#128c7e)", color: "white", borderRadius: 14, textDecoration: "none", fontSize: 14, fontWeight: 700, marginTop: 12, boxShadow: "0 4px 14px rgba(37,211,102,0.3)" }}
                  >
                    💬 WhatsApp Contact
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

function Modal({ children, onClose, isDark, colors, title, subtitle, headerGrad }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(8px)", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cc-modal" style={{ width: "100%", maxWidth: 600, maxHeight: "92vh", overflowY: "auto", background: isDark ? "#1e293b" : "#fff", borderRadius: 24, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6"}`, boxShadow: "0 40px 100px rgba(0,0,0,0.3)", animation: "slideUp 0.3s ease" }}>
        <div style={{ background: headerGrad, padding: "28px 32px", position: "relative", borderRadius: "22px 22px 0 0" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900, color: "white" }}>{title}</h2>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{subtitle}</p>
          <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: "28px 32px" }}>{children}</div>
      </div>
    </div>
  );
}

function DonorCard({ donor, isDark, colors, ACCENT, onContact }) {
  const bp = useBreakpoint();
  const badge = BADGE_CONFIG[donor.donor_badge] || BADGE_CONFIG.new_donor;
  return (
    <div className="bd-card" style={{
      background: isDark ? "#1e293b" : "#fff", borderRadius: 18, padding: 22,
      border: `1.5px solid ${isDark ? "rgba(255,255,255,0.06)" : "#fef2f2"}`,
      boxShadow: `0 4px 16px rgba(0,0,0,${isDark ? "0.15" : "0.04"})`,
      cursor: "default", transition: "all 0.25s cubic-bezier(0.34,1.2,0.64,1)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
        <div style={{ position: "relative" }}>
          <BloodGroupBadge group={donor.blood_group} size="md" />
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderRadius: "50%", background: donor.is_available ? "#059669" : "#9ca3af", border: "2px solid white" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: colors.text_primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{donor.full_name}</span>
            {donor.is_verified && <Shield size={13} color="#059669" title="Verified Donor" />}
            {donor.emergency_available && <Zap size={13} color="#dc2626" title="Emergency Available" />}
          </div>
          <div style={{ fontSize: 12, color: colors.text_muted, display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={11} color={ACCENT} />{donor.district || donor.division || "Location not set"}
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, padding: "3px 10px", borderRadius: 20, background: isDark ? `${badge.color}18` : badge.bg, fontSize: 11, fontWeight: 700, color: badge.color }}>
            {badge.icon} {badge.label}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: formGridCols(bp), gap: 8, marginBottom: 14 }}>
        <div style={{ padding: "8px 10px", background: isDark ? "rgba(255,255,255,0.04)" : "#f8f8f8", borderRadius: 10 }}>
          <div style={{ fontSize: 10, color: colors.text_muted, fontWeight: 600 }}>DONATIONS</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: ACCENT }}>{donor.total_donations}×</div>
        </div>
        <div style={{ padding: "8px 10px", background: isDark ? "rgba(255,255,255,0.04)" : "#f8f8f8", borderRadius: 10 }}>
          <div style={{ fontSize: 10, color: colors.text_muted, fontWeight: 600 }}>LAST DONATED</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: colors.text_primary }}>
            {donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString("en-BD", { day: "2-digit", month: "short" }) : "Never"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}` }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: donor.is_available ? "#059669" : "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: donor.is_available ? "#059669" : "#9ca3af" }} />
          {donor.is_available ? "Available" : "Unavailable"}
        </span>
        <button className="bd-btn" onClick={onContact} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "white", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif", boxShadow: "0 3px 10px rgba(220,38,38,0.3)" }}>
          <Phone size={12} /> Contact
        </button>
      </div>
    </div>
  );
}

function RequestCard({ req, isDark, colors, ACCENT, onShare, onView, expanded }) {
  const urgCfg = URGENCY_COLORS[req.urgency] || URGENCY_COLORS.normal;
  const stsCfg = STATUS_COLORS[req.status] || STATUS_COLORS.open;
  return (
    <div
      className="bd-card"
      onClick={onView}
      style={{
        background: isDark ? "#1e293b" : "#fff", borderRadius: 18, padding: 22,
        border: `1.5px solid ${req.urgency === "critical" ? "rgba(220,38,38,0.35)" : (isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6")}`,
        boxShadow: req.urgency === "critical" ? "0 8px 24px rgba(220,38,38,0.15)" : `0 4px 16px rgba(0,0,0,${isDark ? "0.15" : "0.04"})`,
        cursor: "pointer", transition: "all 0.25s cubic-bezier(0.34,1.2,0.64,1)",
        position: "relative",
      }}
    >
      {/* Click hint */}
      <div style={{ position: "absolute", top: 14, right: 14, display: "flex", alignItems: "center", gap: 4, padding: "3px 9px", background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6", borderRadius: 8, fontSize: 10, fontWeight: 700, color: colors.text_muted }}>
        <Eye size={11} /> Details
      </div>

      {req.urgency === "critical" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "linear-gradient(135deg,#7f1d1d,#dc2626)", borderRadius: 10, marginBottom: 12, animation: "emergencyPulse 2s infinite" }}>
          <AlertTriangle size={13} color="white" />
          <span style={{ fontSize: 11, fontWeight: 800, color: "white", letterSpacing: "0.5px" }}>CRITICAL — IMMEDIATE RESPONSE NEEDED</span>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <BloodGroupBadge group={req.blood_group} size="md" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: colors.text_primary, marginBottom: 3, paddingRight: 60 }}>{req.patient_name}</div>
          <div style={{ fontSize: 12, color: colors.text_muted, display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={11} color={ACCENT} />{req.hospital_name}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
          <span style={{ padding: "3px 9px", borderRadius: 8, fontSize: 10, fontWeight: 800, background: isDark ? urgCfg.darkBg : urgCfg.bg, color: urgCfg.color }}>{req.urgency.toUpperCase()}</span>
          <span style={{ padding: "3px 9px", borderRadius: 8, fontSize: 10, fontWeight: 700, background: isDark ? stsCfg.darkBg : stsCfg.bg, color: stsCfg.color }}>{req.status.replace("_", " ").toUpperCase()}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, fontSize: 12, color: colors.text_muted }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Droplets size={12} color={ACCENT} />{req.bags_needed} bag{req.bags_needed > 1 ? "s" : ""} needed</span>
        {req.district && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} />{req.district}</span>}
        {req.required_date && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} />{new Date(req.required_date).toLocaleDateString()}</span>}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}` }}>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={`tel:${req.contact_number}`} onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "white", borderRadius: 9, textDecoration: "none", fontSize: 12, fontWeight: 700, boxShadow: "0 3px 10px rgba(220,38,38,0.3)" }}>
            <Phone size={12} /> Call
          </a>
          <button onClick={e => { e.stopPropagation(); onShare(req.id); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: "transparent", border: `1.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`, borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700, color: colors.text_secondary, fontFamily: "Inter, sans-serif" }}>
            <Share2 size={12} /> Share
          </button>
        </div>
        <span style={{ fontSize: 11, color: colors.text_muted }}>
          {new Date(req.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

function EmergencyCard({ req, isDark, colors, onShare }) {
  const stsCfg = STATUS_COLORS[req.status] || STATUS_COLORS.open;
  return (
    <div style={{
      background: isDark ? "#1e293b" : "#fff",
      borderRadius: 20,
      border: "2px solid rgba(220,38,38,0.4)",
      overflow: "hidden",
      boxShadow: "0 8px 30px rgba(220,38,38,0.2)",
      animation: "slideUp 0.3s ease",
    }}>
      <div style={{ background: "linear-gradient(135deg,#7f1d1d,#dc2626)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ animation: "emergencyPulse 1.5s infinite" }}>
            <BloodGroupBadge group={req.blood_group} size="md" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "white" }}>{req.patient_name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{req.hospital_name}</div>
          </div>
        </div>
        {req.required_date && (
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 6, fontWeight: 600 }}>TIME LEFT</div>
            <CountdownTimer targetDate={req.required_date} colors={colors} />
          </div>
        )}
      </div>
      <div style={{ padding: "18px 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Bags Needed", value: `${req.bags_needed} bag${req.bags_needed > 1 ? "s" : ""}`, icon: Droplets },
            { label: "Location", value: `${req.district || ""}${req.district && req.division ? ", " : ""}${req.division || ""}` || "Not specified", icon: MapPin },
            { label: "Contact", value: req.contact_person, icon: Users },
            { label: "Status", value: req.status.replace("_", " "), icon: Activity },
          ].filter(i => i.value).map((item, i) => {
            const ItemIcon = item.icon;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: isDark ? "rgba(255,255,255,0.04)" : "#fef2f2", borderRadius: 10 }}>
                <ItemIcon size={13} color="#dc2626" />
                <div>
                  <div style={{ fontSize: 9, color: colors.text_muted, fontWeight: 700, textTransform: "uppercase" }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors.text_primary }}>{item.value}</div>
                </div>
              </div>
            );
          })}
        </div>
        {req.additional_notes && (
          <div style={{ padding: "10px 14px", background: isDark ? "rgba(255,255,255,0.04)" : "#f8f8f8", borderRadius: 10, fontSize: 13, color: colors.text_secondary, marginBottom: 16, lineHeight: 1.6 }}>
            {req.additional_notes}
          </div>
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <a href={`tel:${req.contact_number}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "white", borderRadius: 12, textDecoration: "none", fontSize: 14, fontWeight: 800, boxShadow: "0 6px 20px rgba(220,38,38,0.4)", animation: "emergencyPulse 2s infinite" }}>
            <Phone size={16} /> 📞 Call Now — {req.contact_number}
          </a>
          <button onClick={() => onShare(req.id)} style={{ padding: "13px 18px", background: "transparent", border: `2px solid rgba(220,38,38,0.3)`, borderRadius: 12, cursor: "pointer", color: "#dc2626", fontSize: 13, fontWeight: 700, fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>
    </div>
  );
}

function CommunityPostCard({ post, isDark, colors, ACCENT, onLike }) {
  const [showComments, setShowComments] = useState(false);
  const typeColors = { story: "#2563eb", awareness: "#059669", request: "#dc2626" };
  const typeLabels = { story: "📖 Story", awareness: "💡 Awareness", request: "🩸 Request" };
  return (
    <div className="bd-card" style={{
      background: isDark ? "#1e293b" : "#fff", borderRadius: 18,
      border: `1.5px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}`,
      boxShadow: `0 4px 16px rgba(0,0,0,${isDark ? "0.15" : "0.04"})`,
      transition: "all 0.25s cubic-bezier(0.34,1.2,0.64,1)", overflow: "hidden",
    }}>
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg,#dc2626,#b91c1c)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "white", flexShrink: 0 }}>
            {(post.author_name || post.author_username || "?").charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: colors.text_primary }}>{post.author_name || post.author_username}</span>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: isDark ? `${typeColors[post.post_type]}20` : `${typeColors[post.post_type]}15`, color: typeColors[post.post_type], fontWeight: 700 }}>
                {typeLabels[post.post_type] || post.post_type}
              </span>
            </div>
            <div style={{ fontSize: 11, color: colors.text_muted, marginTop: 2 }}>{new Date(post.created_at).toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" })}</div>
          </div>
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 14, color: colors.text_secondary, lineHeight: 1.7 }}>{post.content}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 14, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}` }}>
          <button className="like-btn" onClick={onLike} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: post.is_liked ? "#dc2626" : colors.text_muted, fontSize: 13, fontWeight: 700, fontFamily: "Inter, sans-serif", transition: "all 0.2s" }}>
            <Heart size={15} fill={post.is_liked ? "#dc2626" : "none"} /> {post.likes_count || 0}
          </button>
          <button onClick={() => setShowComments(s => !s)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: colors.text_muted, fontSize: 13, fontWeight: 700, fontFamily: "Inter, sans-serif" }}>
            <MessageCircle size={15} /> {post.comments_count || 0}
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: colors.text_muted, fontSize: 13, fontWeight: 700, fontFamily: "Inter, sans-serif", marginLeft: "auto" }}>
            <Share2 size={14} /> Share
          </button>
        </div>
        {showComments && post.comments?.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}` }}>
            {post.comments.slice(-3).map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "white", flexShrink: 0 }}>
                  {c.user.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, background: isDark ? "rgba(255,255,255,0.04)" : "#f8f8f8", borderRadius: 10, padding: "8px 12px" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.text_primary }}>{c.user}</span>
                  <span style={{ fontSize: 12, color: colors.text_secondary, marginLeft: 6 }}>{c.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
