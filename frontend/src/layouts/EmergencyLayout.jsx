import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, Phone, ShieldAlert, HeartPulse, Flame, 
  LifeBuoy, MapPin, BellRing, Info, ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import FloatingBackButton from "../components/FloatingBackButton";

const sidebarGroups = [
  {
    title: "",
    links: [
      { name: "Home", icon: Home, path: "/emergency" },
    ]
  },
  {
    title: "Emergency Contacts",
    links: [
      { name: "Police & Security", icon: ShieldAlert, path: "/emergency/police" },
      { name: "Medical Help", icon: HeartPulse, path: "/emergency/medical" },
      { name: "Fire & Rescue", icon: Flame, path: "/emergency/fire" },
      { name: "Campus Support", icon: LifeBuoy, path: "/emergency/support" },
    ]
  },
  {
    title: "Resources",
    links: [
      { name: "Emergency Locations", icon: MapPin, path: "/emergency/locations" },
      { name: "Emergency Alerts", icon: BellRing, path: "/emergency/alerts" },
      { name: "Safety Guide", icon: Info, path: "/emergency/guide" },
    ]
  }
];

export default function EmergencyLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden font-sans">
      <FloatingBackButton />
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
            <Phone size={22} className="text-red-500" />
            Emergency
          </h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {sidebarGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {group.title && <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{group.title}</h3>}
              <div className="space-y-1">
                {group.links.map((link) => {
                  const isActive = location.pathname === link.path || (link.path === '/emergency' && location.pathname === '/emergency/');
                  
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                        isActive 
                          ? "text-white" 
                          : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabEmergency"
                          className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 rounded-xl"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <link.icon size={20} className={`relative z-10 ${isActive ? 'text-red-400' : ''}`} />
                      <span className="font-medium relative z-10 text-sm">{link.name}</span>
                    </Link>
                  );
                })}
              </div>
              {groupIdx < sidebarGroups.length - 1 && (
                <div className="mt-6 border-b border-gray-700/50 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B1120]">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
