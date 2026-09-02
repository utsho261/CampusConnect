import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Plus, Search, CheckCircle, XCircle } from "lucide-react";
import api from "../../services/api";
import CreateClubModal from "../../components/Clubs/CreateClubModal";
import toast from "react-hot-toast";

export default function ClubsList() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await api.get("clubs/");
      setClubs(response.data);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`clubs/${id}/approve/`);
      toast.success("Club approved successfully!");
      fetchClubs();
    } catch (error) {
      toast.error("Failed to approve club.");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`clubs/${id}/reject/`);
      toast.success("Club rejected.");
      fetchClubs();
    } catch (error) {
      toast.error("Failed to reject club.");
    }
  };

  const approvedClubs = clubs.filter(club => club.status === 'approved' && club.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const pendingClubs = clubs.filter(club => club.status === 'pending');

  return (
    <div className="p-8 text-white max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text mb-2">
            Explore Clubs
          </h1>
          <p className="text-gray-400">Discover and join vibrant communities.</p>
        </div>

        <div className="relative mb-10 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {userRole === 'admin' && pendingClubs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-yellow-500 flex items-center gap-2">
                  <span className="bg-yellow-500/20 p-2 rounded-lg"><Users size={24} /></span>
                  Pending Approvals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pendingClubs.map((club, index) => (
                    <motion.div 
                      key={club.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                      className="bg-gray-800 rounded-2xl p-6 border border-yellow-500/30 flex flex-col h-full"
                    >
                      <h3 className="text-xl font-bold text-white mb-2">{club.name}</h3>
                      <p className="text-sm text-gray-400 mb-4 flex-grow">{club.description}</p>
                      <div className="flex gap-3 mt-4">
                        <button onClick={() => handleApprove(club.id)} className="flex-1 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white border border-green-600/30 py-2 rounded-xl transition-colors flex items-center justify-center gap-2">
                          <CheckCircle size={18} /> Approve
                        </button>
                        <button onClick={() => handleReject(club.id)} className="flex-1 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-600/30 py-2 rounded-xl transition-colors flex items-center justify-center gap-2">
                          <XCircle size={18} /> Reject
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              {userRole === 'admin' && <h2 className="text-2xl font-bold mb-6 text-white">Approved Clubs</h2>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {approvedClubs.map((club, index) => (
                  <motion.div 
                    key={club.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all h-full flex flex-col group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                      <div className="h-16 w-16 rounded-xl bg-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                        {club.logo ? (
                          <img src={club.logo} alt={club.name} className="h-full w-full object-cover" />
                        ) : (
                          <Users className="text-gray-400" size={32} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">{club.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <span className="flex items-center text-yellow-500"><Star size={14} className="fill-yellow-500 mr-1"/> 4.8</span>
                          <span>•</span>
                          <span>1200 Members</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm flex-grow line-clamp-2 relative z-10 mb-4">
                      {club.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-6">
                       <span className="text-xs font-medium px-3 py-1 bg-purple-900/40 border border-purple-500/30 rounded-full text-purple-200 uppercase tracking-wider">
                         {club.category || 'Category'}
                       </span>
                    </div>

                    <div className="flex gap-3 relative z-10 mt-auto">
                      <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl transition-colors font-medium text-sm">
                        Join
                      </button>
                      <Link
                        to={`/clubs-events/club/${club.id}`}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl text-center transition-all shadow-md text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {!loading && approvedClubs.length === 0 && (
          <div className="text-center py-20">
            <Users className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-400">No clubs found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
