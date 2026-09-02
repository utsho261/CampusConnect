import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, XCircle, ExternalLink, Image as ImageIcon } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AdminClaimsDashboard({ isOpen, onClose }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchClaims();
    }
  }, [isOpen]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const response = await api.get('clubs/claims/');
      // Filter out only pending claims for the dashboard to make it clean
      setClaims(response.data.filter(claim => claim.status === 'pending'));
    } catch (error) {
      console.error("Error fetching claims:", error);
      toast.error("Failed to load claims.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`clubs/claims/${id}/approve/`);
      toast.success("Claim approved successfully! User is now an admin.");
      setClaims(claims.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve claim.");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`clubs/claims/${id}/reject/`);
      toast.success("Claim rejected.");
      setClaims(claims.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject claim.");
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
          className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Manage Club Admin Claims
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="text-center py-10 text-gray-400">Loading claims...</div>
            ) : claims.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="text-gray-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">All Caught Up!</h3>
                <p className="text-gray-500">There are no pending admin claims at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {claims.map((claim) => (
                  <div key={claim.id} className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-lg text-white">{claim.user.full_name || claim.user.username}</span>
                        <span className="text-gray-400 text-sm">is claiming</span>
                        <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
                          {claim.role_claimed}
                        </span>
                        <span className="text-gray-400 text-sm">at</span>
                        <span className="font-bold text-pink-400">{claim.club_name}</span>
                      </div>
                      
                      <div className="bg-gray-900 rounded-lg p-4 mt-3 border border-gray-700">
                        <p className="text-gray-300 text-sm leading-relaxed">
                          <span className="font-semibold text-gray-500 mr-2">Proof/Message:</span>
                          {claim.proof}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Submitted: {new Date(claim.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3 min-w-[140px]">
                      {claim.proof_image ? (
                        <button 
                          onClick={() => setSelectedImage(claim.proof_image)}
                          className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                          <ImageIcon size={16} /> View ID Card
                        </button>
                      ) : (
                        <div className="w-full text-center text-xs text-gray-500 py-2">No ID Card uploaded</div>
                      )}
                      
                      <div className="w-full flex gap-2">
                        <button 
                          onClick={() => handleApprove(claim.id)}
                          className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleReject(claim.id)}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2 bg-gray-800/50 rounded-full"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedImage} 
            alt="ID Card Proof" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg border border-gray-700 shadow-2xl"
          />
        </div>
      )}
    </AnimatePresence>
  );
}
