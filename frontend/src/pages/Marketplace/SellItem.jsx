import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Save, AlertTriangle } from "lucide-react";
import api from "../../services/api";

export default function SellItem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    listing_type: "FOR_SALE", // 'FOR_SALE' or 'WANT_TO_BUY'
    price: "",
    condition: "good",
    is_negotiable: true,
    course_code: "",
    department: "",
    semester: "",
    description: "",
    contact_number: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    api.get('marketplace/categories/').then(res => setCategories(res.data)).catch(console.error);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== "" && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });
    if (image) {
      data.append("image", image);
    }

    try {
      await api.post('marketplace/items/', data);
      localStorage.removeItem('cc_cache_marketplace_items');
      navigate('/marketplace');
    } catch (error) {
      console.error(error);
      alert("Failed to create listing.");
    } finally {
      setLoading(false);
    }
  };

  const isForSale = formData.listing_type === 'FOR_SALE';

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Post an Ad</h1>
        <p className="text-gray-600 font-medium">List items you want to sell or request items you want to buy on campus.</p>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-r from-red-50 via-white to-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-4 shadow-[0_0_20px_rgba(239,68,68,0.15)] group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>
        <AlertTriangle className="text-red-500 shrink-0 mt-0.5 animate-bounce" size={28} />
        <div className="relative z-10">
          <h3 className="text-red-700 font-extrabold mb-1 text-lg">Disclaimer: Strictly Monitored</h3>
          <p className="text-red-600/90 font-medium text-sm leading-relaxed">
            Do not post fake, inappropriate, or illegal items. All activities on CampusConnect are strictly monitored. Since you are logged in, your account details and ID are recorded with this listing. Any violation will result in immediate permanent suspension and reporting to the university authority.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-xl shadow-orange-100/60 border border-orange-100 rounded-3xl p-8 space-y-6">
        
        {/* Listing Type Toggle: For Sale vs Want to Buy */}
        <div className="flex gap-4 p-1.5 bg-orange-50 rounded-xl border border-orange-100">
          <button
            type="button"
            onClick={() => setFormData({...formData, listing_type: 'FOR_SALE'})}
            className={`flex-1 py-3 rounded-lg font-bold transition-all duration-300 ${isForSale ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]' : 'text-orange-700 hover:bg-orange-100'}`}
          >
            For Sale
          </button>
          <button
            type="button"
            onClick={() => setFormData({...formData, listing_type: 'WANT_TO_BUY'})}
            className={`flex-1 py-3 rounded-lg font-bold transition-all duration-300 ${!isForSale ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]' : 'text-emerald-700 hover:bg-emerald-50'}`}
          >
            Want to Buy
          </button>
        </div>

        {/* Basic Info */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Item Title *</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder={isForSale ? "e.g. Database System Concepts 7th Edition" : "e.g. Looking for CSE220 Book 7th Edition"}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
              <select
                required
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Condition *</label>
              <select
                required
                value={formData.condition}
                onChange={e => setFormData({...formData, condition: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
              >
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="used">Used</option>
                <option value="damaged">Any Condition</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{isForSale ? 'Price (Tk) *' : 'Budget (Tk) *'}</label>
            <input
              required
              type="number"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              placeholder={isForSale ? "450" : "Budget e.g. 500"}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
            />
          </div>
          <div className="flex items-center mt-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.is_negotiable}
                onChange={e => setFormData({...formData, is_negotiable: e.target.checked})}
                className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 focus:ring-offset-white bg-white cursor-pointer"
              />
              <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">Price is negotiable</span>
            </label>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Academic Details (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Course Code</label>
              <input
                type="text"
                value={formData.course_code}
                onChange={e => setFormData({...formData, course_code: e.target.value})}
                placeholder="e.g. CSE220"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                placeholder="e.g. CSE"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Semester</label>
              <input
                type="text"
                value={formData.semester}
                onChange={e => setFormData({...formData, semester: e.target.value})}
                placeholder="e.g. 4th"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder={isForSale ? "Describe the item, condition, any highlights..." : "Describe the item you are looking for..."}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none resize-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Contact Number (Optional)</label>
            <input
              type="text"
              value={formData.contact_number}
              onChange={e => setFormData({...formData, contact_number: e.target.value})}
              placeholder="e.g. 01700000000"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{isForSale ? 'Image *' : 'Sample Image (Optional)'}</label>
            {imagePreview ? (
              <div className="relative w-full h-48 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden shadow-inner">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => { setImage(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-white p-1.5 rounded-full text-red-500 hover:bg-red-50 shadow-md transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 bg-orange-50/50 border-2 border-dashed border-orange-200 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-orange-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-600"><span className="font-bold text-orange-600">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required={isForSale} />
              </label>
            )}
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={20} />
                {isForSale ? 'Post For Sale Ad' : 'Post Want to Buy Ad'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
