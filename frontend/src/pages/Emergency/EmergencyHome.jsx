import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import ReportEmergencyModal from "./ReportEmergencyModal";
import api from "../../services/api";
import { cachedGetAll } from "../../services/apiCache";

export default function EmergencyHome() {
  const { category: categoryParam } = useParams();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // If cached data exists, don't show loading skeleton
      const hasCached = ["emergency_categories", "emergency_notices"].some(
        (k) => localStorage.getItem(`cc_cache_${k}`)
      );
      if (!hasCached) setLoading(true);

      try {
        const [cats, nots] = await cachedGetAll(api, [
          {
            url: "emergency/categories/",
            cacheKey: "emergency_categories",
            ttl: 10 * 60 * 1000, // 10 min — rarely changes
            onCacheHit: (d) => { setCategories(d); setLoading(false); },
          },
          {
            url: "emergency/notices/active/",
            cacheKey: "emergency_notices",
            ttl: 2 * 60 * 1000, // 2 min
            onCacheHit: (d) => setNotices(d),
          },
        ]);
        if (cats) setCategories(cats);
        if (nots) setNotices(nots);
      } catch (err) {
        console.error("Failed to load emergency data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && categories.length > 0 && categoryParam) {
      setTimeout(() => {
        let keyword = categoryParam.toLowerCase();
        if (keyword === 'support') keyword = 'support';
        if (keyword === 'medical') keyword = 'medical';
        if (keyword === 'police') keyword = 'police';
        if (keyword === 'fire') keyword = 'fire';
        
        const found = categories.find(c => c.name.toLowerCase().includes(keyword));
        if (found) {
          const el = document.getElementById(`category-${found.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Add a brief highlight effect
            el.style.transition = 'background-color 0.5s';
            el.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            setTimeout(() => { el.style.backgroundColor = 'transparent'; }, 1500);
          }
        }
      }, 300); // Wait a bit for layout to settle
    }
  }, [loading, categories, categoryParam]);

  const ContactCard = ({ contact, primaryColor }) => {
    const colorClasses = {
      red: "bg-red-500/10 border-red-500/20 text-red-500",
      blue: "bg-blue-500/10 border-blue-500/20 text-blue-500",
      yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
      purple: "bg-purple-500/10 border-purple-500/20 text-purple-500",
      green: "bg-green-500/10 border-green-500/20 text-green-500",
    };

    const buttonClasses = {
      red: "bg-red-600 hover:bg-red-500 shadow-red-500/30",
      blue: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/30",
      yellow: "bg-yellow-600 hover:bg-yellow-500 shadow-yellow-500/30",
      purple: "bg-purple-600 hover:bg-purple-500 shadow-purple-500/30",
      green: "bg-green-600 hover:bg-green-500 shadow-green-500/30",
    };

    const activeColor = contact.color || primaryColor || "blue";
    const cClass = colorClasses[activeColor] || colorClasses.blue;
    const bClass = buttonClasses[activeColor] || buttonClasses.blue;
    const Icon = LucideIcons[contact.icon] || LucideIcons.PhoneCall;

    return (
      <motion.div 
        whileHover={{ y: -4, scale: 1.02 }}
        className="bg-gray-800/80 backdrop-blur-md border border-gray-700/50 p-5 rounded-3xl flex flex-col justify-between shadow-xl shadow-black/20"
      >
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${cClass}`}>
              <Icon size={28} />
            </div>
            {contact.hours && (
              <span className="text-xs font-bold text-gray-400 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700">
                {contact.hours}
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-white mb-1">{contact.name}</h3>
          
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <LucideIcons.PhoneCall size={14} className="text-gray-500" />
              <span className="font-medium text-gray-200">{contact.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <LucideIcons.MapPin size={14} className="text-gray-500" />
              <span>{contact.location}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <a 
            href={`tel:${contact.phone}`}
            className={`flex-1 text-center text-white py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${bClass}`}
          >
            <LucideIcons.PhoneCall size={18} /> Call
          </a>
          <button 
            className="w-[50px] bg-gray-700 hover:bg-gray-600 text-white rounded-xl flex items-center justify-center transition-all border border-gray-600"
            title="Get Directions"
          >
            <LucideIcons.Navigation size={18} />
          </button>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh] text-white">
        <LucideIcons.Loader2 className="animate-spin text-red-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      
      {/* Emergency Notices */}
      {notices.map((notice) => (
        <motion.div 
          key={notice.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex gap-4 items-start shadow-[0_0_30px_rgba(239,68,68,0.15)]"
        >
          <div className="bg-red-500/20 p-2 rounded-xl shrink-0 mt-1">
            <LucideIcons.AlertTriangle className="text-red-500" size={24} />
          </div>
          <div>
            <h4 className="text-red-400 font-bold text-lg flex items-center gap-2">
              ⚠️ Emergency Notice
            </h4>
            <p className="text-gray-300 mt-1 font-medium">{notice.message}</p>
          </div>
        </motion.div>
      ))}

      {/* Main Action Area */}
      <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-[32px] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-red-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full transform translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 blur-2xl rounded-full transform -translate-x-1/2 translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <LucideIcons.ShieldAlert size={28} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Are you in an emergency?</h1>
          </div>
          <p className="text-red-100 text-lg md:text-xl font-medium max-w-lg mb-8">
            Don't panic. Quickly connect with campus security, medical personnel, or local emergency services.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              className="bg-white text-red-600 font-bold px-8 py-4 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <LucideIcons.PhoneCall size={22} />
              Call Campus Security
            </button>
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="bg-black/30 backdrop-blur-md border border-white/20 text-white font-bold px-8 py-4 rounded-xl shadow-xl hover:bg-black/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <LucideIcons.AlertTriangle size={22} />
              Report Emergency
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Categories */}
      <div className="space-y-12">
        {categories.map((category) => {
          const CatIcon = LucideIcons[category.icon] || LucideIcons.Info;
          return (
            <section key={category.id} id={`category-${category.id}`} className="rounded-3xl p-4 -m-4">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 bg-${category.color}-500/20 rounded-xl flex items-center justify-center text-${category.color}-500`}>
                  <CatIcon size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{category.name}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.contacts.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} primaryColor={category.color} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <AnimatePresence>
        <ReportEmergencyModal 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)} 
        />
      </AnimatePresence>

    </div>
  );
}

