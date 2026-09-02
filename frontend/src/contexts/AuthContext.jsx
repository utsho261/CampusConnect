import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearAllCache } from '../services/apiCache';
import { BASE_URL } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchProfile = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/api/profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = (userData, tokens) => {
    localStorage.setItem("access", tokens.access);
    localStorage.setItem("refresh", tokens.refresh);
    localStorage.setItem("username", userData.username);
    localStorage.setItem("student_id", userData.student_id);
    localStorage.setItem("role", userData.role || "student");
    setUser(userData);
  };

  const logout = () => {
    clearAllCache(); // Clear all cached API data
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("student_id");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/login");
  };

  const updateUser = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
