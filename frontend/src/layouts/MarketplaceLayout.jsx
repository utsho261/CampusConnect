import { Outlet, NavLink } from "react-router-dom";
import { 
  Store, 
  Search, 
  PlusCircle, 
  Heart, 
  Package, 
  MessageCircle, 
  Bell 
} from "lucide-react";
import FloatingBackButton from "../components/FloatingBackButton";

export default function MarketplaceLayout() {
  const navItems = [
    { name: "Home", icon: Store, path: "/marketplace" },
    { name: "Browse Items", icon: Search, path: "/marketplace/browse" },
    { name: "Post Ad", icon: PlusCircle, path: "/marketplace/sell" },
    { name: "Wishlist", icon: Heart, path: "/marketplace/wishlist" },
    { name: "My Listings", icon: Package, path: "/marketplace/my-listings" },
    { name: "Messages", icon: MessageCircle, path: "/marketplace/messages" },
    { name: "Notifications", icon: Bell, path: "/marketplace/notifications" },
  ];

  return (
    <div className="flex h-screen overflow-hidden pt-16">
      <FloatingBackButton />
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-orange-100 flex-shrink-0 flex flex-col h-full z-10 hidden md:flex shadow-lg">
        <div className="p-4 overflow-y-auto flex-1">
          <div className="mb-6 px-4">
            <h2 className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">Campus Marketplace</h2>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/marketplace"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={20} className={isActive ? "text-white" : "text-gray-500"} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        
        {/* Premium Badge area */}
        <div className="p-4 border-t border-orange-100">
          <div className="bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-200 rounded-xl p-4 text-center shadow-inner">
            <h4 className="text-sm font-bold text-orange-800 mb-1">Campus Marketplace</h4>
            <p className="text-xs text-orange-600/80">Buy, sell, or exchange study materials on campus.</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#fffaf5] overflow-y-auto relative h-full flex flex-col">
        {/* Gradient Background Effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-50 via-white to-amber-50 pointer-events-none -z-10" />
        
        <Outlet />
      </div>
    </div>
  );
}
