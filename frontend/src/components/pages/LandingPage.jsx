import { useState, useEffect, useRef } from "react";
import ThemeLanguageSwitcher from "../ThemeLanguageSwitcher";
import { useLanguage, useTheme } from "../../hooks";

function SvgIcon({ paths, size = 24, className = "", fill = "none", strokeWidth = 2 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

const GraduationCapIcon = (p) => <SvgIcon {...p} paths={["M22 10v6M2 10l10-5 10 5-10 5z", "M6 12v5c3 3 9 3 12 0v-5"]} />;
const ArrowRightIcon = (p) => <SvgIcon {...p} paths={["M5 12h14", "M12 5l7 7-7 7"]} />;
const LabIcon = (p) => <SvgIcon {...p} paths={["M9 3h6l1 9H8L9 3z", "M8 12l-2 6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l-2-6", "M9 3V2", "M15 3V2", "M12 12v4"]} />;
const AssignIcon = (p) => <SvgIcon {...p} paths={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M9 13h6", "M9 17h4"]} />;
const CTBankIcon = (p) => <SvgIcon {...p} paths={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", "M12 17h.01"]} />;
const NotesIcon = (p) => <SvgIcon {...p} paths={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"]} />;
const JobIcon = (p) => <SvgIcon {...p} paths={["M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z", "M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2", "M12 12v.01"]} />;
const LostIcon = (p) => <SvgIcon {...p} paths={["M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z", "M16 16l3.5 3.5"]} />;
const PhoneIcon = (p) => <SvgIcon {...p} paths={["M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5a2 2 0 0 1 1.72-2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.4a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"]} />;
const EventIcon = (p) => <SvgIcon {...p} paths={["M3 4h18v18H3z", "M16 2v4", "M8 2v4", "M3 10h18"]} />;
const BloodIcon = (p) => <SvgIcon {...p} paths={["M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"]} />;
const BookSellIcon = (p) => <SvgIcon {...p} paths={["M4 19.5A2.5 2.5 0 0 1 6.5 17H20", "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z", "M12 6v6", "M9 9h6"]} />;
const ShieldIcon = (p) => <SvgIcon {...p} paths={["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "M9 12l2 2 4-4"]} />;
const ResourceIcon = (p) => <SvgIcon {...p} paths={["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"]} />;

function StarIcon({ size = 16 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth={1.5}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.1 });

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const featureDefs = [
  { Icon: LabIcon, titleKey: "features.labCover", descKey: "features.labCoverDesc", grad: "from-blue-500 to-blue-700", shadow: "shadow-blue-200" },
  { Icon: AssignIcon, titleKey: "features.assignmentCover", descKey: "features.assignmentCoverDesc", grad: "from-violet-500 to-violet-700", shadow: "shadow-violet-200" },
  { Icon: CTBankIcon, titleKey: "features.ctQuestions", descKey: "features.ctQuestionsDesc", grad: "from-purple-500 to-purple-700", shadow: "shadow-purple-200" },
  { Icon: NotesIcon, titleKey: "features.seniorNotes", descKey: "features.seniorNotesDesc", grad: "from-indigo-500 to-indigo-700", shadow: "shadow-indigo-200" },
  { Icon: JobIcon, titleKey: "features.jobs", descKey: "features.jobsDesc", grad: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-200" },
  { Icon: LostIcon, titleKey: "features.lostFound", descKey: "features.lostFoundDesc", grad: "from-amber-500 to-orange-500", shadow: "shadow-amber-200" },
  { Icon: PhoneIcon, titleKey: "features.emergency", descKey: "features.emergencyDesc", grad: "from-red-500 to-rose-600", shadow: "shadow-red-200" },
  { Icon: EventIcon, titleKey: "features.clubEventHub", descKey: "features.clubsEventsDesc", grad: "from-pink-500 to-fuchsia-600", shadow: "shadow-pink-200" },
  { Icon: BloodIcon, titleKey: "features.bloodDonation", descKey: "features.bloodDonationDesc", grad: "from-rose-500 to-red-700", shadow: "shadow-rose-200" },
  { Icon: BookSellIcon, titleKey: "features.bookMarketplace", descKey: "features.bookMarketplaceDesc", grad: "from-teal-500 to-cyan-600", shadow: "shadow-teal-200" },
  { Icon: ShieldIcon, titleKey: "features.studentVerification", descKey: "features.studentVerificationDesc", grad: "from-green-500 to-green-700", shadow: "shadow-green-200" },
  { Icon: ResourceIcon, titleKey: "features.resourceHub", descKey: "features.resourceHubDesc", grad: "from-sky-500 to-blue-600", shadow: "shadow-sky-200" },
];

const statDefs = [
  { value: "BUBT", labelKey: "landing.stats.exclusivePlatform" },
  { value: "11+", labelKey: "landing.stats.coreFeatures" },
  { value: "100%", labelKey: "landing.stats.studentVerified" },
  { value: "1 Place", labelKey: "landing.stats.everythingYouNeed" },
];

const testimonials = [
  { name: "Utsho Roy", role: "CSE Student, BUBT", textKey: "landing.testimonials.utsho" },
  { name: "Afrin Akter Achol", role: "CSE Student, BUBT", textKey: "landing.testimonials.afrin" },
  { name: "Md. Shamim Pramanik", role: "CSE Student, BUBT", textKey: "landing.testimonials.shamim" },
];

const teamMembers = [
  { name: "Utsho Roy", initial: "U", grad: "from-blue-500 to-blue-700" },
  { name: "Md. Shamim Pramanik", initial: "S", grad: "from-purple-500 to-purple-700" },
  { name: "Mohammad Mostafizur Rahman", initial: "M", grad: "from-pink-500 to-rose-600" },
  { name: "Afrin Akter Achol", initial: "A", grad: "from-teal-500 to-green-600" },
  { name: "Md. Arifur Rahaman", initial: "R", grad: "from-orange-500 to-amber-600" },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const heroTitle = t("landing.heroTitle").split("\n");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const pageClass = isDark
    ? "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100"
    : "min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 text-base";
  const navClass = scrolled
    ? isDark
      ? "bg-slate-950/85 backdrop-blur-lg shadow-md border-b border-slate-800"
      : "bg-white/80 backdrop-blur-lg shadow-md"
    : "bg-transparent";
  const cardClass = isDark
    ? "bg-slate-900/75 backdrop-blur-lg border border-slate-800"
    : "bg-white/70 backdrop-blur-lg border border-white/30";
  const titleText = isDark ? "text-slate-100" : "text-gray-800";
  const mutedText = isDark ? "text-slate-400" : "text-gray-500";

  return (
    <div className={pageClass}>
      <style>{`
        @keyframes blobA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(100px,50px)} }
        @keyframes blobB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-100px,-50px)} }
        @keyframes heroFadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:.35} 50%{transform:scale(1.18);opacity:.12} }
      `}</style>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-20 left-20 w-[500px] h-[500px] rounded-full blur-3xl ${isDark ? "bg-amber-400/10" : "bg-blue-400/20"}`} style={{ animation: "blobA 20s ease-in-out infinite" }} />
        <div className={`absolute bottom-20 right-20 w-[500px] h-[500px] rounded-full blur-3xl ${isDark ? "bg-blue-500/10" : "bg-purple-400/20"}`} style={{ animation: "blobB 15s ease-in-out infinite" }} />
      </div>

      <nav className={`sticky top-0 z-50 transition-all duration-300 ${navClass}`}>
        <div className="w-full max-w-screen-2xl mx-auto px-10 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <GraduationCapIcon size={36} className={isDark ? "text-amber-400" : "text-blue-600"} />
            <span className={`text-3xl font-extrabold bg-gradient-to-r ${isDark ? "from-amber-300 to-yellow-500" : "from-blue-600 to-purple-600"} bg-clip-text text-transparent`}>
              CampusConnect
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <ThemeLanguageSwitcher />
            <a href="/login" className={`px-6 py-2.5 rounded-lg transition font-medium text-base ${isDark ? "text-slate-200 hover:bg-white/10" : "text-gray-700 hover:bg-white/60"}`}>
              {t("landing.nav.login")}
            </a>
            <a href="/register" className={`px-6 py-2.5 rounded-lg bg-gradient-to-r ${isDark ? "from-amber-400 to-yellow-600 text-slate-950 hover:from-amber-300 hover:to-yellow-500" : "from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"} font-semibold text-base shadow transition`}>
              {t("landing.nav.getStarted")}
            </a>
          </div>
        </div>
      </nav>

      <section className="relative z-10 w-full max-w-screen-2xl mx-auto px-10 py-32 text-center">
        <div style={{ animation: "heroFadeUp 0.7s ease 0.2s both" }}>
          <div className={`inline-block text-sm font-semibold px-5 py-1.5 rounded-full mb-7 ${isDark ? "bg-amber-500/10 text-amber-300" : "bg-blue-100 text-blue-700"}`}>
            {t("landing.heroBadge")}
          </div>
          <h1 className={`text-6xl md:text-7xl font-extrabold mb-7 bg-gradient-to-r ${isDark ? "from-amber-300 via-yellow-500 to-amber-200" : "from-blue-600 via-purple-600 to-blue-600"} bg-clip-text text-transparent leading-tight`}>
            {heroTitle[0]}
            <br />
            {heroTitle[1]}
          </h1>
          <p className={`text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${isDark ? "text-slate-300" : "text-gray-600"}`}>
            {t("landing.heroSubtitle")}
          </p>
          <div className="flex gap-5 justify-center flex-wrap">
            <a href="/register" className={`inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-gradient-to-r ${isDark ? "from-amber-400 to-yellow-600 text-slate-950 hover:from-amber-300 hover:to-yellow-500" : "from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"} font-bold text-lg shadow-xl transition`}>
              {t("landing.nav.getStarted")} <ArrowRightIcon size={22} />
            </a>
            <a href="#features" className={`inline-flex items-center px-9 py-4 rounded-xl border-2 font-bold text-lg transition ${isDark ? "border-slate-700 text-slate-200 hover:bg-white/10" : "border-gray-300 text-gray-700 hover:bg-white/60"}`}>
              {t("landing.learnMore")}
            </a>
          </div>
        </div>
      </section>

      <section className="relative z-10 w-full max-w-screen-2xl mx-auto px-10 pb-20">
        <FadeIn className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statDefs.map((stat) => (
            <div key={stat.labelKey} className={`${cardClass} rounded-2xl p-8 text-center shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}>
              <div className={`text-4xl font-extrabold mb-2 ${isDark ? "text-amber-300" : "text-blue-600"}`}>{stat.value}</div>
              <div className={`${mutedText} text-base font-medium`}>{t(stat.labelKey)}</div>
            </div>
          ))}
        </FadeIn>
      </section>

      <section id="features" className="relative z-10 w-full max-w-screen-2xl mx-auto px-10 py-24">
        <FadeIn className="text-center mb-16">
          <h2 className={`text-5xl font-extrabold mb-4 ${titleText}`}>{t("landing.featuresTitle")}</h2>
          <p className={`${mutedText} text-xl`}>{t("landing.featuresSubtitle")}</p>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {featureDefs.map((f, i) => (
            <FadeIn key={f.titleKey} delay={i * 0.06}>
              <div className={`group ${cardClass} rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full`}>
                <div className={`w-16 h-16 bg-gradient-to-br ${f.grad} rounded-2xl flex items-center justify-center mb-5 shadow-lg ${f.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <f.Icon size={28} className="text-white" />
                </div>
                <h3 className={`font-bold text-xl mb-2 ${titleText}`}>{t(f.titleKey)}</h3>
                <p className={`${mutedText} text-base leading-relaxed`}>{t(f.descKey)}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="relative z-10 w-full max-w-screen-2xl mx-auto px-10 py-24">
        <FadeIn className="text-center mb-16">
          <h2 className={`text-5xl font-extrabold mb-4 ${titleText}`}>{t("landing.testimonialsTitle")}</h2>
          <p className={`${mutedText} text-xl`}>{t("landing.testimonialsSubtitle")}</p>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {testimonials.map((item, i) => (
            <FadeIn key={item.name} delay={i * 0.15}>
              <div className={`${cardClass} rounded-2xl p-8 hover:shadow-xl transition-all duration-300 h-full flex flex-col`}>
                <div className="flex gap-1 mb-5">{[...Array(5)].map((_, j) => <StarIcon key={j} size={20} />)}</div>
                <p className={`${isDark ? "text-slate-300" : "text-gray-600"} italic flex-1 mb-6 text-lg leading-relaxed`}>"{t(item.textKey)}"</p>
                <div>
                  <div className={`font-bold text-lg ${titleText}`}>{item.name}</div>
                  <div className={`text-base ${isDark ? "text-slate-500" : "text-gray-400"}`}>{item.role}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="relative z-10 w-full max-w-screen-2xl mx-auto px-10 py-24">
        <FadeIn className="text-center mb-16">
          <h2 className={`text-5xl font-extrabold mb-4 ${titleText}`}>{t("landing.teamTitle")}</h2>
          <p className={`${mutedText} text-xl`}>{t("landing.teamSubtitle")}</p>
        </FadeIn>
        <FadeIn className="flex flex-wrap justify-center gap-10">
          {teamMembers.map((m, i) => (
            <div key={m.name} className="group relative flex flex-col items-center w-48">
              <div className={`absolute top-0 w-24 h-24 rounded-full bg-gradient-to-br ${m.grad} opacity-30`}
                style={{ animation: `pulse-ring ${2.5 + i * 0.4}s ease-in-out infinite` }} />
              <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${m.grad} flex items-center justify-center text-white text-4xl font-extrabold shadow-xl group-hover:scale-110 transition-transform duration-300 mb-5`}>
                {m.initial}
              </div>
              <div className={`font-bold text-base text-center leading-snug ${titleText}`}>{m.name}</div>
              <div className={`text-sm mt-1 ${isDark ? "text-amber-300" : "text-blue-500"}`}>BUBT - CSE</div>
            </div>
          ))}
        </FadeIn>
      </section>

      <section className="relative z-10 w-full max-w-screen-2xl mx-auto px-10 py-20">
        <FadeIn>
          <div className={`bg-gradient-to-r ${isDark ? "from-slate-900 to-slate-800 border border-amber-500/20" : "from-blue-600 to-purple-600"} rounded-3xl p-16 text-center text-white shadow-2xl`}>
            <h2 className="text-5xl font-extrabold mb-5">{t("landing.ctaTitle")}</h2>
            <p className="text-xl mb-10 opacity-90">{t("landing.ctaSubtitle")}</p>
            <a href="/register" className={`inline-flex items-center gap-2 px-10 py-4 font-bold text-lg rounded-xl transition shadow-lg ${isDark ? "bg-amber-400 text-slate-950 hover:bg-amber-300" : "bg-white text-blue-600 hover:bg-gray-100"}`}>
              {t("landing.ctaButton")} <ArrowRightIcon size={22} className={isDark ? "text-slate-950" : "text-blue-600"} />
            </a>
          </div>
        </FadeIn>
      </section>

      <footer className={`relative z-10 w-full max-w-screen-2xl mx-auto px-10 py-14 border-t ${isDark ? "border-slate-800" : "border-gray-200"}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCapIcon size={26} className={isDark ? "text-amber-400" : "text-blue-600"} />
              <span className={`font-bold text-lg ${titleText}`}>CampusConnect</span>
            </div>
            <p className={`${mutedText} text-base`}>{t("landing.footerDescription")}</p>
          </div>
          <div>
            <h4 className={`font-semibold mb-4 text-base ${isDark ? "text-slate-300" : "text-gray-700"}`}>{t("landing.footerAcademic")}</h4>
            <ul className={`space-y-2 text-base ${mutedText}`}>
              {[t("features.labCover"), t("features.assignmentCover"), t("features.ctQuestions"), t("features.seniorNotes")].map((x) => <li key={x}>{x}</li>)}
            </ul>
          </div>
          <div>
            <h4 className={`font-semibold mb-4 text-base ${isDark ? "text-slate-300" : "text-gray-700"}`}>{t("landing.footerCommunity")}</h4>
            <ul className={`space-y-2 text-base ${mutedText}`}>
              {[t("features.lostFound"), t("features.bloodDonation"), t("features.clubsEvents"), t("features.emergency")].map((x) => <li key={x}>{x}</li>)}
            </ul>
          </div>
          <div>
            <h4 className={`font-semibold mb-4 text-base ${isDark ? "text-slate-300" : "text-gray-700"}`}>{t("landing.footerMore")}</h4>
            <ul className={`space-y-2 text-base ${mutedText}`}>
              {[t("features.jobs"), t("features.bookMarketplace"), t("features.studentVerification")].map((x) => <li key={x}>{x}</li>)}
            </ul>
          </div>
        </div>
        <div className={`pt-6 border-t text-center text-base ${isDark ? "border-slate-800 text-slate-500" : "border-gray-200 text-gray-400"}`}>
          {t("landing.copyright")}
        </div>
      </footer>
    </div>
  );
}
