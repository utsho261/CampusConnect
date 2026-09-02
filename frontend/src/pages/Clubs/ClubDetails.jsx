import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Users, Plus, ArrowLeft, Edit, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import CreateEventModal from "../../components/Clubs/CreateEventModal";
import CreatePostModal from "../../components/Clubs/CreatePostModal";

export default function ClubDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [editForm, setEditForm] = useState({ content: "" });
  const [saving, setSaving] = useState(false);

  const username = localStorage.getItem("username");

  useEffect(() => {
    fetchClubDetails();
  }, [id]);

  const fetchClubDetails = async () => {
    try {
      const [clubRes, eventsRes, membersRes, postsRes] = await Promise.all([
        api.get(`clubs/${id}/`),
        api.get(`clubs/${id}/events/`),
        api.get(`clubs/${id}/members/`),
        api.get(`clubs/${id}/posts/`)
      ]);
      setClub(clubRes.data);
      setEvents(eventsRes.data);
      setMembers(membersRes.data);
      setPosts(postsRes.data);

      if (clubRes.data.is_admin) {
        const appsRes = await api.get(`clubs/${id}/applications/`);
        setApplications(appsRes.data);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      if (club.requires_application) {
        setShowApplyModal(true);
      } else {
        await api.post(`clubs/${id}/join/`);
        fetchClubDetails();
      }
    } catch (error) {
      console.error("Error joining club:", error);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.post(`clubs/${id}/apply/`, { message: applyMessage });
      setShowApplyModal(false);
      setApplyMessage("");
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Error applying:", error);
      alert(error.response?.data?.detail || "Error applying");
    }
  };

  const handleProcessApplication = async (appId, action) => {
    try {
      await api.post(`clubs/${id}/applications/${appId}/process/`, { action });
      fetchClubDetails(); // refresh
    } catch (error) {
      console.error("Error processing application:", error);
    }
  };

  const handleRegisterEvent = async (eventId) => {
    try {
      await api.post(`clubs/${id}/events/${eventId}/register/`);
      fetchClubDetails();
      toast.success("Registered successfully!");
    } catch (error) {
      console.error("Error registering:", error);
      toast.error(error.response?.data?.detail || "Registration failed");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setDeleteLoading(true);
    try {
      await api.delete(`clubs/${id}/posts/${postId}/`);
      toast.success("Post deleted successfully");
      fetchClubDetails();
    } catch (e) {
      toast.error("Failed to delete post");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.content.trim()) return;
    setSaving(true);
    try {
      await api.patch(`clubs/${id}/posts/${editPostId}/`, editForm);
      toast.success("Post updated successfully");
      setShowEdit(false);
      fetchClubDetails();
    } catch (err) {
      toast.error("Failed to update post");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (post) => {
    setEditPostId(post.id);
    setEditForm({ content: post.content });
    setShowEdit(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!club) return <div className="text-white">Club not found</div>;

  return (
    <div className="bg-gray-900 text-white min-h-full">
      {/* Hero Section */}
      <div className="relative h-80 bg-gray-800 overflow-hidden">
        {club.cover_image ? (
          <img src={club.cover_image} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-gray-900/80 z-10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
        <button 
          onClick={() => navigate('/clubs-events')}
          className="absolute top-8 left-8 z-20 flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm"
        >
          <ArrowLeft size={20} /> Back to Clubs
        </button>
        
        <div className="absolute bottom-0 left-0 right-0 z-20 p-8 max-w-7xl mx-auto flex items-end gap-6">
          <div className="h-32 w-32 rounded-2xl bg-gray-800 border-4 border-gray-900 shadow-xl overflow-hidden shrink-0 flex items-center justify-center">
            {club.logo ? (
              <img src={club.logo} alt={club.name} className="h-full w-full object-cover" />
            ) : (
              <Users size={48} className="text-gray-500" />
            )}
          </div>
          <div className="flex-grow mb-2">
            <h1 className="text-4xl font-bold text-white mb-2">{club.name}</h1>
            <div className="flex gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1 bg-purple-900/50 px-3 py-1 rounded-full border border-purple-500/30">
                {club.category ? club.category.charAt(0).toUpperCase() + club.category.slice(1) : 'Club'}
              </span>
              <span className="flex items-center gap-1"><Users size={16} /> {members.length} Members</span>
              <span className="flex items-center gap-1">Established: {club.established_date || 'Unknown'}</span>
            </div>
          </div>
          <div className="mb-2">
            {!club.is_member && (
              <button 
                onClick={handleJoin}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Join Club
              </button>
            )}
            {club.is_member && !club.is_admin && (
              <span className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 font-bold rounded-xl">
                Member
              </span>
            )}
            {club.is_admin && (
              <span className="px-6 py-3 bg-purple-900/50 border border-purple-500 text-purple-300 font-bold rounded-xl flex items-center gap-2">
                👑 Admin
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - Info & Tabs */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">About Us</h2>
            <p className="text-gray-400 leading-relaxed whitespace-pre-line">{club.description}</p>
          </div>

          <div className="border-b border-gray-800 mb-8 flex gap-8 overflow-x-auto pb-2 scrollbar-hide">
            {['posts', 'events', 'members', 'executives', 'gallery', ...(club.is_admin ? ['applications', 'pending posts', 'settings'] : [])].map(tab => (
              <button 
                key={tab}
                className={`pb-2 text-lg font-medium transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'posts' && (
              <motion.div 
                key="posts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Community Posts</h3>
                  {(club.is_member || club.is_admin || localStorage.getItem('role') === 'admin') && (
                    <button 
                      onClick={() => setIsPostModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-purple-400 border border-purple-500/30 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Plus size={16} /> Create Post
                    </button>
                  )}
                </div>
                {posts.filter(p => p.status === 'approved').length === 0 ? (
                  <div className="bg-gray-800/50 rounded-2xl p-8 text-center border border-gray-800">
                    <p className="text-gray-400">No approved posts yet.</p>
                  </div>
                ) : (
                  posts.filter(p => p.status === 'approved').map(post => (
                    <div key={post.id} className="relative bg-gray-800 p-6 rounded-2xl border border-gray-700">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold overflow-hidden">
                          {post.club_logo ? <img src={post.club_logo} className="w-full h-full object-cover"/> : "P"}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-200">{post.club_name}</h4>
                          <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="absolute top-6 right-6">
                      </div>
                      <p className="text-gray-300 mb-4 whitespace-pre-wrap mt-2">{post.content}</p>
                      {post.image && (
                        <div className="rounded-xl overflow-hidden mb-4">
                          <img src={post.image} alt="Post image" className="w-full h-auto" />
                        </div>
                      )}
                      <div className="flex gap-6 text-gray-400 text-sm border-t border-gray-700 pt-4">
                        <button className="flex items-center gap-2 hover:text-pink-400 transition-colors">
                          <Heart size={18} className={post.is_liked ? "fill-pink-500 text-pink-500" : ""} /> {post.likes_count} Likes
                        </button>
                        <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                          <MessageSquare size={18} /> {post.comments_count} Comments
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
            
            {activeTab === 'pending posts' && club.is_admin && (
              <motion.div 
                key="pending-posts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Pending Post Approvals</h3>
                </div>
                {posts.filter(p => p.status === 'pending').length === 0 ? (
                  <div className="bg-gray-800/50 rounded-2xl p-8 text-center border border-gray-800">
                    <p className="text-gray-400">No pending posts to review.</p>
                  </div>
                ) : (
                  posts.filter(p => p.status === 'pending').map(post => (
                    <div key={post.id} className="relative bg-gray-800 p-6 rounded-2xl border border-gray-700">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold overflow-hidden">
                          {post.club_logo ? <img src={post.club_logo} className="w-full h-full object-cover"/> : "P"}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-200">User: {post.created_by?.username} <span className="text-purple-400 font-normal">(Pending)</span></h4>
                          <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="absolute top-6 right-6">
                      </div>
                      <p className="text-gray-300 mb-4 whitespace-pre-wrap mt-2">{post.content}</p>
                      {post.image && (
                        <div className="rounded-xl overflow-hidden mb-4">
                          <img src={post.image} alt="Post image" className="w-full h-auto" />
                        </div>
                      )}
                      <div className="flex gap-4 pt-4 border-t border-gray-700">
                        <button 
                          onClick={() => {
                            api.post(`clubs/${club.id}/posts/${post.id}/approve/`).then(() => {
                              alert("Post approved!");
                              window.location.reload();
                            }).catch(console.error);
                          }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm("Reject this post?")) {
                              api.post(`clubs/${club.id}/posts/${post.id}/reject/`).then(() => {
                                alert("Post rejected.");
                                window.location.reload();
                              }).catch(console.error);
                            }
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div 
                key="events"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Upcoming Events</h3>
                  {club.is_admin && (
                    <button 
                      onClick={() => setIsEventModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-purple-400 border border-purple-500/30 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Plus size={16} /> Create Event
                    </button>
                  )}
                </div>
                
                {events.length === 0 ? (
                  <div className="bg-gray-800/50 rounded-2xl p-8 text-center border border-gray-800">
                    <Calendar className="mx-auto text-gray-600 mb-3" size={40} />
                    <p className="text-gray-400">No events scheduled yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={event.id} 
                        className="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-gray-600 transition-colors flex flex-col md:flex-row gap-6"
                      >
                        <div className="md:w-1/4 shrink-0">
                          <div className="bg-gray-900 text-center rounded-xl p-3 border border-gray-800">
                            <div className="text-purple-400 text-sm font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                            <div className="text-3xl font-bold text-white">{new Date(event.date).getDate()}</div>
                            <div className="text-gray-500 text-xs mt-1">{new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white mb-2">{event.title}</h4>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                            <MapPin size={16} />
                            {event.location}
                          </div>
                          {event.registration_link ? (
                            <a 
                              href={event.registration_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-bold rounded-lg shadow-lg hover:from-pink-400 hover:to-purple-400 transition-colors"
                            >
                              Register Here (External)
                            </a>
                          ) : (
                            <button
                              onClick={() => handleRegisterEvent(event.id)}
                              disabled={event.is_registered || event.status === 'full' || event.status === 'completed'}
                              className={`inline-block px-6 py-2 text-white text-sm font-bold rounded-lg shadow-lg transition-colors ${
                                event.is_registered 
                                  ? 'bg-gray-600 cursor-not-allowed' 
                                  : event.status === 'full' 
                                    ? 'bg-red-900/50 text-red-300 cursor-not-allowed'
                                    : event.status === 'completed'
                                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400'
                              }`}
                            >
                              {event.is_registered ? 'Registered ✔' : event.status === 'full' ? 'Event Full' : event.status === 'completed' ? 'Completed' : 'Register Now'}
                            </button>
                          )}
                          <div className="mt-2 text-gray-500 text-xs">
                            {event.registrations_count || 0} registered {event.seat_capacity ? `/ ${event.seat_capacity} seats` : ''}
                          </div>
                        </div>
                        {event.image && (
                          <div className="md:w-1/3 shrink-0">
                            <img 
                              src={event.image} 
                              alt={`${event.title} poster`} 
                              className="w-full h-48 object-cover rounded-xl border border-gray-700 shadow-lg"
                            />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'members' && (
              <motion.div 
                key="members"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
              >
                {members.map(member => (
                  <div key={member.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-900/50 rounded-full flex items-center justify-center text-purple-300 font-bold">
                      {member.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-200">{member.user.username}</div>
                      <div className={`text-xs ${member.role === 'admin' ? 'text-purple-400' : 'text-gray-500'}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'executives' && (
              <motion.div 
                key="executives"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {members.filter(m => ['admin', 'president', 'vice_president', 'executive', 'advisor'].includes(m.role)).length === 0 ? (
                  <p className="text-gray-500 col-span-2">No executives listed.</p>
                ) : (
                  members.filter(m => ['admin', 'president', 'vice_president', 'executive', 'advisor'].includes(m.role)).map(member => (
                    <div key={member.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
                      <div className="h-12 w-12 bg-purple-900/50 rounded-full flex items-center justify-center text-purple-300 font-bold text-xl">
                        {member.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-200">{member.user.first_name} {member.user.last_name || member.user.username}</div>
                        <div className="text-sm text-purple-400 font-medium">
                          {member.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'gallery' && (
              <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-gray-500 text-center py-10">Gallery coming soon in Phase 3.</p>
              </motion.div>
            )}
            
            {activeTab === 'applications' && club.is_admin && (
              <motion.div 
                key="applications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {applications.length === 0 ? (
                  <p className="text-gray-500 text-center py-10">No pending applications.</p>
                ) : (
                  applications.map(app => (
                    <div key={app.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <div className="font-bold text-gray-200 text-lg mb-1">{app.user.username}</div>
                        <div className="text-gray-400 text-sm mb-3">Applied on: {new Date(app.applied_at).toLocaleDateString()}</div>
                        {app.message && <div className="text-gray-300 italic">"{app.message}"</div>}
                      </div>
                      <div className="flex gap-3 shrink-0">
                        {app.status === 'pending' ? (
                          <>
                            <button onClick={() => handleProcessApplication(app.id, 'accept')} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors">Accept</button>
                            <button onClick={() => handleProcessApplication(app.id, 'reject')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">Reject</button>
                          </>
                        ) : (
                          <span className={`px-4 py-2 rounded-lg font-bold ${app.status === 'accepted' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
            
            {activeTab === 'settings' && club.is_admin && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gray-800 p-6 rounded-2xl border border-gray-700"
              >
                <h3 className="text-xl font-bold mb-6">Club Settings</h3>
                <form className="space-y-4" onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const formData = new FormData(e.target);
                    // Just basic fields for now, actual implementation would handle files properly
                    await api.patch(`clubs/${id}/`, {
                      description: formData.get('description'),
                      facebook_link: formData.get('facebook_link'),
                      website: formData.get('website'),
                      email: formData.get('email'),
                      requires_application: formData.get('requires_application') === 'on'
                    });
                    fetchClubDetails();
                    alert("Settings updated!");
                  } catch (err) {
                    alert("Error updating settings");
                  }
                }}>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Description</label>
                    <textarea name="description" defaultValue={club.description} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 min-h-32" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Facebook Link</label>
                      <input name="facebook_link" type="url" defaultValue={club.facebook_link} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Website</label>
                      <input name="website" type="url" defaultValue={club.website} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Contact Email</label>
                    <input name="email" type="email" defaultValue={club.email} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3" />
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <input type="checkbox" name="requires_application" id="requires_application" defaultChecked={club.requires_application} className="w-5 h-5 bg-gray-900 border-gray-700 rounded text-purple-500 focus:ring-purple-500" />
                    <label htmlFor="requires_application" className="text-gray-300">Require applications to join this club</label>
                  </div>
                  <div className="pt-4 text-right">
                    <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors">
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
            <h3 className="font-bold text-lg mb-4 text-white border-b border-gray-700 pb-2">Club Info</h3>
            <div className="text-gray-400 text-sm space-y-3">
              <p><strong>Created By:</strong> {club.created_by?.username || 'System'}</p>
              <p><strong>Visibility:</strong> Public</p>
              {club.facebook_link && (
                <p>
                  <strong>Facebook:</strong> <a href={club.facebook_link} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline break-all">{club.facebook_link}</a>
                </p>
              )}
              {club.website && (
                <p>
                  <strong>Website:</strong> <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline break-all">{club.website}</a>
                </p>
              )}
              {club.email && (
                <p>
                  <strong>Email:</strong> <a href={`mailto:${club.email}`} className="text-purple-400 hover:underline break-all">{club.email}</a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateEventModal 
        isOpen={isEventModalOpen} 
        onClose={() => setIsEventModalOpen(false)} 
        clubId={id}
        onEventCreated={fetchClubDetails}
      />

      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        clubId={id}
        onPostCreated={fetchClubDetails}
      />

      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-lg p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Apply to Join {club.name}</h2>
              <form onSubmit={handleApply}>
                <div className="mb-6">
                  <label className="block text-gray-400 text-sm font-bold mb-2">
                    Why do you want to join this club?
                  </label>
                  <textarea
                    value={applyMessage}
                    onChange={(e) => setApplyMessage(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 h-32 resize-none"
                    placeholder="Briefly describe your interest and any relevant experience..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-6 py-2 rounded-xl text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition-all"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-lg w-full z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Edit Post</h2>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <textarea
                value={editForm.content}
                onChange={e => setEditForm({...editForm, content: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500"
                rows="4"
                required
              />
              <div className="flex gap-4 mt-4">
                <button type="button" onClick={() => setShowEdit(false)} className="flex-1 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
