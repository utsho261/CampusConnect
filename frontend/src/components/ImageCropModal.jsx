import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import toast from "react-hot-toast";
import getCroppedImg from "../utils/cropImage";

export default function ImageCropModal({ isOpen, onClose, imageSrc, onCropComplete, aspect = 1, isDark }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = useCallback((crop) => setCrop(crop), []);
  const onZoomChange = useCallback((zoom) => setZoom(zoom), []);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApply = async () => {
    try {
      const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImageBase64);
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop image.");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div 
        style={{ position: "absolute", inset: 0, background: isDark ? "rgba(2,6,23,0.9)" : "rgba(15,23,42,0.8)", backdropFilter: "blur(12px)" }}
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
        style={{ position: "relative", width: "100%", maxWidth: "500px", background: isDark ? "#0F172A" : "white", borderRadius: "24px", overflow: "hidden", boxShadow: isDark ? "0 24px 60px rgba(0,0,0,0.6)" : "0 24px 60px rgba(15,23,42,0.2)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}` }}
      >
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: isDark ? "#F8FAFC" : "#0F172A" }}>Crop Image</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: isDark ? "#94A3B8" : "#64748B", cursor: "pointer", display: "flex" }}><X size={20} /></button>
        </div>

        <div style={{ position: "relative", width: "100%", height: "350px", background: "#000" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: isDark ? "#94A3B8" : "#64748B" }}>Zoom</span>
            <input 
              type="range" value={zoom} min={1} max={3} step={0.1}
              aria-labelledby="Zoom" onChange={(e) => setZoom(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#7C3AED" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "12px 24px", borderRadius: "12px", background: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9", border: "none", color: isDark ? "#E2E8F0" : "#334155", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
            <button onClick={handleApply} style={{ padding: "12px 24px", borderRadius: "12px", background: "linear-gradient(135deg, #7C3AED, #4F46E5)", border: "none", color: "white", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 20px rgba(124,58,237,0.3)" }}>
              <Check size={18} /> Apply
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
