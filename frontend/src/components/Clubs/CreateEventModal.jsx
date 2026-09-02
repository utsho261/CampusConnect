import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, AlignLeft, Type, Loader2 } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function CreateEventModal({ isOpen, onClose, clubId, onEventCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    registration_link: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      await api.post(`clubs/${clubId}/events/`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success("Event created successfully!");
      onEventCreated();
      onClose();
      setFormData({ title: "", description: "", date: "", location: "", registration_link: "" });
      setImageFile(null);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(error.response?.data?.detail || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
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
                <h2 className="text-2xl font-bold text-white">Create Event</h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Event Title</label>
                  <div className="relative">
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      placeholder="E.g., Tech Talk 2026"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Date & Time</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="datetime-local"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      placeholder="E.g., Room 402 / Online"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Registration Link (Optional)</label>
                  <div className="relative">
                    <input
                      type="url"
                      name="registration_link"
                      value={formData.registration_link}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-4 pr-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      placeholder="https://forms.gle/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">Event Poster (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
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
                      placeholder="What is this event about?"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all flex justify-center items-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Creating...
                    </>
                  ) : (
                    "Publish Event"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
