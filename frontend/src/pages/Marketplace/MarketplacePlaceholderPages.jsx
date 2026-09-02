import { MessageCircle, Heart, Bell } from "lucide-react";

export function Wishlist() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col items-center justify-center">
      <div className="bg-gray-800/50 p-12 rounded-3xl border border-gray-700 text-center w-full max-w-2xl">
        <Heart size={64} className="mx-auto mb-6 text-pink-500" />
        <h1 className="text-3xl font-bold text-white mb-4">Wishlist</h1>
        <p className="text-gray-400">Save items you're interested in buying later. This feature will be active soon!</p>
      </div>
    </div>
  );
}

export function Messages() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col items-center justify-center">
      <div className="bg-gray-800/50 p-12 rounded-3xl border border-gray-700 text-center w-full max-w-2xl">
        <MessageCircle size={64} className="mx-auto mb-6 text-blue-500" />
        <h1 className="text-3xl font-bold text-white mb-4">Messages</h1>
        <p className="text-gray-400">Negotiate prices and set up meetings with buyers and sellers directly on CampusConnect. (Premium Feature in development)</p>
      </div>
    </div>
  );
}

export function Notifications() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col items-center justify-center">
      <div className="bg-gray-800/50 p-12 rounded-3xl border border-gray-700 text-center w-full max-w-2xl">
        <Bell size={64} className="mx-auto mb-6 text-purple-500" />
        <h1 className="text-3xl font-bold text-white mb-4">Notifications</h1>
        <p className="text-gray-400">Get alerts for price drops, new listings in your courses, and chat messages.</p>
      </div>
    </div>
  );
}
