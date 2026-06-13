import { motion } from "framer-motion";
import { useLanguage, useTheme } from "../hooks";

export default function Stats() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const stats = [
    { number: "10,000+", label: t("stats.studentsConnected"), icon: "CC" },
    { number: "5,000+", label: t("stats.studyResources"), icon: "SR" },
    { number: "500+", label: t("stats.booksShared"), icon: "BK" },
    { number: "100+", label: t("stats.bloodDonors"), icon: "BD" },
  ];

  return (
    <section className={`relative py-24 ${isDark ? "bg-slate-950" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className={`inline-flex px-4 py-2 rounded-full font-medium ${isDark ? "bg-amber-500/10 text-amber-300" : "bg-blue-50 text-blue-600"}`}>
            {t("stats.badge")}
          </span>

          <h2 className={`mt-6 text-4xl md:text-5xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            {t("stats.title")}
          </h2>

          <p className={`mt-4 text-lg ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {t("stats.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className={`rounded-3xl border p-8 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
              }`}
            >
              <div className={`text-sm font-black tracking-wider ${isDark ? "text-amber-300" : "text-blue-600"}`}>{item.icon}</div>
              <h3 className={`mt-5 text-4xl font-bold bg-gradient-to-r ${isDark ? "from-amber-300 to-yellow-500" : "from-blue-600 to-purple-600"} bg-clip-text text-transparent`}>
                {item.number}
              </h3>
              <p className={`mt-3 font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
