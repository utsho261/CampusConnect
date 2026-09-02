import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, Camera, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function ReportEmergencyModal({ isOpen, onClose }) {
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [desc, setDesc] = useState("");
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !location || !desc) {
      toast.error("Please fill in the required fields.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post("emergency/reports/", {
        emergency_type: type,
        location: location,
        description: desc,
        contact_number: contact,
      });
      toast.success("Emergency report submitted. Security is being notified.");
      onClose();
      // Reset form
      setType("");
      setLocation("");
      setDesc("");
      setContact("");
    } catch (err) {
      toast.error("Failed to submit report. Please call security directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const emergencyTypes = [
    "Medical Emergency",
    "Fire",
    "Security Issue",
    "Accident",
    "Harassment / Safety",
    "Other"
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-gray-900 rounded-3xl overflow-hidden border border-gray-700 shadow-2xl"
      >
        {/* Header */}
        <div className="bg-red-500/10 border-b border-red-500/20 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-500">
            <div className="bg-red-500/20 p-2 rounded-xl">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-xl font-bold">Report Emergency</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Emergency Type <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {emergencyTypes.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                    type === t 
                      ? "bg-red-500/20 text-red-400 border-red-500/50" 
                      : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                  } border`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Location <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={18} className="text-gray-500" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Building A, 2nd Floor"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description <span className="text-red-500">*</span></label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Briefly describe the situation..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-500 resize-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">Contact Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-500" />
                </div>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-500"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">Photo</label>
              <button
                type="button"
                className="w-full h-[46px] bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-600 text-gray-300 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Camera size={18} />
                <span>Upload</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-6 bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/30 transition-all ${isSubmitting ? "opacity-70 cursor-wait" : "active:scale-95"}`}
          >
            {isSubmitting ? "Submitting..." : "Submit Emergency Report"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
