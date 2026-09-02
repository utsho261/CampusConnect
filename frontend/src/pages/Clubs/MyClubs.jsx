import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Crown, Calendar, ChevronRight } from "lucide-react";
import api from "../../services/api";

export default function MyClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyClubs();
  }, []);

  const fetchMyClubs = async () => {
    try {
      const res = await api.get('clubs/');
      setClubs(res.data.filter(c => c.is_member || c.is_admin));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Clubs</h1>
        <p className="text-gray-400">Clubs you are a member of or manage</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700">
          <Users size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-300">You haven't joined any clubs</h3>
          <p className="text-gray-500 mb-6">Explore the clubs directory and find something you like.</p>
          <Link to="/clubs-events/all" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors">
            Explore Clubs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Link 
              key={club.id} 
              to={`/clubs-events/club/${club.id}`}
              className="group bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all hover:transform hover:-translate-y-1 block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                  {club.logo ? (
                    <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={24} className="text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">{club.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {club.is_admin ? (
                      <span className="text-xs bg-purple-900/50 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                        <Crown size={12} /> Admin
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-700 text-gray-300 border border-gray-600 px-2 py-0.5 rounded-full font-medium">
                        Member
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-400 border-t border-gray-700 pt-4 mt-4">
                <div className="flex items-center gap-1">
                  <Users size={14} /> {club.members_count || 0} Members
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} /> View Details <ChevronRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
