import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, BookOpen, Heart, Briefcase, ShoppingBag, Users, Star, ShieldCheck, Search, HandHeart, ListChecks, FileQuestion, Newspaper } from 'lucide-react';
import api, { BASE_URL } from '../services/api';
import { useTheme, useBreakpoint } from '../hooks';

const categories = [
  { id: 'overall', label: 'Overall Impact', icon: Trophy, color: '#F59E0B' },
  { id: 'academic', label: 'Academic', icon: BookOpen, color: '#8B5CF6' },
  { id: 'community', label: 'Community', icon: Heart, color: '#EF4444' },
  { id: 'career', label: 'Career', icon: Briefcase, color: '#3B82F6' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, color: '#F97316' },
  { id: 'club', label: 'Clubs', icon: Users, color: '#10B981' },
];

const ruleMeta = {
  note_upload: { icon: BookOpen, label: 'Upload a useful note' },
  ct_question_post: { icon: FileQuestion, label: 'Post a CT question' },
  job_post: { icon: Briefcase, label: 'Post a job opportunity' },
  blood_request_post: { icon: HandHeart, label: 'Post a blood request' },
  blood_community_post: { icon: Newspaper, label: 'Share a blood post' },
  blood_donation: { icon: HandHeart, label: 'Record a blood donation' },
  lost_item_returned: { icon: Search, label: 'Post a lost/found item' },
};

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [myPoints, setMyPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('overall');
  const { theme } = useTheme();
  const bp = useBreakpoint();
  const isDark = theme === "dark";

  useEffect(() => {
    setLoading(true);
    api.get(`leaderboard/?category=${activeCategory}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [activeCategory]);

  useEffect(() => {
    api.get('leaderboard/my-points/')
      .then(res => setMyPoints(res.data))
      .catch(err => console.error(err));
  }, []);

  const activeColor = categories.find(c => c.id === activeCategory)?.color || '#8B5CF6';

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          background: isDark ? "linear-gradient(135deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.9) 100%)" : "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
          borderRadius: "32px",
          padding: bp.isMobile ? "40px 24px" : "60px 48px",
          color: "white",
          marginBottom: "40px",
          position: "relative",
          overflow: "hidden",
          boxShadow: isDark ? "0 20px 40px rgba(0,0,0,0.4)" : "0 20px 40px rgba(79,70,229,0.25)"
        }}
      >
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "-30px", left: "10%", width: "150px", height: "150px", background: "rgba(255,255,255,0.05)", borderRadius: "50%", filter: "blur(30px)" }} />
        
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: bp.isMobile ? "column" : "row", alignItems: "center", gap: "32px", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.2)", padding: "8px 16px", borderRadius: "100px", fontSize: "14px", fontWeight: "600", marginBottom: "20px", backdropFilter: "blur(10px)" }}>
              <Star size={16} fill="currentColor" /> Campus Impact Ranking
            </div>
            <h1 style={{ fontSize: bp.isMobile ? "32px" : "48px", fontWeight: "800", margin: "0 0 16px", letterSpacing: "-1px", lineHeight: "1.2" }}>
              Campus Hero
            </h1>
            <p style={{ fontSize: "16px", opacity: 0.9, maxWidth: "500px", lineHeight: "1.6", margin: 0 }}>
              Recognizing the students who make the biggest positive impact on our campus community. Share resources and help others to climb the ranks!
            </p>
          </div>
          
          {!bp.isMobile && myPoints && (
            <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)", padding: "24px", borderRadius: "24px", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.2)", width: "360px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <Trophy size={32} color="#FBBF24" />
                <div>
                  <div style={{ fontSize: "20px", fontWeight: "800" }}>My Points</div>
                  <div style={{ fontSize: "13px", opacity: 0.8 }}>Total earned: {myPoints.profile.total_points} pts</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px", fontSize: "13px" }}>
                {categories.filter(c => c.id !== 'overall').map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: "7px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "10px", padding: "8px" }}>
                      <Icon size={15} color={cat.color} />
                      <span style={{ flex: 1 }}>{cat.label}</span>
                      <strong>{myPoints.profile[`${cat.id}_points`]}</strong>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 800, marginBottom: "10px" }}>
                <ListChecks size={16} /> How points are earned
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px", fontSize: "13px" }}>
                {myPoints.rules.map((rule) => {
                  const meta = ruleMeta[rule.key] || { icon: Star, label: rule.action_name };
                  const Icon = meta.icon;
                  return (
                    <div key={rule.key} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <Icon size={15} color="#FDE68A" />
                      <span style={{ flex: 1 }}>{meta.label}</span>
                      <strong>+{rule.points} pts</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {false && !bp.isMobile && (
            <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)", padding: "24px", borderRadius: "24px", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.2)", width: "320px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <Trophy size={32} color="#FBBF24" />
                <div style={{ fontSize: "20px", fontWeight: "800" }}>How to Earn Points</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>📚 Upload a useful note:</span> <strong>+10 pts</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>❤️ Donating blood:</span> <strong>+50 pts</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>🔍 Returning a lost item:</span> <strong>+20 pts</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>🤝 Resolving an emergency:</span> <strong>+30 pts</strong></div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {bp.isMobile && myPoints && (
        <div style={{ background: isDark ? "rgba(30,41,59,0.5)" : "white", borderRadius: "20px", padding: "20px", marginBottom: "28px", boxShadow: isDark ? "none" : "0 10px 32px rgba(0,0,0,0.04)" }}>
          <h2 style={{ margin: "0 0 12px", color: isDark ? "#F8FAFC" : "#0F172A" }}>My Points: {myPoints.profile.total_points}</h2>
          <div style={{ display: "grid", gap: "10px" }}>
            {myPoints.rules.map((rule) => {
              const meta = ruleMeta[rule.key] || { icon: Star, label: rule.action_name };
              const Icon = meta.icon;
              return (
                <div key={rule.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", color: isDark ? "#CBD5E1" : "#475569" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><Icon size={15} /> {meta.label}</span>
                  <strong>+{rule.points}</strong>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories */}
      <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "16px", marginBottom: "32px", scrollbarWidth: "none" }}>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 24px",
                borderRadius: "16px",
                border: "none",
                background: isActive ? cat.color : (isDark ? "rgba(30,41,59,0.5)" : "white"),
                color: isActive ? "white" : (isDark ? "#94A3B8" : "#64748B"),
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: isActive ? `0 10px 20px ${cat.color}40` : (isDark ? "none" : "0 4px 12px rgba(0,0,0,0.03)"),
                transition: "all 0.2s ease"
              }}
            >
              <Icon size={18} /> {cat.label}
            </motion.button>
          )
        })}
      </div>

      {myPoints && (
        <div style={{ background: isDark ? "rgba(30,41,59,0.5)" : "white", borderRadius: "24px", padding: bp.isMobile ? "18px" : "24px", marginBottom: "28px", boxShadow: isDark ? "none" : "0 10px 40px rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#EEF2F7"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: isDark ? "#F8FAFC" : "#0F172A", margin: 0 }}>My Recent Point Activity</h2>
            <span style={{ color: activeColor, fontWeight: 800 }}>{myPoints.profile.total_points} pts</span>
          </div>
          {myPoints.recent_logs.length === 0 ? (
            <div style={{ color: isDark ? "#94A3B8" : "#64748B", fontWeight: 600 }}>No points yet. Upload a note or record a donation to start earning.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: bp.isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
              {myPoints.recent_logs.slice(0, 6).map((log) => (
                <div key={log.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "14px", background: isDark ? "rgba(15,23,42,0.35)" : "#F8FAFC", border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0"}` }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "12px", display: "grid", placeItems: "center", background: `${activeColor}18`, color: activeColor, fontWeight: 900 }}>+{log.points}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{log.action_name}</div>
                    <div style={{ color: isDark ? "#94A3B8" : "#64748B", fontSize: "12px", textTransform: "capitalize" }}>{log.category}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leaderboard List */}
      <div style={{ background: isDark ? "rgba(30,41,59,0.5)" : "white", borderRadius: "28px", padding: bp.isMobile ? "20px" : "40px", boxShadow: isDark ? "none" : "0 10px 40px rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "transparent"}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: isDark ? "#F8FAFC" : "#0F172A", margin: 0 }}>
            {categories.find(c => c.id === activeCategory)?.label} Ranking
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: isDark ? "#94A3B8" : "#64748B", fontWeight: "600" }}>Loading Rankings...</div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: isDark ? "#94A3B8" : "#64748B", fontWeight: "600" }}>No data found for this category yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {data.map((profile, index) => {
              const isTop3 = index < 3;
              const pts = activeCategory === 'overall' ? profile.total_points 
                          : profile[`${activeCategory}_points`];
              
              if (pts === 0 && index > 2) return null; // Don't show 0 pointers unless top 3

              return (
                <motion.div 
                  key={profile.user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: bp.isMobile ? "12px" : "24px",
                    padding: bp.isMobile ? "16px" : "20px 24px",
                    background: isTop3 
                      ? (isDark ? `linear-gradient(90deg, ${activeColor}20 0%, rgba(30,41,59,0) 100%)` : `linear-gradient(90deg, ${activeColor}10 0%, white 100%)`)
                      : (isDark ? "rgba(15,23,42,0.3)" : "#F8FAFC"),
                    borderRadius: "20px",
                    border: isTop3 ? `1px solid ${activeColor}40` : `1px solid ${isDark ? "transparent" : "#E2E8F0"}`,
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {isTop3 && (
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: activeColor }} />
                  )}

                  <div style={{ width: "40px", textAlign: "center", fontSize: "24px", fontWeight: "800", color: isTop3 ? activeColor : (isDark ? "#64748B" : "#94A3B8") }}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                  </div>

                  {profile.user.profile_picture ? (
                    <img src={`${BASE_URL}${profile.user.profile_picture}`} alt="" style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${isTop3 ? activeColor : 'transparent'}` }} />
                  ) : (
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `linear-gradient(135deg, ${activeColor}, ${activeColor}dd)`, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "20px", border: `2px solid ${isTop3 ? activeColor : 'transparent'}` }}>
                      {profile.user.first_name?.[0] || profile.user.username[0].toUpperCase()}
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: isDark ? "#F8FAFC" : "#0F172A", display: "flex", alignItems: "center", gap: "8px" }}>
                      {profile.user.first_name || profile.user.username}
                      {index === 0 && <ShieldCheck size={18} color="#10B981" />}
                    </div>
                    <div style={{ fontSize: "14px", color: isDark ? "#94A3B8" : "#64748B", fontWeight: "500", marginTop: "4px" }}>
                      @{profile.user.username}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "24px", fontWeight: "800", color: activeColor }}>
                      {pts}
                    </div>
                    <div style={{ fontSize: "12px", color: isDark ? "#94A3B8" : "#94A3B8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Points
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
