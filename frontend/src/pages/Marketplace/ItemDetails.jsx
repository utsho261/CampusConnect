import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MessageCircle, Heart, Share2, Tag, Book, User, Phone, Edit, Trash2, X, MapPin, Calendar, Gift } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  
  const [showOffer, setShowOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerSending, setOfferSending] = useState(false);

  const username = localStorage.getItem("username");

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = () => {
    api.get(`marketplace/items/${id}/`).then(res => {
      setItem(res.data);
      setEditForm({
        title: res.data.title,
        price: res.data.price,
        condition: res.data.condition,
        course_code: res.data.course_code || "",
        department: res.data.department || "",
        semester: res.data.semester || "",
        description: res.data.description || "",
        location: res.data.location || "",
        date_lost_found: res.data.date_lost_found || "",
        reward: res.data.reward || "",
      });
      setLoading(false);
    }).catch(console.error);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setDeleteLoading(true);
    try {
      await api.delete(`marketplace/items/${id}/`);
      localStorage.removeItem('cc_cache_marketplace_items');
      toast.success("Item deleted successfully");
      navigate("/marketplace");
    } catch (e) {
      toast.error("Failed to delete item");
      setDeleteLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    setSaving(true);
    try {
      await api.patch(`marketplace/items/${id}/`, editForm);
      localStorage.removeItem('cc_cache_marketplace_items');
      toast.success("Item updated successfully");
      setShowEdit(false);
      fetchItem();
    } catch (e) {
      toast.error("Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  const handleMessage = async () => {
    try {
       const res = await api.post('marketplace/conversations/', { item_id: id });
       navigate('/marketplace/messages', { state: { activeConv: res.data } });
    } catch (e) {
       console.error(e);
       toast.error("Failed to initiate chat");
    }
  };

  const handleMakeOffer = async () => {
      setOfferSending(true);
      try {
          await api.post('marketplace/offers/', { item_id: id, amount: offerAmount });
          toast.success("Offer sent successfully!");
          setShowOffer(false);
          setOfferAmount("");
      } catch (e) {
          toast.error("Failed to send offer");
      } finally {
          setOfferSending(false);
      }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full py-20">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!item) return <div className="text-gray-900 text-center py-20">Item not found</div>;

  const isForSale = item.listing_type === 'FOR_SALE';
  const displayPhone = item.contact_number || item.seller_phone;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-sm">
        
        {/* Left: Image */}
        <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-8 min-h-[400px] border-r border-gray-100">
          {item.image ? (
            <img src={item.image} alt={item.title} className="max-w-full max-h-[500px] object-contain rounded-xl shadow-lg" />
          ) : (
            <Book size={120} className="text-gray-300" />
          )}
        </div>

        {/* Right: Details */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 uppercase tracking-wider">
              {item.category_name || "Item"}
            </span>
            {item.listing_type === 'LOST_AND_FOUND' ? (
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${item.lost_or_found === 'lost' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-green-100 text-green-600 border-green-200'}`}>
                {item.lost_or_found === 'lost' ? 'Lost' : 'Found'}
              </span>
            ) : (
              <span className="ml-2 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 uppercase tracking-wider">
                For Sale
              </span>
            )}
            <div className="flex gap-2 ml-auto">
              <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                <Share2 size={18} />
              </button>
              <button className={`p-2 rounded-full transition-colors ${item.is_saved ? 'bg-red-100 text-red-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                <Heart size={18} fill={item.is_saved ? "currentColor" : "none"} />
              </button>
            </div>
            </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
          
          {isForSale ? (
            <div className="flex items-end gap-3 mb-6">
              <span className="text-4xl font-bold text-gray-900">৳ {item.price}</span>
              {item.is_negotiable && (
                <span className="text-sm text-green-600 font-medium mb-1 flex items-center gap-1">
                  <Tag size={14} /> Negotiable
                </span>
              )}
            </div>
          ) : (
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin size={18} className="text-orange-500" />
                <span className="font-medium">{item.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={18} className="text-orange-500" />
                <span className="font-medium">{item.date_lost_found}</span>
              </div>
              {item.reward && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Gift size={18} className="text-green-500" />
                  <span className="font-medium text-green-600">Reward: {item.reward}</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            {isForSale && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Condition</p>
                <p className="text-gray-900 font-medium capitalize">{item.condition.replace('_', ' ')}</p>
              </div>
            )}
            {item.course_code && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Course Code</p>
                <p className="text-purple-600 font-mono font-medium">{item.course_code}</p>
              </div>
            )}
            {item.department && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Department</p>
                <p className="text-gray-900 font-medium">{item.department}</p>
              </div>
            )}
            {item.semester && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Semester</p>
                <p className="text-gray-900 font-medium">{item.semester}</p>
              </div>
            )}
          </div>

          <div className="mb-8 flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-inner">
                  <User className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{item.listing_type === 'LOST_AND_FOUND' ? 'Posted by' : 'Listed by'}</p>
                  <p className="text-gray-900 font-bold">{item.seller_name}</p>
                </div>
              </div>
              {displayPhone && (
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium flex items-center justify-end gap-1"><Phone size={12}/> Phone</p>
                  <p className="text-gray-900 font-bold">{displayPhone}</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {item.seller_name === username ? (
                <>
                  <button onClick={() => setShowEdit(true)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <Edit size={20} />
                    Edit
                  </button>
                  <button onClick={handleDelete} disabled={deleteLoading} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <Trash2 size={20} />
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleMessage} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <MessageCircle size={20} />
                    Message
                  </button>
                  {isForSale && item.is_negotiable && (
                    <button onClick={() => setShowOffer(true)} className="flex-1 bg-white hover:bg-gray-50 text-gray-800 font-bold py-4 rounded-xl transition-colors border border-gray-200 shadow-sm">
                      Make Offer
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {showOffer && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-xl text-gray-900">Make an Offer</h3>
                      <button onClick={() => setShowOffer(false)} className="text-gray-500 hover:text-gray-700"><X size={20}/></button>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">Propose a price for <span className="font-bold text-gray-900">{item.title}</span>. The seller will be notified.</p>
                  <div className="relative mb-6">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">৳</span>
                      <input 
                          type="number" 
                          value={offerAmount} 
                          onChange={e => setOfferAmount(e.target.value)} 
                          placeholder={item.price}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                  </div>
                  <button 
                      onClick={handleMakeOffer} 
                      disabled={!offerAmount || offerSending}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                      {offerSending ? 'Sending...' : 'Send Offer'}
                  </button>
              </div>
          </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 max-w-lg w-full my-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Item</h2>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
              
              {isForSale ? (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Price (৳)</label>
                    <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Condition</label>
                    <select value={editForm.condition} onChange={e => setEditForm({...editForm, condition: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                      <option value="new">New</option>
                      <option value="like_new">Like New</option>
                      <option value="good">Good</option>
                      <option value="used">Used</option>
                      <option value="damaged">Damaged</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Location</label>
                    <input type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                    <input type="date" value={editForm.date_lost_found} onChange={e => setEditForm({...editForm, date_lost_found: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Reward</label>
                    <input type="text" value={editForm.reward} onChange={e => setEditForm({...editForm, reward: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={4} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"></textarea>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Contact Number</label>
                <input type="text" value={editForm.contact_number || ""} onChange={e => setEditForm({...editForm, contact_number: e.target.value})} placeholder="e.g. 01700000000" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowEdit(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleEditSubmit} disabled={saving} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
