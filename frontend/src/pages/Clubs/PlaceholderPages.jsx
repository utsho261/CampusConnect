import { Trophy, Image as ImageIcon, Bell, Settings as SettingsIcon } from "lucide-react";

export function Leaderboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col items-center justify-center">
      <div className="bg-gray-800/50 p-12 rounded-3xl border border-gray-700 text-center w-full max-w-2xl">
        <Trophy size={64} className="mx-auto mb-6 text-yellow-500" />
        <h1 className="text-3xl font-bold text-white mb-4">Leaderboard</h1>
        <p className="text-gray-400">Compete with other clubs! The ranking system based on activity points will be available in the next update.</p>
      </div>
    </div>
  );
}

export function Gallery() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col items-center justify-center">
      <div className="bg-gray-800/50 p-12 rounded-3xl border border-gray-700 text-center w-full max-w-2xl">
        <ImageIcon size={64} className="mx-auto mb-6 text-pink-500" />
        <h1 className="text-3xl font-bold text-white mb-4">Gallery</h1>
        <p className="text-gray-400">A visual journey through all campus events. Photo uploading and tagging features are coming soon.</p>
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
        <p className="text-gray-400">You're all caught up! Club and event alerts will appear here.</p>
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col items-center justify-center">
      <div className="bg-gray-800/50 p-12 rounded-3xl border border-gray-700 text-center w-full max-w-2xl">
        <SettingsIcon size={64} className="mx-auto mb-6 text-blue-500" />
        <h1 className="text-3xl font-bold text-white mb-4">Settings</h1>
        <p className="text-gray-400">Manage your notification preferences, privacy, and connected accounts.</p>
      </div>
    </div>
  );
}
