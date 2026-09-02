import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Image as ImageIcon, Calendar, Edit, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function CommunityFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [editForm, setEditForm] = useState({ content: "" });
  const [saving, setSaving] = useState(false);

  const username = localStorage.getItem("username");

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await api.get("posts/");
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, clubId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setDeleteLoading(true);
    try {
      await api.delete(`clubs/${clubId}/posts/${id}/`);
      toast.success("Post deleted successfully");
      fetchFeed();
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
      // Find the club ID for this post
      const post = posts.find(p => p.id === editPostId);
      await api.patch(`clubs/${post.club}/posts/${editPostId}/`, editForm);
      toast.success("Post updated successfully");
      setShowEdit(false);
      fetchFeed();
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

  const handleLike = async (postId, clubId) => {
    try {
      await api.post(`clubs/${clubId}/posts/${postId}/like/`);
      // Update locally
      setPosts(posts.map(post => {
        if (post.id === postId) {
          const isLiked = !post.is_liked;
          return {
            ...post,
            is_liked: isLiked,
            likes_count: isLiked ? post.likes_count + 1 : post.likes_count - 1
          };
        }
        return post;
      }));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text mb-2">
          Community Feed
        </h1>
        <p className="text-gray-400">Updates, announcements, and moments from all campus clubs.</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-gray-800 rounded-2xl border border-gray-700">
          <ImageIcon className="mx-auto text-gray-600 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-400">No posts yet</h3>
          <p className="text-gray-500 mt-2">Check back later for updates from your favorite clubs.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <Link to={`/clubs-events/${post.club}`} className="flex items-center gap-3 group">
                  <div className="h-12 w-12 bg-gray-700 rounded-full flex items-center justify-center font-bold overflow-hidden">
                    {post.club_logo ? <img src={post.club_logo} className="w-full h-full object-cover"/> : post.club_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-200 group-hover:text-purple-400 transition-colors">{post.club_name}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12}/>
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                </Link>

              </div>
              
              <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>
              
              {post.image && (
                <div className="rounded-xl overflow-hidden mb-4 bg-gray-900 border border-gray-700">
                  <img src={post.image} alt="Post image" className="w-full h-auto object-cover max-h-96" />
                </div>
              )}
              
              <div className="flex gap-6 text-gray-400 text-sm border-t border-gray-700 pt-4">
                <button 
                  onClick={() => handleLike(post.id, post.club)}
                  className={`flex items-center gap-2 transition-colors ${post.is_liked ? 'text-pink-500' : 'hover:text-pink-400'}`}
                >
                  <Heart size={18} className={post.is_liked ? 'fill-pink-500' : ''} /> 
                  {post.likes_count} Likes
                </button>
                <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                  <MessageSquare size={18} /> {post.comments_count} Comments
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-lg w-full">
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
