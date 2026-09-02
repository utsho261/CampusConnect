import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, Star, Users, Heart, Calendar, Ticket, 
  Award, Image, Trophy, Bell, MessageSquare, Settings, ArrowLeft,
  Plus, FileText, Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import CreateClubModal from "../components/Clubs/CreateClubModal";
import ClaimAdminModal from "../components/Clubs/ClaimAdminModal";
import AdminClaimsDashboard from "../components/Clubs/AdminClaimsDashboard";
import api from "../services/api";
import FloatingBackButton from "../components/FloatingBackButton";

const sidebarGroups = [
  {
    title: "",
    links: [
      { name: "Home", icon: Home, path: "/clubs-events" },
      { name: "Featured Clubs", icon: Star, path: "/clubs-events/featured" },
      { name: "All Clubs", icon: Users, path: "/clubs-events/all" },
      { name: "My Clubs", icon: Heart, path: "/clubs-events/my-clubs" },
    ]
  },
  {
    title: "",
    links: [
      { name: "Upcoming Events", icon: Calendar, path: "/clubs-events/upcoming" },
      { name: "Event Calendar", icon: Calendar, path: "/clubs-events/calendar" },
      { name: "My Registrations", icon: Ticket, path: "/clubs-events/registrations" },
    ]
  },
  {
    title: "",
    links: [
      { name: "Community Feed", icon: MessageSquare, path: "/clubs-events/feed" },
      { name: "Leaderboard", icon: Trophy, path: "/clubs-events/leaderboard" },
      { name: "Gallery", icon: Image, path: "/clubs-events/gallery" },
      { name: "Notifications", icon: Bell, path: "/clubs-events/notifications" },
    ]
  },
  {
    title: "",
    links: [
      { name: "Settings", icon: Settings, path: "/clubs-events/settings" },
    ]
  }
];

export default function ClubsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [isCreateClubModalOpen, setIsCreateClubModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isAdminClaimsModalOpen, setIsAdminClaimsModalOpen] = useState(false);
  const [adminClubs, setAdminClubs] = useState([]);
  const role = localStorage.getItem('role') || 'student';

  useEffect(() => {
    // Only fetch if not a super admin, since super admin gets a different menu
    if (role !== 'admin') {
      api.get('clubs/').then(res => {
        const adminOf = res.data.filter(club => club.is_admin);
        setAdminClubs(adminOf);
      }).catch(console.error);
    }
  }, [role]);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      <FloatingBackButton />
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Clubs & Events
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
              {group.title && <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{group.title}</h3>}
              <div className="space-y-1">
                {group.links.map((link) => {
                  const isActive = location.pathname === link.path || (link.path === '/clubs-events' && location.pathname === '/clubs-events/');
                  
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
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-xl"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <link.icon size={20} className="relative z-10" />
                      <span className="font-medium relative z-10">{link.name}</span>
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
      <div className="flex-1 flex flex-col min-w-0 bg-gray-900">
        {/* Top Header */}
        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-end px-8 shrink-0">
          <div className="relative">
            {role === 'admin' ? (
              // Super Admin View
              <div className="relative">
                <button
                  onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all font-medium"
                >
                  <Plus size={20} />
                  <span>Manage System</span>
                </button>
                <AnimatePresence>
                  {showCreateDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden z-50"
                    >
                      <button className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors">
                        <Users size={16} /> Manage Clubs
                      </button>
                      <button 
                        onClick={() => {
                          setIsCreateClubModalOpen(true);
                          setShowCreateDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors"
                      >
                        <Plus size={16} /> Add New Club
                      </button>
                      <button className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors">
                        <Settings size={16} /> Edit Club
                      </button>
                      <button className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center gap-3 transition-colors">
                        <Users size={16} /> Delete Club
                      </button>
                      <button 
                        onClick={() => {
                          setIsAdminClaimsModalOpen(true);
                          setShowCreateDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors"
                      >
                        <Users size={16} /> Approve Club Admin
                      </button>
                      <button className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors">
                        <Calendar size={16} /> Manage Events
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : adminClubs.length > 0 ? (
              // Club Admin View
              <div className="relative">
                <button
                  onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all font-medium"
                >
                  <Plus size={20} />
                  <span>Create</span>
                </button>
                <AnimatePresence>
                  {showCreateDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden z-50"
                    >
                      <button 
                        onClick={() => navigate(`/clubs-events/club/${adminClubs[0].id}`)}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors"
                      >
                        <Calendar size={16} /> Create Event
                      </button>
                      <button 
                        onClick={() => navigate(`/clubs-events/club/${adminClubs[0].id}`)}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors"
                      >
                        <FileText size={16} /> Create Post
                      </button>
                      <button 
                        onClick={() => navigate(`/clubs-events/club/${adminClubs[0].id}`)}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors"
                      >
                        <Briefcase size={16} /> Recruitment
                      </button>
                      <button 
                        onClick={() => navigate(`/clubs-events/club/${adminClubs[0].id}`)}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors"
                      >
                        <Trophy size={16} /> Achievement
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Student View
              <button
                onClick={() => setIsClaimModalOpen(true)}
                className="flex items-center gap-2 bg-gray-800 border border-gray-700 text-purple-400 px-4 py-2 rounded-xl hover:bg-gray-700 hover:text-purple-300 transition-all font-medium text-sm shadow-md"
              >
                <span>👑 Become Club Admin</span>
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>

      <CreateClubModal 
        isOpen={isCreateClubModalOpen}
        onClose={() => setIsCreateClubModalOpen(false)}
        onClubCreated={() => {}}
      />

      <ClaimAdminModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
      />

      <AdminClaimsDashboard
        isOpen={isAdminClaimsModalOpen}
        onClose={() => setIsAdminClaimsModalOpen(false)}
      />
    </div>
  );
}
