import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function FloatingBackButton() {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05, x: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/dashboard')}
      className="fixed bottom-8 left-8 z-[100] flex items-center gap-3 bg-gray-900/90 backdrop-blur-xl text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 transition-all group"
      style={{ 
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.8), 0 0 20px rgba(124, 58, 237, 0.15)",
      }}
    >
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-1.5 rounded-xl group-hover:scale-110 transition-transform">
        <ArrowLeft size={18} strokeWidth={2.5} className="text-white" />
      </div>
      <span className="font-bold tracking-wide text-sm bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
        Dashboard
      </span>
    </motion.button>
  );
}
