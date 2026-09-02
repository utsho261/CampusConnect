import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ShoppingBag, Book, Laptop, Package, User } from "lucide-react";
import api from "../../services/api";
import { cachedGet } from "../../services/apiCache";

export default function MarketplaceHome() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [listingFilter, setListingFilter] = useState("all");

  useEffect(() => {
    fetchItems();
  }, [activeCategory]);

  const fetchItems = async () => {
    const hasCached = !!localStorage.getItem('cc_cache_marketplace_items');
    if (!hasCached) setLoading(true);
    try {
      const freshData = await cachedGet(api, 'marketplace/items/', {
        cacheKey: "marketplace_items",
        ttl: 3 * 60 * 1000,
        onCacheHit: (d) => { setItems(d); setLoading(false); },
      });
      if (freshData) setItems(freshData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          (item.course_code && item.course_code.toLowerCase().includes(search.toLowerCase())) ||
                          (item.location && item.location.toLowerCase().includes(search.toLowerCase()));
    
    let matchesFilter = true;
    if (listingFilter === "for_sale") {
      matchesFilter = item.listing_type === 'FOR_SALE';
    } else if (listingFilter === "want_to_buy") {
      matchesFilter = item.listing_type === 'WANT_TO_BUY';
    }

    let matchesCategory = true;
    if (activeCategory !== "All") {
        if (activeCategory === "Others") {
            matchesCategory = !["Books", "Electronics"].includes(item.category_name);
        } else {
            matchesCategory = item.category_name === activeCategory;
        }
    }

    return matchesSearch && matchesFilter && matchesCategory;
  });

  const categories = [
    { name: "All", icon: ShoppingBag },
    { name: "Books", icon: Book },
    { name: "Electronics", icon: Laptop },
    { name: "Others", icon: Package },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-extrabold text-gray-900">Campus Marketplace</h1>
            <Link to="/marketplace/sell" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold py-2 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 border border-orange-400">
              <span className="text-lg leading-none">+</span> Post Ad
            </Link>
          </div>
          <p className="text-gray-600 font-medium">Buy, sell, or exchange items with fellow students</p>
        </div>
        
        <div className="flex flex-col md:flex-row w-full md:w-auto gap-3">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
            <input
              type="text"
              placeholder="Search items, courses, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-orange-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 shadow-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>
          <select 
            value={listingFilter}
            onChange={(e) => setListingFilter(e.target.value)}
            className="bg-white border border-orange-200 text-gray-800 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-medium"
          >
            <option value="all">All Ads</option>
            <option value="for_sale">For Sale</option>
            <option value="want_to_buy">Want to Buy</option>
          </select>
          <button className="bg-white border border-orange-200 p-3 rounded-xl hover:bg-orange-50 text-orange-600 transition-colors shadow-sm tooltip" title="More Filters">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === cat.name
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/30"
                : "bg-white border border-orange-200 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
            }`}
          >
            <cat.icon size={18} />
            {cat.name}
          </button>
        ))}
      </div>

      {/* AI Recommendation Banner placeholder */}
      <div className="bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-orange-900 flex items-center gap-2">
            <span className="text-2xl">✨</span> Recommended For You
          </h3>
          <p className="text-orange-700 text-sm mt-1">Based on your CSE Semester-4 profile</p>
        </div>
        <div className="flex gap-2">
          {["Database System", "Operating System", "OOP Java"].map(course => (
            <span key={course} className="bg-white text-orange-700 font-semibold px-3 py-1 rounded-lg text-sm border border-orange-200 shadow-sm">
              {course}
            </span>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recently Added</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-orange-100 shadow-sm">
            <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-700">No items found</h3>
            <p className="text-gray-500">Try a different search or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Link 
                key={item.id} 
                to={`/marketplace/item/${item.id}`}
                className="bg-white border border-orange-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-300 transition-all hover:transform hover:-translate-y-1 flex flex-col"
              >
                <div className="aspect-[4/3] bg-orange-50 relative flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Book size={40} className="text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {item.listing_type === 'LOST_AND_FOUND' ? (
                      <span className={`text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg ${item.lost_or_found === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}>
                        {item.lost_or_found === 'lost' ? 'Lost' : 'Found'}
                      </span>
                    ) : (
                      <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">For Sale</span>
                    )}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  <div className="space-y-1 mb-4">
                    {item.course_code && (
                      <p className="text-xs text-orange-600 font-bold bg-orange-50 inline-block px-2 py-0.5 rounded-md border border-orange-100">
                        {item.course_code}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-orange-100 flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center gap-1 font-medium">
                      <User size={14} className="text-orange-400" />
                      {item.seller_name}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-gray-900 mb-1">৳ {item.price}</span>
                      <span className="text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-colors text-sm">
                        View
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
