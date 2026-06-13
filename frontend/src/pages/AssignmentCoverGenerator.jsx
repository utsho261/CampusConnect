import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Download,
  RotateCcw,
  Save,
  FileText,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../services/api";
import bubtLogo from "../assets/bubt-logo.png";

const STORAGE_KEY = "campusconnect_assignment_cover";

const defaultForm = {
  docType: "Lab Report",
  reportTitle: "LAB REPORT",
  university: "Bangladesh University of Business and Technology",
  experimentDate: "24/06/2026",
  experimentNo: "01",
  courseTitle: "Principles Of Economics",
  courseCode: "ECO 101",
  experimentName: "Basic Principles",
  studentName: "Your Name",
  studentId: "123",
  intake: "51",
  section: "6",
  program: "B.Sc. in CSE",
  facultyName: "Faculty Name",
  facultyDesignation: "Assistant Professor",
  facultyDepartment: "Dept. of CSE",
  submissionDate: "25/06/2026",
  showSection: true,
};

const courseMap = {
  "ECO 101": "Principles Of Economics",
  "CSE 101": "Introduction to Computer Systems",
  "CSE 103": "Structured Programming Language",
  "CSE 201": "Object Oriented Programming",
  "CSE 203": "Data Structures",
  "CSE 301": "Database Management Systems",
  "CSE 303": "Computer Networks",
  "MAT 101": "Differential and Integral Calculus",
  "PHY 101": "Physics",
};

const programOptions = [
  "B.Sc. in CSE",
  "B.Sc. in EEE",
  "B.Sc. in Textile Engineering",
  "BBA",
  "MBA",
  "LL.B",
  "English",
  "Economics",
];

function Field({ label, name, value, onChange, placeholder, type = "text", hint, disabled }) {
  return (
    <label className="acg-field">
      <span>
        {label}
        {hint && <em>{hint}</em>}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(name, event.target.value)}
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="acg-field">
      <span>{label}</span>
      <select name={name} value={value} onChange={(event) => onChange(name, event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionCard({ icon: Icon, title, children, tone = "#0ea5e9" }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="acg-card"
      style={{ "--tone": tone }}
    >
      <div className="acg-card-head">
        <div className="acg-card-icon">
          <Icon size={22} />
        </div>
        <h2>{title}</h2>
      </div>
      <div className="acg-grid">{children}</div>
    </motion.section>
  );
}

function CoverRow({ label, value }) {
  return (
    <div className="cover-row">
      <span>{label}</span>
      <b>:</b>
      <strong>{value || "\u00a0"}</strong>
    </div>
  );
}

function CoverPreview({ form, scale }) {
  return (
    <div className="cover-scale-wrapper" style={{ height: `${1123 * scale}px` }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
        <div className="cover-page" id="assignment-cover-page">
          <div className="cover-inner">
            <header className="cover-header">
              <h1>{form.university}</h1>
              <img className="cover-logo" src={bubtLogo} alt="" onError={(e) => e.target.style.display='none'} />
              <h2>{form.reportTitle}</h2>
            </header>

            <main className="cover-body">
              <div className="cover-info">
                <CoverRow label={form.docType === "Assignment" ? "Topic Name" : "Experiment Name"} value={form.experimentName} />
                <CoverRow label="Course Title" value={form.courseTitle} />
                <CoverRow label="Course Code" value={form.courseCode} />
                <CoverRow label={form.docType === "Assignment" ? "Assignment No" : "Experiment No"} value={form.experimentNo} />
                <CoverRow label={form.docType === "Assignment" ? "Assignment Date" : "Experiment Date"} value={form.experimentDate} />
              </div>

              <div className="cover-columns">
                <section>
                  <h3>Submitted By:</h3>
                  <CoverRow label="Name" value={form.studentName} />
                  <CoverRow label="ID No" value={form.studentId} />
                  <CoverRow label="Intake" value={form.intake} />
                  {form.showSection && <CoverRow label="Section" value={form.section} />}
                  <CoverRow label="Program" value={form.program} />
                </section>

                <section>
                  <h3>Submitted To:</h3>
                  <CoverRow label="Name" value={form.facultyName} />
                  <p className="designation">({form.facultyDesignation || "\u00a0"})</p>
                  <p><strong>{form.facultyDepartment || "\u00a0"}</strong></p>
                  <p><strong>Bangladesh University of Business</strong></p>
                  <p><strong>&amp; Technology</strong></p>
                </section>
              </div>
            </main>

            <footer className="cover-footer">
              <div>
                <span>Date of Submission :</span>
                <strong>{form.submissionDate || "\u00a0"}</strong>
              </div>
              <div className="signature">Teacher's Signature</div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssignmentCoverGenerator() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (!savedDraft) return defaultForm;
    try {
      return { ...defaultForm, ...JSON.parse(savedDraft) };
    } catch {
      return defaultForm;
    }
  });
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Scaler logic
  const previewContainerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth;
        // 794 is the exact A4 width at 96 DPI. Subtracting 32 for padding.
        const newScale = (containerWidth - 32) / 794;
        setScale(Math.min(newScale, 1));
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const completion = useMemo(() => {
    const keys = Object.keys(defaultForm).filter((key) => typeof defaultForm[key] === "string");
    const filled = keys.filter((key) => String(form[key]).trim()).length;
    return Math.round((filled / keys.length) * 100);
  }, [form]);

  const updateField = (name, value) => {
    setSaved(false);
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "courseCode") {
        const normalized = value.trim().toUpperCase();
        if (courseMap[normalized]) next.courseTitle = courseMap[normalized];
      }
      return next;
    });
  };

  const handleDocTypeToggle = (type) => {
    setSaved(false);
    setForm((current) => {
      const next = { ...current, docType: type };
      if (current.reportTitle === "LAB REPORT" && type === "Assignment") {
        next.reportTitle = "ASSIGNMENT";
      } else if (current.reportTitle === "ASSIGNMENT" && type === "Lab Report") {
        next.reportTitle = "LAB REPORT";
      }
      return next;
    });
  };

  const saveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    setSaved(true);
  };

  const resetForm = () => {
    localStorage.removeItem(STORAGE_KEY);
    setForm(defaultForm);
    setSaved(false);
  };

  const downloadPdf = async () => {
    saveDraft();
    setGenerating(true);
    
    // Give React a tick to show the "Generating PDF..." button
    setTimeout(async () => {
      const element = document.getElementById('assignment-cover-page');
      
      // Temporarily remove transform so html2canvas sees it at full size
      const scaleWrapper = element.parentElement;
      const originalTransform = scaleWrapper.style.transform;
      scaleWrapper.style.transform = 'none';

      const opt = {
        margin:       [0, 0, 0, 0],
        filename:     `assignment-cover-${form.studentId || "student"}.pdf`,
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, logging: false },
        jsPDF:        { unit: 'px', format: [794, 1123], orientation: 'portrait', hotfixes: ["px_scaling"] }
      };

      try {
        await html2pdf().set(opt).from(element).save();
      } catch (e) {
        console.error("PDF generation failed", e);
      } finally {
        // Restore transform
        scaleWrapper.style.transform = originalTransform;
        setGenerating(false);
      }
    }, 100);
  };

  const downloadDocx = async () => {
    saveDraft();
    setGenerating(true);
    try {
      const response = await api.post("assignment-cover/generate/", form, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `assignment-cover-${form.studentId || "student"}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("DOCX generation failed. Check backend.", e);
      alert("DOCX generation is currently unavailable on the backend. Please use 'Download PDF' instead.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="assignment-cover-generator">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .assignment-cover-generator {
          min-height: 100vh;
          background: #f1f5f9;
          background-image: 
            radial-gradient(at 0% 0%, rgba(14,165,233,0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(16,185,129,0.15) 0px, transparent 50%);
          color: #0f172a;
          font-family: Inter, system-ui, sans-serif;
          padding: 24px;
        }
        .acg-shell { max-width: 1540px; margin: 0 auto; display: grid; grid-template-columns: 1fr 480px; gap: 32px; align-items: start; }
        .acg-topbar { max-width: 1540px; margin: 0 auto 30px; display: flex; justify-content: space-between; gap: 16px; align-items: center; }
        
        .acg-back, .acg-action {
          border: none; cursor: pointer; border-radius: 14px; font-weight: 700; font-family: Inter, sans-serif;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .acg-back { 
          width: 48px; height: 48px; background: white; color: #1e293b; box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          display: inline-flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0;
        }
        .acg-back:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
        
        .acg-title h1 { margin: 0; font-size: 32px; letter-spacing: -0.5px; font-weight: 900; background: linear-gradient(135deg, #1e293b, #334155); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .acg-title p { margin: 6px 0 0; color: #64748b; font-weight: 600; font-size: 15px; }
        
        .acg-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }
        .acg-action { min-height: 48px; padding: 0 20px; display: inline-flex; align-items: center; gap: 10px; font-size: 14px; background: white; border: 1px solid #e2e8f0; color: #334155; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .acg-action:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); background: #f8fafc; }
        .acg-action:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .acg-action.primary { border: none; background: linear-gradient(135deg, #0ea5e9, #2563eb); color: white; box-shadow: 0 8px 25px rgba(37,99,235,0.3); }
        .acg-action.primary:hover:not(:disabled) { box-shadow: 0 12px 35px rgba(37,99,235,0.4); background: linear-gradient(135deg, #0284c7, #1d4ed8); }
        
        .acg-action.dark { border: none; background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 8px 25px rgba(16,185,129,0.3); }
        .acg-action.dark:hover:not(:disabled) { box-shadow: 0 12px 35px rgba(16,185,129,0.4); background: linear-gradient(135deg, #059669, #047857); }
        
        .acg-form { display: flex; flex-direction: column; gap: 28px; min-width: 0; }
        .acg-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.5); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(15,23,42,0.06); }
        .acg-card-head { height: 76px; display: flex; align-items: center; gap: 16px; padding: 0 28px; border-bottom: 1px solid rgba(0,0,0,0.04); background: rgba(255,255,255,0.5); }
        .acg-card-icon { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; color: white; background: var(--tone); box-shadow: 0 8px 20px color-mix(in srgb, var(--tone) 40%, transparent); }
        .acg-card h2 { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; }
        
        .acg-grid { padding: 28px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
        
        .acg-field { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
        .acg-field span { font-size: 14px; font-weight: 700; color: #334155; display: flex; justify-content: space-between; gap: 10px; }
        .acg-field em { font-style: normal; font-size: 11px; color: #059669; background: #d1fae5; padding: 3px 10px; border-radius: 999px; white-space: nowrap; font-weight: 800; }
        .acg-field input, .acg-field select {
          width: 100%; height: 52px; border-radius: 14px; border: 2px solid #e2e8f0; background: #f8fafc; color: #0f172a;
          padding: 0 18px; font-size: 15px; font-weight: 600; outline: none; transition: all 0.2s; font-family: Inter, sans-serif;
        }
        .acg-field input:focus, .acg-field select:focus { border-color: var(--tone); background: white; box-shadow: 0 0 0 4px color-mix(in srgb, var(--tone) 15%, transparent); }
        
        .acg-toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .acg-toggle { width: 42px; height: 24px; border: 0; border-radius: 999px; background: #10b981; padding: 4px; cursor: pointer; display: flex; justify-content: flex-end; transition: all 0.3s; }
        .acg-toggle.off { background: #cbd5e1; justify-content: flex-start; }
        .acg-toggle span { width: 16px; height: 16px; border-radius: 999px; background: white; display: block; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
        
        .acg-preview-panel { position: sticky; top: 24px; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.5); border-radius: 24px; padding: 24px; box-shadow: 0 20px 50px rgba(15,23,42,0.06); }
        .acg-preview-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .acg-preview-head h2 { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; }
        
        .acg-meter { height: 10px; background: #e2e8f0; border-radius: 999px; overflow: hidden; margin-bottom: 24px; }
        .acg-meter span { display: block; height: 100%; background: linear-gradient(90deg, #0ea5e9, #10b981); border-radius: inherit; transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        
        .acg-mode-toggle { display: flex; background: white; padding: 6px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
        .acg-mode-btn { flex: 1; border: none; background: transparent; padding: 12px; font-weight: 700; font-family: Inter, sans-serif; color: #64748b; border-radius: 12px; cursor: pointer; transition: all 0.3s; font-size: 15px; }
        .acg-mode-btn.active { background: var(--tone, #10b981); color: white; box-shadow: 0 4px 12px color-mix(in srgb, var(--tone, #10b981) 40%, transparent); }
        
        .preview-wrapper {
          background: white;
          padding: 8px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          display: flex;
          justify-content: center;
        }

        .cover-scale-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        /* EXACT A4 Fixed Pixel CSS for Perfect Layout & Export */
        .cover-page { 
          width: 794px; 
          height: 1123px; 
          background: white; 
          color: #000; 
          padding: 40px; 
          box-sizing: border-box;
          transform-origin: top center;
        }
        .cover-inner { 
          height: 100%; 
          border: 4px solid #000; 
          font-family: 'Times New Roman', Times, serif; 
          display: flex;
          flex-direction: column;
          padding: 30px 40px;
          box-sizing: border-box;
        }
        .cover-header { 
          text-align: center; 
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        .cover-header h1 { 
          font-size: 28px; 
          margin: 0; 
          font-weight: 900; 
          line-height: 1.3; 
          text-transform: uppercase; 
        }
        .cover-logo { 
          width: 100px; 
          object-fit: contain; 
        }
        .cover-header h2 { 
          display: inline-flex; 
          align-items: center; 
          justify-content: center; 
          border: 2px solid #000; 
          border-radius: 8px; 
          padding: 8px 30px; 
          font-size: 22px; 
          margin: 5px 0 0; 
          font-weight: bold; 
          letter-spacing: 1px; 
          text-transform: uppercase; 
        }
        
        .cover-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-top: 35px;
        }
        .cover-info { 
          width: 85%;
          margin: 0 auto 35px;
        }
        .cover-row { 
          display: flex; 
          align-items: baseline; 
          font-size: 19px; 
          line-height: 1.5; 
          margin-bottom: 12px; 
        }
        .cover-row span { 
          font-weight: bold; 
          width: 35%;
        }
        .cover-row b { 
          font-weight: bold; 
          width: 5%;
          text-align: center;
        }
        .cover-row strong { 
          font-weight: normal; 
          width: 60%;
        }
        
        .cover-columns { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 25px; 
          flex: 1;
        }
        .cover-columns section { 
          border: 2px solid #000; 
          border-radius: 8px; 
          padding: 20px; 
          display: flex;
          flex-direction: column;
        }
        .cover-columns h3 { 
          margin: 0 0 15px 0; 
          font-size: 20px; 
          text-align: center; 
          font-weight: bold; 
          text-decoration: underline; 
        }
        .cover-columns p { 
          margin: 0 0 8px; 
          font-size: 17px; 
          line-height: 1.4; 
        }
        .cover-columns .cover-row { 
          font-size: 17px; 
          line-height: 1.4; 
          margin-bottom: 10px; 
        }
        .cover-columns .designation { 
          margin-top: 15px; 
          font-style: italic; 
        }
        
        .cover-footer { 
          display: flex; 
          align-items: flex-end; 
          justify-content: space-between; 
          font-size: 18px; 
          margin-top: 30px;
        }
        .cover-footer span { 
          margin-right: 8px; 
          font-weight: bold; 
        }
        .cover-footer strong { 
          font-weight: normal; 
        }
        .signature { 
          min-width: 220px; 
          text-align: center; 
          border-top: 2px solid #000; 
          padding-top: 8px; 
          font-weight: bold; 
        }
        
        @media (max-width: 1280px) { 
          .acg-shell { grid-template-columns: 1fr; } 
          .acg-preview-panel { position: static; max-width: 600px; margin: 0 auto; width: 100%; } 
        }
        @media (max-width: 768px) {
          .assignment-cover-generator { padding: 16px; }
          .acg-topbar { align-items: flex-start; flex-direction: column; }
          .acg-grid { grid-template-columns: 1fr; padding: 20px; gap: 16px; }
          .acg-actions { width: 100%; justify-content: stretch; }
          .acg-action { flex: 1; justify-content: center; }
          .acg-title h1 { font-size: 24px; }
        }
      `}</style>

      <div className="acg-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="acg-back" onClick={() => navigate("/dashboard")} title="Back to dashboard">
            <ArrowLeft size={22} />
          </motion.button>
          <div className="acg-title">
            <h1>Assignment Cover Generator</h1>
            <p>Fill the fields once, get a premium BUBT-style A4 cover instantly.</p>
          </div>
        </div>
        <div className="acg-actions">
          <motion.button whileTap={{ scale: 0.95 }} className="acg-action" onClick={resetForm}>
            <RotateCcw size={18} /> Reset
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} className="acg-action" onClick={saveDraft}>
            <Save size={18} /> {saved ? "Saved" : "Save"}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} className="acg-action dark" onClick={downloadPdf} disabled={generating}>
            <FileText size={18} /> {generating ? "Generating PDF..." : "Download PDF"}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} className="acg-action primary" onClick={downloadDocx} disabled={generating}>
            <Download size={18} /> Download DOCX
          </motion.button>
        </div>
      </div>

      <div className="acg-shell">
        <div className="acg-form">
          <div className="acg-mode-toggle" style={{ "--tone": form.docType === "Assignment" ? "#3b82f6" : "#ec4899" }}>
            <button 
              className={`acg-mode-btn ${form.docType === "Lab Report" ? "active" : ""}`} 
              onClick={() => handleDocTypeToggle("Lab Report")}
            >
              🧪 Lab Report
            </button>
            <button 
              className={`acg-mode-btn ${form.docType === "Assignment" ? "active" : ""}`} 
              onClick={() => handleDocTypeToggle("Assignment")}
            >
              📝 Assignment
            </button>
          </div>

          <SectionCard icon={BookOpen} title="Course Details" tone={form.docType === "Assignment" ? "#3b82f6" : "#ec4899"}>
            <Field label="Course Code" name="courseCode" value={form.courseCode} onChange={updateField} hint="Enter Code for auto-fill" />
            <Field label="Course Title" name="courseTitle" value={form.courseTitle} onChange={updateField} />
            <Field label={form.docType === "Assignment" ? "Topic Name" : "Experiment Name"} name="experimentName" value={form.experimentName} onChange={updateField} />
            <Field label={form.docType === "Assignment" ? "Assignment No" : "Experiment No"} name="experimentNo" value={form.experimentNo} onChange={updateField} />
            <Field label={form.docType === "Assignment" ? "Assignment Date" : "Experiment Date"} name="experimentDate" value={form.experimentDate} onChange={updateField} placeholder="DD/MM/YYYY" />
            <Field label="Cover Title" name="reportTitle" value={form.reportTitle} onChange={updateField} />
          </SectionCard>

          <SectionCard icon={UserRound} title="Student Information" tone="#3b82f6">
            <Field label="Student Name" name="studentName" value={form.studentName} onChange={updateField} />
            <Field label="ID Number" name="studentId" value={form.studentId} onChange={updateField} hint="Enter ID for auto-fill" />
            <Field label="Intake" name="intake" value={form.intake} onChange={updateField} />
            <label className="acg-field">
              <span className="acg-toggle-row">
                Section
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#64748b", fontWeight: 700 }}>
                  Show
                  <button
                    type="button"
                    className={`acg-toggle ${form.showSection ? "" : "off"}`}
                    onClick={() => updateField("showSection", !form.showSection)}
                  >
                    <span />
                  </button>
                </span>
              </span>
              <input name="section" value={form.section} onChange={(event) => updateField("section", event.target.value)} />
            </label>
            <SelectField label="Program" name="program" value={form.program} onChange={updateField} options={programOptions} />
          </SectionCard>

          <SectionCard icon={BadgeCheck} title="Faculty Details" tone="#10b981">
            <Field label="Faculty Name" name="facultyName" value={form.facultyName} onChange={updateField} />
            <Field label="Designation" name="facultyDesignation" value={form.facultyDesignation} onChange={updateField} />
            <Field label="Department" name="facultyDepartment" value={form.facultyDepartment} onChange={updateField} />
            <Field label="Date of Submission" name="submissionDate" value={form.submissionDate} onChange={updateField} placeholder="DD/MM/YYYY" />
            <Field label="University Name" name="university" value={form.university} onChange={updateField} />
          </SectionCard>
        </div>

        <aside className="acg-preview-panel">
          <div className="acg-preview-head">
            <h2>Live A4 Preview</h2>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#10b981", fontWeight: 800, fontSize: "14px", background: "#d1fae5", padding: "4px 12px", borderRadius: "99px" }}>
              <BadgeCheck size={16} /> {completion}% Filled
            </span>
          </div>
          <div className="acg-meter">
            <span style={{ width: `${completion}%` }} />
          </div>
          <div className="preview-wrapper" ref={previewContainerRef}>
            <CoverPreview form={form} scale={scale} />
          </div>
        </aside>
      </div>
    </div>
  );
}