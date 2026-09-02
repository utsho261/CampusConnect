import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function CreatePostModal({ isOpen, onClose, clubId, onPostCreated }) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) {
      toast.error("Please add some text or an image.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('content', content);
      data.append('status', 'approved'); // Admins posts can be pre-approved or auto-approved on backend
      if (image) data.append('image', image);

      await api.post(`clubs/${clubId}/posts/`, data);
      
      toast.success("Post created successfully!");
      onPostCreated();
      setContent("");
      setImage(null);
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-gray-700 flex justify-between items-center shrink-0">
            <h2 className="text-2xl font-bold text-white">Create Post</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <form id="create-post-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 h-32 resize-none"
                  placeholder="What's on your mind? Share updates, news, or announcements..."
                />
              </div>

              {previewUrl && (
                <div className="relative rounded-xl overflow-hidden mb-4 border border-gray-700">
                  <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/80 rounded-full text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 cursor-pointer w-fit text-gray-400 hover:text-purple-400 transition-colors">
                  <ImageIcon size={20}/>
                  <span className="font-medium text-sm">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-gray-700 flex justify-end gap-3 shrink-0 bg-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              form="create-post-form"
              type="submit"
              disabled={loading || (!content.trim() && !image)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
