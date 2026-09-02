import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, BookOpen, Heart, Briefcase, ChevronRight, User, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { cachedGet } from '../services/apiCache';
import { useTheme } from '../hooks';
import { BASE_URL } from "../services/api";

export default function LeaderboardWidget() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    cachedGet(api, 'leaderboard/dashboard/', {
      cacheKey: 'leaderboard_dashboard',
      ttl: 5 * 60 * 1000, // 5 min
      onCacheHit: (d) => setData(d),
    })
      .then((freshData) => { if (freshData) setData(freshData); })
      .catch(err => console.error(err));
  }, []);

  if (!data) {
    return (
      <div style={{ padding: "32px", borderRadius: "28px", background: isDark ? "rgba(30,41,59,0.7)" : "white", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: isDark ? "#94A3B8" : "#64748B", fontWeight: "600" }}>Loading Leaderboard...</div>
      </div>
    );
  }

  const { top_overall, top_academic, top_community, top_career } = data;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: isDark ? "linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.8) 100%)" : "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)",
        backdropFilter: "blur(24px)",
        borderRadius: "28px",
        padding: "32px",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.8)"}`,
        boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.3)" : "0 12px 40px rgba(15,23,42,0.04)",
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "800", color: isDark ? "#F8FAFC" : "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "10px", letterSpacing: "-0.5px" }}>
          <Trophy size={22} color="#F59E0B" strokeWidth={2.5} /> Campus Hero
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
        {top_overall.map((profile, idx) => (
          <div key={profile.user.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px", borderRadius: "16px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
            <div style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
            </div>
            
            {profile.user.profile_picture ? (
               <img src={`${BASE_URL}${profile.user.profile_picture}`} alt="" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
               <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #4F46E5)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                 {profile.user.first_name?.[0] || profile.user.username[0].toUpperCase()}
               </div>
            )}
            
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: "700", color: isDark ? "#E2E8F0" : "#1E293B" }}>
                {profile.user.first_name || profile.user.username}
              </div>
              <div style={{ fontSize: "13px", color: isDark ? "#94A3B8" : "#64748B", fontWeight: "600" }}>
                {profile.total_points} pts
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", margin: "0 0 24px" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
        {top_academic && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(139,92,246,0.15)", color: "#8B5CF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={18} />
            </div>
            <div>
              <div style={{ fontSize: "13px", color: isDark ? "#94A3B8" : "#64748B", fontWeight: "600" }}>Top Note Contributor</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: isDark ? "#E2E8F0" : "#1E293B" }}>{top_academic.user.first_name || top_academic.user.username}</div>
            </div>
          </div>
        )}
        
        {top_community && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(239,68,68,0.15)", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart size={18} />
            </div>
            <div>
              <div style={{ fontSize: "13px", color: isDark ? "#94A3B8" : "#64748B", fontWeight: "600" }}>Top Blood Donor</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: isDark ? "#E2E8F0" : "#1E293B" }}>{top_community.user.first_name || top_community.user.username}</div>
            </div>
          </div>
        )}

        {top_career && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(236,72,153,0.15)", color: "#EC4899", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <HeartPulse size={18} />
            </div>
            <div>
              <div style={{ fontSize: "13px", color: isDark ? "#94A3B8" : "#64748B", fontWeight: "600" }}>Support & Wellbeing Hero</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: isDark ? "#E2E8F0" : "#1E293B" }}>{top_career.user.first_name || top_career.user.username}</div>
            </div>
          </div>
        )}
      </div>

      <motion.button 
        whileHover={{ x: 5 }}
        onClick={() => navigate('/leaderboard')}
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          borderRadius: "16px",
          background: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9",
          border: "none",
          color: isDark ? "#E2E8F0" : "#334155",
          fontSize: "14px",
          fontWeight: "700",
          cursor: "pointer",
          transition: "background 0.2s ease"
        }}
      >
        View Full Leaderboard <ChevronRight size={18} />
      </motion.button>
    </motion.div>
  );
}
