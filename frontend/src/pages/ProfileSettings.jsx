import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, ShieldCheck, Key, LogOut, Camera, UploadCloud, CheckCircle2, AlertCircle, Clock, Save, Phone, Mail } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage, useTheme, useBreakpoint } from "../hooks";
import { getThemeColors } from "../utils/themeColors";
import ThemeLanguageSwitcher from "../components/ThemeLanguageSwitcher";
import FloatingBackButton from "../components/FloatingBackButton";
import ImageCropModal from "../components/ImageCropModal";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { BASE_URL } from "../services/api";

const DEPARTMENTS = ["CSE", "EEE", "BBA", "English", "Civil", "Law", "Architecture"];

export default function ProfileSettings({ defaultTab = "general" }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const bp = useBreakpoint();
  const colors = getThemeColors(theme);
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(location.state?.tab || defaultTab);

  // Mocked state
  const [username, setUsername] = useState("Student");
  const [email, setEmail] = useState("student@bubt.edu.bd");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [bio, setBio] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("unverified"); // unverified, pending, verified
  
  const { user, updateUser, logout } = useAuth();
  
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  
  const [verForm, setVerForm] = useState({
    department: "",
    intake: "",
    semester: "",
    idFront: null,
    idBack: null
  });

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropType, setCropType] = useState(null); // 'profile' or 'cover'

  useEffect(() => {
    if (user) {
      setUsername(user.first_name || user.username || "");
      setEmail(user.university_email || "");
      setPhone(user.phone_number || "");
      setBloodGroup(user.blood_group || "");
      setBio(user.bio || "");
      if (user.profile_picture) setProfilePreview(`${BASE_URL}${user.profile_picture}`);
      if (user.cover_photo) setCoverPreview(`${BASE_URL}${user.cover_photo}`);
      setVerificationStatus(user.verified ? "verified" : "unverified");
    }
  }, [user]);

  const handleSaveChanges = async () => {
    try {
      const toastId = toast.loading("Saving changes...");
      const token = localStorage.getItem("access");
      
      const payload = {
        first_name: username,
        phone_number: phone,
        university_email: email,
        blood_group: bloodGroup,
        bio: bio
      };

      if (profilePreview && profilePreview.startsWith("data:")) {
        payload.profile_picture = profilePreview;
      }
      if (coverPreview && coverPreview.startsWith("data:")) {
        payload.cover_photo = coverPreview;
      }

      const res = await axios.patch(`${BASE_URL}/api/profile/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      updateUser(res.data);
      toast.success("Profile updated successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Failed to save changes.");
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!verForm.department || !verForm.intake || !verForm.semester) {
      toast.error("Please fill all required fields");
      return;
    }
    
    try {
      const toastId = toast.loading("Submitting verification...");
      const token = localStorage.getItem("access");
      const formData = new FormData();
      formData.append("department", verForm.department);
      formData.append("intake", verForm.intake);
      formData.append("semester", verForm.semester);
      if (verForm.idFront) formData.append("id_front", verForm.idFront);
      if (verForm.idBack) formData.append("id_back", verForm.idBack);
      formData.append("verified", "true"); // Optimistic verification

      const res = await axios.patch(`${BASE_URL}/api/profile/`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      
      updateUser(res.data);
      toast.success("Verification successful! Welcome to CampusConnect.", { id: toastId });
      setVerificationStatus("verified");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      toast.dismiss();
      toast.error("Verification failed. Please try again.");
      console.error(error);
    }
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    
    try {
      const toastId = toast.loading("Updating password...");
      const token = localStorage.getItem("access");
      await axios.post(`${BASE_URL}/api/change-password/`, {
        current_password: currentPassword,
        new_password: newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Password updated successfully!", { id: toastId });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.error || "Failed to update password.");
    }
  };

  const handleFileChange = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      setVerForm(prev => ({ ...prev, [side]: file }));
    }
  };

  const onSelectFile = (e, type) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCropImageSrc(reader.result?.toString() || "");
        setCropType(type);
        setCropModalOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const tabs = [
    { id: "general", label: "General Info", icon: User },
    { id: "verification", label: "Verification", icon: ShieldCheck },
    { id: "security", label: "Security", icon: Key },
  ];

  return (
    <div 
      className="cc-page" 
      style={{ 
        minHeight: "100vh", 
        background: isDark ? "#020617" : "#F8FAFC", 
        fontFamily: "Inter, sans-serif", 
        color: colors.text_primary,
        padding: bp.isMobile ? "20px 16px" : "40px",
        transition: "background-color 0.3s ease",
        position: "relative"
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .tab-btn {
          display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 16px;
          border: none; border-radius: 12px; background: transparent; cursor: pointer;
          font-family: Inter, sans-serif; font-size: 15px; font-weight: 600; text-align: left;
          transition: all 0.2s ease;
        }
        .tab-btn.active { background: ${isDark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.1)"}; color: #7C3AED; }
        .tab-btn:not(.active) { color: ${isDark ? "#94A3B8" : "#64748B"}; }
        .tab-btn:not(.active):hover { background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}; color: ${colors.text_primary}; }
        
        .form-input {
          width: 100%; padding: 14px 16px; border-radius: 12px;
          background: ${isDark ? "rgba(15,23,42,0.6)" : "#F1F5F9"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0"};
          color: ${colors.text_primary}; font-family: Inter, sans-serif; font-size: 15px;
          outline: none; transition: all 0.2s ease;
        }
        .form-input:focus { border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.2); }
        .form-label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 700; color: ${isDark ? "#94A3B8" : "#64748B"}; }
      `}</style>
      
      <div style={{ position: "fixed", top: "-20%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <ThemeLanguageSwitcher />
      <FloatingBackButton />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        
        {/* Profile Header (Cover & Avatar) */}
        <div style={{ marginBottom: "32px", borderRadius: "28px", overflow: "hidden", background: isDark ? "rgba(30,41,59,0.5)" : "white", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)", boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.2)" : "0 12px 40px rgba(0,0,0,0.03)" }}>
          
          {/* Cover Photo Area */}
          <div style={{ height: bp.isMobile ? "120px" : "200px", width: "100%", background: "linear-gradient(135deg, #7C3AED, #4F46E5)", position: "relative", backgroundImage: coverPreview ? `url(${coverPreview})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}>
            <button style={{ position: "absolute", bottom: "16px", right: "16px", padding: "8px 16px", borderRadius: "12px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "white", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease" }} className="hover:scale-105 active:scale-95">
              <Camera size={16} /> <span className="hidden sm:inline">Edit Cover</span>
              <input type="file" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} onChange={(e) => onSelectFile(e, 'cover')} accept="image/*" />
            </button>
          </div>

          {/* Avatar and Info Area */}
          <div style={{ padding: bp.isMobile ? "0 20px 24px" : "0 32px 32px", display: "flex", flexDirection: bp.isMobile ? "column" : "row", alignItems: bp.isMobile ? "center" : "flex-end", gap: "24px", marginTop: bp.isMobile ? "-50px" : "-60px" }}>
            
            {/* Profile Avatar */}
            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{ width: bp.isMobile ? "100px" : "140px", height: bp.isMobile ? "100px" : "140px", borderRadius: "50%", background: isDark ? "#1E293B" : "white", padding: "6px", boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundImage: profilePreview ? `url(${profilePreview})` : "linear-gradient(135deg, #3B82F6, #2563EB)", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center", fontSize: bp.isMobile ? "36px" : "48px", fontWeight: "900", color: "white" }}>
                  {!profilePreview && username.charAt(0).toUpperCase()}
                </div>
              </div>
              <button style={{ position: "absolute", bottom: "8px", right: "8px", width: "40px", height: "40px", borderRadius: "50%", background: isDark ? "#334155" : "#F1F5F9", border: isDark ? "2px solid #1E293B" : "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", color: isDark ? "#E2E8F0" : "#475569", cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.15)", transition: "all 0.2s ease" }} className="hover:scale-105 active:scale-95">
                <Camera size={18} strokeWidth={2.5} />
                <input type="file" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} onChange={(e) => onSelectFile(e, 'profile')} accept="image/*" />
              </button>
            </div>

            {/* Profile Info */}
            <div style={{ flex: 1, textAlign: bp.isMobile ? "center" : "left", paddingBottom: bp.isMobile ? "0" : "12px" }}>
              <h1 style={{ fontSize: bp.isMobile ? "24px" : "28px", fontWeight: "900", margin: "0 0 4px", letterSpacing: "-0.5px" }}>{username}</h1>
              <div style={{ display: "flex", alignItems: "center", justifyContent: bp.isMobile ? "center" : "flex-start", gap: "8px", fontSize: "14px", color: isDark ? "#94A3B8" : "#64748B", fontWeight: "600" }}>
                <Mail size={14} /> {email}
              </div>
              <div style={{ display: "flex", justifyContent: bp.isMobile ? "center" : "flex-start", gap: "8px", marginTop: "12px" }}>
                {verificationStatus === "verified" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", background: "rgba(16,185,129,0.15)", color: "#10B981", borderRadius: "99px", fontSize: "12px", fontWeight: "700" }}>
                    <CheckCircle2 size={14} /> Verified Student
                  </span>
                ) : verificationStatus === "pending" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", background: "rgba(245,158,11,0.15)", color: "#F59E0B", borderRadius: "99px", fontSize: "12px", fontWeight: "700" }}>
                    <Clock size={14} /> Verification Pending
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", background: "rgba(239,68,68,0.15)", color: "#EF4444", borderRadius: "99px", fontSize: "12px", fontWeight: "700" }}>
                    <AlertCircle size={14} /> Unverified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: bp.isMobile ? "column" : "row", gap: "32px" }}>
          
          {/* Sidebar */}
          <div style={{ width: bp.isMobile ? "100%" : "260px", flexShrink: 0 }}>
            <div style={{ background: isDark ? "rgba(30,41,59,0.5)" : "white", borderRadius: "24px", padding: "16px", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)", boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.2)" : "0 12px 40px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "8px" }}>
              {tabs.map(tab => (
                <button 
                  key={tab.id} 
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} /> {tab.label}
                </button>
              ))}
              <div style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", margin: "8px 0" }} />
              <button 
                onClick={logout} 
                className="tab-btn" 
                style={{ color: "#EF4444" }}
              >
                <LogOut size={18} strokeWidth={2} /> Logout
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ background: isDark ? "rgba(30,41,59,0.5)" : "white", borderRadius: "28px", padding: bp.isMobile ? "24px" : "40px", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)", boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.2)" : "0 12px 40px rgba(0,0,0,0.03)" }}
              >
                {activeTab === "general" && (
                  <div>
                    <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}><User size={22} color="#7C3AED" /> General Information</h2>
                    <div style={{ display: "grid", gridTemplateColumns: bp.isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
                      <div><label className="form-label">Full Name</label><input type="text" className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
                      <div><label className="form-label">Phone Number</label><input type="text" className="form-input" placeholder="+8801XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                      <div><label className="form-label">University Email</label><input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                      <div><label className="form-label">Blood Group</label><select className="form-input" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}><option value="">Select</option><option>A+</option><option>B+</option><option>O+</option><option>AB+</option><option>A-</option><option>B-</option><option>O-</option><option>AB-</option></select></div>
                    </div>
                    <div style={{ marginTop: "20px" }}>
                      <label className="form-label">Bio / About Me</label>
                      <textarea className="form-input" style={{ minHeight: "100px", resize: "vertical" }} placeholder="Write a short bio..." value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
                    </div>
                    <button onClick={handleSaveChanges} style={{ marginTop: "24px", background: "linear-gradient(135deg, #7C3AED, #4F46E5)", color: "white", padding: "14px 28px", borderRadius: "12px", border: "none", fontWeight: "700", fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 20px rgba(124,58,237,0.3)" }}>
                      <Save size={18} /> Save Changes
                    </button>
                  </div>
                )}

                {activeTab === "verification" && (
                  <div>
                    <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}><ShieldCheck size={22} color="#10B981" /> Student Verification</h2>
                    
                    {verificationStatus === "verified" ? (
                      <div style={{ textAlign: "center", padding: "40px", background: isDark ? "rgba(16,185,129,0.1)" : "#ECFDF5", borderRadius: "20px", border: "1px dashed rgba(16,185,129,0.3)" }}>
                        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#10B981", color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 10px 30px rgba(16,185,129,0.3)" }}><CheckCircle2 size={40} /></div>
                        <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#10B981", margin: "0 0 10px" }}>You are Verified!</h3>
                        <p style={{ color: isDark ? "#A7F3D0" : "#065F46", margin: 0, fontSize: "15px" }}>You have full access to CampusConnect features including Blood Donation and Marketplace.</p>
                      </div>
                    ) : verificationStatus === "pending" ? (
                      <div style={{ textAlign: "center", padding: "40px", background: isDark ? "rgba(245,158,11,0.1)" : "#FFFBEB", borderRadius: "20px", border: "1px dashed rgba(245,158,11,0.3)" }}>
                        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#F59E0B", color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 10px 30px rgba(245,158,11,0.3)" }}><Clock size={40} /></div>
                        <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#F59E0B", margin: "0 0 10px" }}>Verification Pending</h3>
                        <p style={{ color: isDark ? "#FDE68A" : "#92400E", margin: 0, fontSize: "15px" }}>An admin is reviewing your documents. It usually takes 24-48 hours. Please be patient.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleVerificationSubmit}>
                        <div style={{ padding: "20px", background: isDark ? "rgba(124,58,237,0.1)" : "#F3E8FF", borderRadius: "16px", marginBottom: "28px" }}>
                          <h4 style={{ margin: "0 0 8px", color: "#7C3AED", fontSize: "16px", fontWeight: "700" }}>Why verify?</h4>
                          <ul style={{ margin: 0, paddingLeft: "20px", color: isDark ? "#C4B5FD" : "#5B21B6", fontSize: "14px", lineHeight: 1.6 }}>
                            <li>Post items in Marketplace</li>
                            <li>Register as a Blood Donor</li>
                            <li>Build trust in the campus community</li>
                          </ul>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: bp.isMobile ? "1fr" : "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                          <div>
                            <label className="form-label">Department *</label>
                            <select className="form-input" required value={verForm.department} onChange={e => setVerForm({...verForm, department: e.target.value})}>
                              <option value="">Select Department</option>
                              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="form-label">Intake *</label>
                            <input type="number" className="form-input" placeholder="e.g. 50" required value={verForm.intake} onChange={e => setVerForm({...verForm, intake: e.target.value})} />
                          </div>
                          <div>
                            <label className="form-label">Current Semester *</label>
                            <input type="text" className="form-input" placeholder="e.g. Fall 2024" required value={verForm.semester} onChange={e => setVerForm({...verForm, semester: e.target.value})} />
                          </div>
                        </div>

                        <div style={{ marginBottom: "24px" }}>
                          <label className="form-label">ID Card Images *</label>
                          <div style={{ display: "grid", gridTemplateColumns: bp.isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
                            <div style={{ padding: "24px", border: isDark ? "2px dashed rgba(255,255,255,0.2)" : "2px dashed #CBD5E1", borderRadius: "16px", textAlign: "center", cursor: "pointer", position: "relative", background: isDark ? "rgba(0,0,0,0.2)" : "#F8FAFC" }}>
                              <input type="file" required accept="image/*" onChange={(e) => handleFileChange(e, 'idFront')} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                              <UploadCloud size={32} color={isDark ? "#94A3B8" : "#94A3B8"} style={{ margin: "0 auto 12px" }} />
                              <div style={{ fontSize: "14px", fontWeight: "700" }}>Upload Front Side</div>
                              {verForm.idFront && <div style={{ fontSize: "12px", color: "#10B981", marginTop: "8px", fontWeight: "700" }}>{verForm.idFront.name}</div>}
                            </div>
                            <div style={{ padding: "24px", border: isDark ? "2px dashed rgba(255,255,255,0.2)" : "2px dashed #CBD5E1", borderRadius: "16px", textAlign: "center", cursor: "pointer", position: "relative", background: isDark ? "rgba(0,0,0,0.2)" : "#F8FAFC" }}>
                              <input type="file" required accept="image/*" onChange={(e) => handleFileChange(e, 'idBack')} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                              <UploadCloud size={32} color={isDark ? "#94A3B8" : "#94A3B8"} style={{ margin: "0 auto 12px" }} />
                              <div style={{ fontSize: "14px", fontWeight: "700" }}>Upload Back Side</div>
                              {verForm.idBack && <div style={{ fontSize: "12px", color: "#10B981", marginTop: "8px", fontWeight: "700" }}>{verForm.idBack.name}</div>}
                            </div>
                          </div>
                        </div>

                        <button type="submit" style={{ width: "100%", background: "linear-gradient(135deg, #10B981, #059669)", color: "white", padding: "16px", borderRadius: "14px", border: "none", fontWeight: "800", fontSize: "16px", cursor: "pointer", boxShadow: "0 8px 25px rgba(16,185,129,0.3)" }}>
                          Submit for Verification
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {activeTab === "security" && (
                  <div>
                    <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}><Key size={22} color="#F59E0B" /> Security Settings</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "500px" }}>
                      <div><label className="form-label">Current Password</label><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="form-input" /></div>
                      <div><label className="form-label">New Password</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="form-input" /></div>
                      <div><label className="form-label">Confirm New Password</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="form-input" /></div>
                      <button onClick={handlePasswordChange} style={{ marginTop: "12px", background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "white", padding: "14px 28px", borderRadius: "12px", border: "none", fontWeight: "700", fontSize: "15px", cursor: "pointer", display: "inline-flex", alignSelf: "flex-start", boxShadow: "0 8px 20px rgba(245,158,11,0.3)" }}>
                        Update Password
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        imageSrc={cropImageSrc}
        aspect={cropType === 'profile' ? 1 : 3}
        isDark={isDark}
        onCropComplete={(croppedBase64) => {
          if (cropType === 'profile') setProfilePreview(croppedBase64);
          if (cropType === 'cover') setCoverPreview(croppedBase64);
        }}
      />
    </div>
  );
}
