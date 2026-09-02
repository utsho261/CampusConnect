import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Edit2, Trash2, CheckCircle, Search } from "lucide-react";
import api from "../../services/api";

export default function MyListings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active, sold, all

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      const res = await api.get('marketplace/items/my_items/');
      setItems(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (window.confirm(`Are you sure you want to mark this item as ${newStatus}?`)) {
      try {
        await api.post(`marketplace/items/${id}/update_status/`, { status: newStatus });
        localStorage.removeItem('cc_cache_marketplace_items');
        fetchMyItems(); // Refresh list
      } catch (error) {
        console.error(error);
        alert("Failed to update status.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await api.delete(`marketplace/items/${id}/`);
        localStorage.removeItem('cc_cache_marketplace_items');
        fetchMyItems(); // Refresh list
      } catch (error) {
        console.error(error);
        alert("Failed to delete item.");
      }
    }
  };

  const filteredItems = items.filter(item => {
    if (activeTab === 'active') return item.status === 'active';
    if (activeTab === 'sold') return item.status === 'sold';
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h1>
          <p className="text-gray-600">Manage the items you're selling</p>
        </div>
        <Link 
          to="/marketplace/sell"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-xl transition-colors"
        >
          Post New Ad
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['active', 'sold', 'all'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap capitalize transition-colors ${
              activeTab === tab ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-700">No items found in this tab</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md transition-shadow">
              <div className="sm:w-48 h-48 sm:h-auto shrink-0 bg-gray-50 p-2 border-r border-gray-100 flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Package size={40} className="text-gray-300" />
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-center relative">
                <div className="flex justify-between items-start mb-2 pr-24">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Link to={`/marketplace/item/${item.id}`} className="hover:text-orange-500 transition-colors">
                      {item.title}
                    </Link>
                    {item.listing_type === 'LOST_AND_FOUND' ? (
                      <span className={`text-white text-[10px] uppercase px-2 py-0.5 rounded-full ${item.lost_or_found === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}>
                        {item.lost_or_found}
                      </span>
                    ) : (
                      <span className="bg-orange-500 text-white text-[10px] uppercase px-2 py-0.5 rounded-full">For Sale</span>
                    )}
                  </h3>
                </div>
                {item.listing_type === 'FOR_SALE' && (
                  <div className="text-2xl font-bold text-gray-900 mb-2">৳ {item.price}</div>
                )}
                <div className="space-y-1 text-sm text-gray-500">
                  {item.listing_type === 'FOR_SALE' && <div>Condition: <span className="text-gray-700 capitalize">{item.condition.replace('_', ' ')}</span></div>}
                  <div>Status: 
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 uppercase">
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="absolute top-6 right-6 flex flex-col sm:flex-row gap-2">
                  {item.status === 'active' && item.listing_type === 'FOR_SALE' && (
                    <button 
                      onClick={() => handleUpdateStatus(item.id, 'sold')}
                      className="p-2 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-lg transition-colors tooltip flex items-center justify-center border border-green-200"
                      title="Mark as Sold"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  {item.status === 'active' && item.listing_type === 'LOST_AND_FOUND' && (
                    <button 
                      onClick={() => handleUpdateStatus(item.id, 'resolved')}
                      className="p-2 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-lg transition-colors tooltip flex items-center justify-center border border-green-200"
                      title="Mark as Resolved"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  <Link 
                    to={`/marketplace/item/${item.id}`} // We'll keep Edit navigating to item detail for now (or a specific edit page)
                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center border border-blue-200"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center border border-red-200"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
