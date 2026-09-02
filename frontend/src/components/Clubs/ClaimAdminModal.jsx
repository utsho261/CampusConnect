import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import api from "../../services/api";

export default function ClaimAdminModal({ isOpen, onClose }) {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [role, setRole] = useState("");
  const [proof, setProof] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('clubs/').then(res => setClubs(res.data)).catch(console.error);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('club', selectedClub);
      formData.append('role_claimed', role);
      formData.append('proof', proof);
      if (proofImage) {
        formData.append('proof_image', proofImage);
      }

      await api.post('clubs/claims/', formData);
      alert("Claim submitted successfully! Awaiting University Admin approval.");
      onClose();
      setSelectedClub("");
      setRole("");
      setProof("");
      setProofImage(null);
    } catch (error) {
      let errMsg = "Failed to submit claim.";
      if (error.response?.data) {
        if (Array.isArray(error.response.data)) {
            errMsg = error.response.data.join(" ");
        } else {
            errMsg = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errMsg = error.message;
      }
      alert(errMsg);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Become Club Admin</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-gray-400 text-sm mb-4">
              Are you an executive member of an existing club? Select your club below and provide proof (e.g. "I am the President of Programming Club, ID: 123456").
            </p>
            
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Select Club</label>
              <select
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500"
                required
              >
                <option value="" disabled>Choose a club...</option>
                {clubs.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Your Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500"
                required
              >
                <option value="" disabled>Select your role...</option>
                <option value="President">President</option>
                <option value="Vice President">Vice President</option>
                <option value="General Secretary">General Secretary</option>
                <option value="Treasurer">Treasurer</option>
                <option value="Executive Member">Executive Member</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Provide Proof</label>
              <textarea
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 h-24 resize-none mb-3"
                placeholder="Explain why you should be granted admin access..."
                required
              />
              <label className="block text-gray-400 text-sm font-bold mb-2 mt-4">Upload Club ID Card Picture / Proof *</label>
              <div className="flex items-center justify-center w-full mt-2 mb-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-800 hover:bg-gray-700 hover:border-purple-500 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold text-purple-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB)</p>
                  </div>
                  <input
                    required
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofImage(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
              {proofImage && <p className="text-sm text-green-400 font-medium">Selected: {proofImage.name}</p>}
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedClub || !role || !proof}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Claim"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
