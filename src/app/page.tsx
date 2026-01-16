"use client";

import Footer from "@/app/component/Footer";
import Navbar from "@/app/component/Navbar";
import {
  motion,
  useScroll,
  AnimatePresence,
  useTransform,
  useSpring,
} from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  FaArrowRight,
  FaPlay,
  FaTruck,
  FaBus,
  FaMapMarkerAlt,
  FaRoute,
  FaEye,
  FaCogs,
  FaUsers,
  FaStar,
  FaQuoteLeft,
  FaChartLine,
  FaShieldAlt,
  FaSun,
  FaMoon,
} from "react-icons/fa";

// --- Animated Car Sign Component ---
const AnimatedCarSign = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 600]); // Moves down as you scroll
  const smoothY = useSpring(y, { stiffness: 100, damping: 20 });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed right-8 top-1/4 h-[60vh] w-16 hidden lg:flex flex-col items-center z-40 pointer-events-none">
      {/* Route Line */}
      <div className="absolute inset-y-0 w-1 bg-gradient-to-b from-transparent via-[#3c8dbc] to-transparent opacity-30"></div>

      {/* Animated Waypoints */}
      {[0.2, 0.5, 0.8].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[#3c8dbc]"
          style={{ top: `${pos * 100}%` }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
        />
      ))}

      {/* The Car */}
      <motion.div
        style={{ y: smoothY }}
        className="relative pointer-events-auto cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        onClick={() =>
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          })
        }
      >
        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: -10 }}
              exit={{ opacity: 0, x: 20 }}
              className={`absolute right-full top-1/2 -translate-y-1/2 mr-4 px-4 py-2 rounded-lg backdrop-blur-md border whitespace-nowrap shadow-xl ${
                isDarkMode
                  ? "bg-[#1a1f2e]/90 border-[#3c8dbc]/30 text-white"
                  : "bg-white/90 border-[#3c8dbc]/30 text-slate-800"
              }`}
            >
              <p className="text-xs font-bold text-[#3c8dbc]">
                Live Fleet Tracking
              </p>
              <p className="text-[10px] opacity-80">Click to View Dashboard</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsing Halo */}
        <motion.div
          className="absolute inset-0 rounded-full bg-[#3c8dbc]"
          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Car Icon Container */}
        <div
          className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm border ${
            isDarkMode
              ? "bg-[#0a0e17]/80 border-[#3c8dbc]/50 shadow-[#3c8dbc]/20"
              : "bg-white/80 border-[#3c8dbc]/50 shadow-[#3c8dbc]/20"
          }`}
        >
          <FaTruck className="text-[#3c8dbc] text-lg transform -scale-x-100" />
        </div>

        {/* Engine Idle Animation */}
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#3c8dbc] rounded-full blur-sm"
          animate={{ opacity: [0.4, 0.8, 0.4], width: ["60%", "80%", "60%"] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [chartData, setChartData] = useState([40, 70, 50, 90, 65, 85, 55]);

  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  // Loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    const progressTimer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, []);

  // Real-time chart data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(
        (prevData) => prevData.map(() => Math.floor(Math.random() * 60) + 30) // Random values between 30 and 90
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <>
      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 bg-[#0a0e17] flex items-center justify-center"
          >
            <div className="relative">
              <motion.div
                className="w-32 h-32 border-4 border-transparent border-t-[#3c8dbc] border-r-cyan-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              <motion.div
                className="absolute inset-4 bg-gradient-to-r from-[#3c8dbc] to-cyan-400 rounded-full opacity-20 blur-xl"
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <FaTruck className="w-10 h-10 text-[#3c8dbc]" />
              </div>
            </div>

            <div className="absolute bottom-20 text-center w-full">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-white mb-4 tracking-wider"
              >
                INITIALIZING SYSTEM
              </motion.h2>
              <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#3c8dbc] to-cyan-400"
                  initial={{ width: "0%" }}
                  animate={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-[#3c8dbc] mt-3 font-mono text-sm">
                {Math.round(loadingProgress)}% LOADED
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main
        className={`min-h-screen overflow-hidden font-sans transition-colors duration-500 ${
          isDarkMode ? "bg-[#0a0e17] text-white" : "bg-gray-50 text-slate-900"
        }`}
      >
        <Navbar />

        {/* Theme Toggle & Car Sign */}
        <div className="fixed right-8 top-24 z-50 flex flex-col items-center gap-6">
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-full shadow-lg backdrop-blur-md border transition-all ${
              isDarkMode
                ? "bg-[#1a1f2e]/80 border-white/10 text-yellow-400 hover:bg-[#1a1f2e]"
                : "bg-white/80 border-slate-200 text-slate-700 hover:bg-white"
            }`}
          >
            {isDarkMode ? (
              <FaSun className="w-5 h-5" />
            ) : (
              <FaMoon className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        <AnimatedCarSign isDarkMode={isDarkMode} />

        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div
            className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-500 ${
              isDarkMode ? "bg-[#3c8dbc]/10" : "bg-[#3c8dbc]/5"
            }`}
          />
          <div
            className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-500 ${
              isDarkMode ? "bg-purple-600/10" : "bg-purple-600/5"
            }`}
          />
          <div
            className={`absolute inset-0 bg-[url('/grid.svg')] transition-opacity duration-500 ${
              isDarkMode ? "opacity-[0.03]" : "opacity-[0.02]"
            }`}
          />
        </div>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-left z-10"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`inline-flex items-center gap-2 px-4 py-2 backdrop-blur-md rounded-full border mb-8 transition-colors duration-500 ${
                  isDarkMode
                    ? "bg-[#3c8dbc]/10 border-[#3c8dbc]/20"
                    : "bg-[#3c8dbc]/5 border-[#3c8dbc]/10"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#3c8dbc] animate-pulse" />
                <span className="text-[#3c8dbc] text-sm font-semibold tracking-wide">
                  TMS PLATFORM V2.0
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight uppercase transition-colors duration-500 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                SMART TRANSPORT.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`text-lg mb-10 leading-relaxed max-w-xl transition-colors duration-500 ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Orchestrate your entire fleet with an enterprise-grade TMS.
                AI-driven route optimization, predictive maintenance, and live
                tracking in one futuristic dashboard.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-5"
              >
                <Link href="/tms/admin">
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 0 30px rgba(60, 141, 188, 0.4)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-[#3c8dbc] text-white rounded-xl font-semibold text-lg shadow-lg shadow-[#3c8dbc]/20 transition-all flex items-center justify-center gap-3 group"
                  >
                    Get Started
                    <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>

                <motion.button
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.05)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-8 py-4 backdrop-blur-md border rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-white"
                      : "bg-black/5 border-black/10 text-slate-900"
                  }`}
                >
                  <FaPlay className="w-3 h-3" />
                  Request Demo
                </motion.button>
              </motion.div>
            </motion.div>

            {/* 3D Isometric Illustration Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateX: 20, rotateY: -20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.4, type: "spring" }}
              className="relative h-[600px] w-full perspective-1000"
            >
              {/* Floating Dashboard Panels */}
              <motion.div
                style={{ y: y1 }}
                className={`absolute top-10 right-10 z-20 w-64 backdrop-blur-xl border rounded-2xl p-5 shadow-2xl transition-colors duration-500 ${
                  isDarkMode
                    ? "bg-[#1a1f2e]/90 border-[#3c8dbc]/30 shadow-black/50"
                    : "bg-white/90 border-[#3c8dbc]/20 shadow-slate-200/50"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3
                    className={`text-sm font-bold transition-colors duration-500 ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Fleet Status
                  </h3>
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#3c8dbc]/20 flex items-center justify-center">
                        <FaTruck className="text-[#3c8dbc] text-xs" />
                      </div>
                      <div className="flex-1">
                        <div
                          className={`h-1.5 rounded-full w-full overflow-hidden ${
                            isDarkMode ? "bg-white/10" : "bg-slate-200"
                          }`}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.random() * 60 + 40}%` }}
                            transition={{ duration: 2, delay: i * 0.2 }}
                            className="h-full bg-[#3c8dbc]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                style={{ y: y2 }}
                className={`absolute bottom-20 left-0 z-30 w-56 backdrop-blur-xl border rounded-2xl p-5 shadow-2xl transition-colors duration-500 ${
                  isDarkMode
                    ? "bg-[#1a1f2e]/90 border-purple-500/30 shadow-black/50"
                    : "bg-white/90 border-purple-500/20 shadow-slate-200/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <FaRoute className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Route Optimization</p>
                    <p
                      className={`text-lg font-bold transition-colors duration-500 ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      +24% Efficiency
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Main 3D Map/Grid Representation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Isometric Grid Base */}
                  <div className="absolute inset-x-0 bottom-0 h-[300px] bg-gradient-to-t from-[#3c8dbc]/10 to-transparent transform rotate-x-60 scale-y-50 rounded-full blur-3xl" />

                  {/* Central 3D Element (Abstract City/Map) */}
                  <motion.div
                    animate={{ rotateY: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[#3c8dbc]/30 rounded-full border-dashed"
                  />
                  <motion.div
                    animate={{ rotateY: -360 }}
                    transition={{
                      duration: 30,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-cyan-500/20 rounded-full border-dotted"
                  />

                  {/* Floating Vehicles */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      initial={{ x: 0, y: 0, opacity: 0 }}
                      animate={{
                        x: [
                          Math.random() * 400 - 200,
                          Math.random() * 400 - 200,
                        ],
                        y: [
                          Math.random() * 400 - 200,
                          Math.random() * 400 - 200,
                        ],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 5 + Math.random() * 5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{ top: "50%", left: "50%" }}
                    >
                      <div className="relative">
                        <FaMapMarkerAlt className="text-[#3c8dbc] text-2xl drop-shadow-[0_0_10px_rgba(60,141,188,0.8)]" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-8 h-8 bg-[#3c8dbc]/20 rounded-full blur-md transform scale-y-50" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2
                className={`text-4xl md:text-5xl font-bold mb-6 transition-colors duration-500 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Engineered for{" "}
                <span className="text-[#3c8dbc]">Performance</span>
              </h2>
              <p
                className={`text-lg max-w-2xl mx-auto transition-colors duration-500 ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                A complete suite of tools designed to streamline your logistics
                operations with military-grade precision.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <FaEye />,
                  title: "Live Tracking",
                  desc: "Real-time GPS monitoring with sub-second latency.",
                  color: "from-[#3c8dbc] to-cyan-400",
                },
                {
                  icon: <FaCogs />,
                  title: "Fleet Management",
                  desc: "Automated maintenance scheduling and health checks.",
                  color: "from-purple-500 to-pink-500",
                },
                {
                  icon: <FaRoute />,
                  title: "Route Optimization",
                  desc: "AI algorithms to reduce fuel consumption by up to 30%.",
                  color: "from-orange-400 to-red-500",
                },
                {
                  icon: <FaShieldAlt />,
                  title: "Driver Safety",
                  desc: "Behavior monitoring and instant incident alerts.",
                  color: "from-green-400 to-emerald-500",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group relative"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      isDarkMode ? "" : "hidden"
                    }`}
                  />
                  <div
                    className={`relative h-full p-8 border rounded-3xl transition-all duration-300 overflow-hidden ${
                      isDarkMode
                        ? "bg-[#131824] border-white/5 hover:border-[#3c8dbc]/30"
                        : "bg-white border-slate-200 hover:border-[#3c8dbc]/30 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 blur-2xl rounded-full transform translate-x-10 -translate-y-10`}
                    />

                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white text-2xl mb-6 shadow-lg`}
                    >
                      {feature.icon}
                    </div>

                    <h3
                      className={`text-xl font-bold mb-3 transition-colors duration-500 ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed transition-colors duration-500 ${
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Analytics Preview Section */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#3c8dbc]/5 skew-y-3 transform origin-top-left" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-6">
                <FaChartLine /> ANALYTICS SUITE
              </div>
              <h2
                className={`text-4xl md:text-5xl font-bold mb-6 leading-tight transition-colors duration-500 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Data-Driven Decisions <br />
                <span className="text-[#3c8dbc]">Made Simple.</span>
              </h2>
              <p
                className={`text-lg mb-8 leading-relaxed transition-colors duration-500 ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Visualize your entire operation with customizable 3D dashboards.
                Track KPIs, monitor costs, and forecast trends with our
                proprietary AI engine.
              </p>

              <ul className="space-y-4">
                {[
                  "Predictive Maintenance Alerts",
                  "Real-time Fuel Consumption Analysis",
                  "Driver Performance Scorecards",
                  "Automated Compliance Reporting",
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center gap-3 transition-colors duration-500 ${
                      isDarkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#3c8dbc]/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#3c8dbc]" />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: 10 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Glassmorphism Chart Card */}
              <div
                className={`relative backdrop-blur-xl border rounded-3xl p-8 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 ${
                  isDarkMode
                    ? "bg-[#1a1f2e]/80 border-white/10"
                    : "bg-white/80 border-slate-200"
                }`}
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3
                      className={`text-lg font-bold transition-colors duration-500 ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Efficiency Metrics
                    </h3>
                    <p className="text-xs text-slate-400">Last 30 Days</p>
                  </div>
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-lg">
                    +12.5%
                  </div>
                </div>

                {/* Simulated 3D Chart */}
                <div className="flex items-end justify-between h-48 gap-4">
                  {chartData.map((h, i) => (
                    <div key={i} className="w-full relative group">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="w-full bg-gradient-to-t from-[#3c8dbc] to-cyan-400 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      {/* Reflection effect */}
                      <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-30 transition-opacity" />
                    </div>
                  ))}
                </div>

                {/* Floating Stats */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-6 -right-6 bg-[#3c8dbc] p-4 rounded-2xl shadow-lg shadow-[#3c8dbc]/30"
                >
                  <FaTruck className="text-white text-xl mb-1" />
                  <p className="text-white font-bold text-lg">1,240</p>
                  <p className="text-white/80 text-xs">Active Trips</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2
                className={`text-4xl md:text-5xl font-bold mb-6 transition-colors duration-500 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Trusted by Industry Leaders
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Jenkins",
                  role: "Logistics Director",
                  company: "Global Freight",
                  text: "The 3D tracking interface is a game-changer. We've reduced late deliveries by 45% in just two months.",
                },
                {
                  name: "David Chen",
                  role: "Fleet Manager",
                  company: "EcoTrans",
                  text: "Finally, a TMS that looks and feels modern. The predictive analytics have saved us thousands in fuel costs.",
                },
                {
                  name: "Elena Rodriguez",
                  role: "COO",
                  company: "FastTrack Inc.",
                  text: "Implementation was seamless. The support team is incredible, and the platform uptime is flawless.",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -10 }}
                  className={`border p-8 rounded-3xl relative group transition-all duration-500 ${
                    isDarkMode
                      ? "bg-[#131824] border-white/5 hover:border-[#3c8dbc]/30"
                      : "bg-white border-slate-200 hover:border-[#3c8dbc]/30 shadow-lg"
                  }`}
                >
                  <FaQuoteLeft className="text-[#3c8dbc]/20 text-4xl absolute top-6 right-6" />
                  <div className="flex items-center gap-1 text-yellow-500 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-sm" />
                    ))}
                  </div>
                  <p
                    className={`mb-8 leading-relaxed transition-colors duration-500 ${
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3c8dbc] to-cyan-400 flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <h4
                        className={`font-bold transition-colors duration-500 ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {testimonial.name}
                      </h4>
                      <p className="text-[#3c8dbc] text-sm">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
