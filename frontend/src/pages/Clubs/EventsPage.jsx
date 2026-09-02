import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, MapPin, DollarSign, Clock, Search, List, Grid } from "lucide-react";
import api from "../../services/api";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('events/');
      setEvents(res.data);
    } catch (error) {
      console.error("Failed to load events", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    e.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Upcoming Events</h1>
          <p className="text-gray-400">Discover and join events happening around the campus</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex bg-gray-800 rounded-xl p-1 border border-gray-700">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid size={18} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700">
          <CalendarIcon size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-300">No events found</h3>
          <p className="text-gray-500">Check back later for new events.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col'}`}
            >
              <div className={`${viewMode === 'list' ? 'sm:w-48 h-48 sm:h-auto' : 'h-48'} shrink-0 relative bg-gray-700`}>
                {event.image ? (
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                    <CalendarIcon size={40} className="text-purple-400/50" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-gray-600">
                  {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                
                <div className="mt-auto space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-purple-400" />
                    {new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-pink-400" />
                    {event.location}
                  </div>
                  {event.fee > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-green-400" />
                      ৳ {event.fee}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
