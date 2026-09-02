import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlignLeft, Type, Loader2, Calendar } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function CreateClubModal({ isOpen, onClose, onClubCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    established_date: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) submitData.append(key, formData[key]);
      });
      if (logoFile) {
        submitData.append("logo", logoFile);
      }

      await api.post("clubs/", submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success("Club created! It is now pending admin approval.");
      onClubCreated();
      onClose();
      setFormData({ name: "", description: "", established_date: "" });
      setLogoFile(null);
    } catch (error) {
      console.error("Error creating club:", error);
      toast.error(error.response?.data?.detail || "Failed to create club");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl pointer-events-auto relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Request New Club</h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Club Name</label>
                  <div className="relative">
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      placeholder="E.g., Robotics Society"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Established Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="date"
                      name="established_date"
                      value={formData.established_date}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Club Logo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Description</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-3 top-4 text-gray-500" size={18} />
                    <textarea
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                      placeholder="Tell us about the club's mission and activities..."
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-yellow-500/80 mb-4 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                    <strong>Note:</strong> Your club will not be visible until verified by a Site Admin. You will become the Club Admin upon approval.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Submitting...
                      </>
                    ) : (
                      "Submit for Verification"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
