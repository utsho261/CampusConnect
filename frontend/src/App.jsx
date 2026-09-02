import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import LandingPage from "./components/pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotesRepository from "./pages/NotesRepository";
import CTQuestionBank from "./pages/CTQuestionBank";
import JobsBoard from "./pages/JobsBoard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import BloodDonation from "./pages/BloodDonation";
import AssignmentCoverGenerator from "./pages/AssignmentCoverGenerator";
import ProfileSettings from "./pages/ProfileSettings";
import ClubsLayout from "./layouts/ClubsLayout";
import ClubsHome from "./pages/Clubs/ClubsHome";
import ClubsList from "./pages/Clubs/ClubsList";
import ClubDetails from "./pages/Clubs/ClubDetails";
import EventsPage from "./pages/Clubs/EventsPage";
import MyClubs from "./pages/Clubs/MyClubs";
import MyRegistrations from "./pages/Clubs/MyRegistrations";
import CommunityFeed from "./pages/Clubs/CommunityFeed";
import { Leaderboard as ClubLeaderboard, Gallery, Notifications, Settings } from "./pages/Clubs/PlaceholderPages";
import LostFound from "./pages/LostFound";
import Leaderboard from "./pages/Leaderboard";
import Placeholder from "./pages/Clubs/Placeholder";

import MarketplaceLayout from "./layouts/MarketplaceLayout";
import MarketplaceHome from "./pages/Marketplace/MarketplaceHome";
import SellItem from "./pages/Marketplace/SellItem";
import ItemDetails from "./pages/Marketplace/ItemDetails";
import MyListings from "./pages/Marketplace/MyListings";
import MarketplaceChat from "./pages/Marketplace/MarketplaceChat";
import { Wishlist, Notifications as MarketplaceNotifications } from "./pages/Marketplace/MarketplacePlaceholderPages";

import EmergencyLayout from "./layouts/EmergencyLayout";
import EmergencyHome from "./pages/Emergency/EmergencyHome";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Protected Routes - require login and verification */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute><NotesRepository /></ProtectedRoute>} />
      <Route path="/ct-questions" element={<ProtectedRoute><CTQuestionBank /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><JobsBoard /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute checkVerification={false}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/blood-donation" element={<ProtectedRoute><BloodDonation /></ProtectedRoute>} />
      <Route path="/lost-found" element={<ProtectedRoute><LostFound /></ProtectedRoute>} />
      <Route path="/assignment-cover" element={<ProtectedRoute><AssignmentCoverGenerator /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      
      {/* Profile & Verification Routes - require login but NOT verification (to allow verifying) */}
      <Route path="/profile" element={<ProtectedRoute checkVerification={false}><ProfileSettings /></ProtectedRoute>} />
      <Route path="/verification" element={<ProtectedRoute checkVerification={false}><ProfileSettings defaultTab="verification" /></ProtectedRoute>} />
      
      <Route path="/clubs-events" element={<ProtectedRoute><ClubsLayout /></ProtectedRoute>}>
        <Route index element={<ClubsHome />} />
        <Route path="featured" element={<Placeholder title="Featured Clubs" />} />
        <Route path="all" element={<ClubsList />} />
        <Route path="my-clubs" element={<MyClubs />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="upcoming" element={<EventsPage />} />
        <Route path="calendar" element={<EventsPage />} />
        <Route path="registrations" element={<MyRegistrations />} />
        <Route path="feed" element={<CommunityFeed />} />
        <Route path="leaderboard" element={<ClubLeaderboard />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="club/:id" element={<ClubDetails />} />
      </Route>
      
      <Route path="/marketplace" element={<ProtectedRoute><MarketplaceLayout /></ProtectedRoute>}>
        <Route index element={<MarketplaceHome />} />
        <Route path="browse" element={<MarketplaceHome />} />
        <Route path="sell" element={<SellItem />} />
        <Route path="item/:id" element={<ItemDetails />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="my-listings" element={<MyListings />} />
        <Route path="messages" element={<MarketplaceChat />} />
        <Route path="notifications" element={<MarketplaceNotifications />} />
      </Route>
      
      <Route path="/emergency" element={<ProtectedRoute><EmergencyLayout /></ProtectedRoute>}>
        <Route index element={<EmergencyHome />} />
        <Route path=":category" element={<EmergencyHome />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
