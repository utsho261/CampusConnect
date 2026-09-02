import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Ticket, Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import api from "../../services/api";

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      // Assuming a generic events list where we filter registered events, 
      // or if backend has a specific endpoint for user's registrations.
      const res = await api.get('events/');
      // For now, we'll just mock filtering or assume events return an is_registered field.
      // In a real scenario, you'd fetch from a /registrations/ endpoint.
      setRegistrations(res.data.filter(e => e.is_registered));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Registrations</h1>
        <p className="text-gray-400">Events you have registered to attend</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700">
          <Ticket size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-300">No active registrations</h3>
          <p className="text-gray-500 mb-6">You haven't registered for any events yet.</p>
          <Link to="/clubs-events/events" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors">
            Find Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((event) => (
            <div key={event.id} className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-48 h-48 sm:h-auto shrink-0 bg-gray-700">
                {event.image ? (
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <CalendarIcon size={40} className="text-gray-600" />
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{event.title}</h3>
                  <span className="bg-green-900/50 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
                    Registered
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-400 mt-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={16} className="text-purple-400" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-purple-400" />
                    {new Date(event.date).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-pink-400" />
                    {event.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
