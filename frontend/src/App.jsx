import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";

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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/notes" element={<NotesRepository />} />
      <Route path="/ct-questions" element={<CTQuestionBank />} />
      <Route path="/jobs" element={<JobsBoard />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/blood-donation" element={<BloodDonation />} />
      <Route path="/assignment-cover" element={<AssignmentCoverGenerator />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppRoutes />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
