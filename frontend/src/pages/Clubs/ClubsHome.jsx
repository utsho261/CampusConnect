import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Users, Calendar, ArrowRight, Heart, MessageSquare, Image } from "lucide-react";
import api from "../../services/api";
import { cachedGetAll } from "../../services/apiCache";

export default function ClubsHome() {
  const [featuredClubs, setFeaturedClubs] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // If cached data exists, don't show skeleton
      const hasCached = ["clubs_list", "clubs_posts"].some(
        k => localStorage.getItem(`cc_cache_${k}`)
      );
      if (!hasCached) setLoading(true);

      try {
        const [clubsData, postsData] = await cachedGetAll(api, [
          {
            url: "clubs/",
            cacheKey: "clubs_list",
            ttl: 3 * 60 * 1000,
            onCacheHit: (d) => {
              setFeaturedClubs(d.filter(c => c.status === 'approved').slice(0, 3));
              setLoading(false);
            },
          },
          {
            url: "posts/",
            cacheKey: "clubs_posts",
            ttl: 2 * 60 * 1000,
            onCacheHit: (d) => setRecentPosts(d.slice(0, 3)),
          },
        ]);
        if (clubsData) setFeaturedClubs(clubsData.filter(c => c.status === 'approved').slice(0, 3));
        if (postsData) setRecentPosts(postsData.slice(0, 3));
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);


  return (
    <div className="p-8 text-white max-w-7xl mx-auto space-y-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text mb-4">
          Campus Clubs & Events
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Your overview of what's happening on campus. Discover communities, join events, and stay engaged.
        </p>
      </div>

      {/* Featured Clubs */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-orange-500">🔥</span> Featured Clubs
          </h2>
          <Link to="/clubs-events/all" className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors">
            See All <ArrowRight size={18} />
          </Link>
        </div>
        
        {loading ? (
          <div className="animate-pulse flex gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 w-full md:w-1/3 bg-gray-800 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredClubs.map((club, i) => (
              <motion.div 
                key={club.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-orange-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-xl bg-gray-700 overflow-hidden shrink-0">
                    {club.logo ? <img src={club.logo} alt={club.name} className="h-full w-full object-cover" /> : <Users className="h-full w-full p-3 text-gray-500" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-orange-400 transition-colors line-clamp-1">{club.name}</h3>
                    <div className="flex items-center text-sm text-gray-400 gap-1">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" /> 4.8
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">{club.description}</p>
                <Link to={`/clubs-events/${club.id}`} className="block w-full py-2 text-center rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors font-medium text-sm">
                  View Profile
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <div className="border-t border-gray-800 my-8"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Upcoming Events Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              📅 Upcoming Events
            </h2>
            <Link to="/clubs-events/upcoming" className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors text-sm">
              See All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {/* Mock Events */}
            {[
              { title: "AI Workshop", club: "Programming Club", date: "Oct 12" },
              { title: "Hackathon 2026", club: "Technology Club", date: "Oct 15" },
              { title: "Leadership Seminar", club: "Business Club", date: "Oct 20" },
            ].map((evt, i) => (
              <div key={i} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-colors flex gap-4 cursor-pointer">
                <div className="bg-purple-900/30 rounded-lg p-3 flex flex-col items-center justify-center min-w-16 border border-purple-500/20 text-purple-300">
                  <span className="text-xs uppercase font-bold">{evt.date.split(' ')[0]}</span>
                  <span className="text-xl font-bold">{evt.date.split(' ')[1]}</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-200">{evt.title}</h4>
                  <p className="text-sm text-gray-500">{evt.club}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Posts (Community Feed Preview) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              📰 Recent Posts
            </h2>
          </div>

          <div className="space-y-6">
            {recentPosts.length === 0 ? (
               <p className="text-gray-500">No recent posts found.</p>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center font-bold overflow-hidden">
                      {post.club_logo ? <img src={post.club_logo} className="w-full h-full object-cover"/> : post.club_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-200">{post.club_name}</h4>
                      <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4 whitespace-pre-wrap line-clamp-3">
                    {post.content}
                  </p>
                  {post.image && (
                    <div className="h-48 bg-gray-700 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                      <img src={post.image} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex gap-6 text-gray-400 text-sm border-t border-gray-700 pt-4">
                    <button className="flex items-center gap-2 hover:text-pink-400 transition-colors">
                      <Heart size={18} /> {post.likes_count} Likes
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                      <MessageSquare size={18} /> {post.comments_count} Comments
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
