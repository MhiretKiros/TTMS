"use client";
import Footer from "@/app/component/Footer";
import Navbar from "@/app/component/Navbar";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);


  // Array of images with associated content
const slides = [
  {
    image: "/images/insa1.png",
    title: "Wellcome to INSA Transport Management System",
    description: "Optimizing Ethiopia's logistics network with intelligent fleet solutions.",
  },
  {
    image: "/images/insa10.jpeg",
    title: "Real-Time Fleet Monitoring",
    description: "Track every vehicle with our advanced GPS tracking and analytics platform.",
  },
  {
    image: "/images/insa13.jpeg",
    title: "Smart Route Optimization",
    description: "AI-powered routing to reduce fuel costs and improve delivery efficiency across Ethiopia.",
  },
  {
    image: "/images/insa14.png",
    title: "Compliance & Safety",
    description: "Ensure regulatory compliance and enhance driver safety with our monitoring systems.",
  },
  {
    image: "/images/insa9.jpeg",
    title: "Data-Driven Decisions",
    description: "Transform raw data into actionable insights for your transport operations.",
  },
  {
    image: "/images/insa17.jpeg",
    title: "Integrated Logistics Platform",
    description: "Seamlessly connect all aspects of your supply chain management.",
  },
  {
    image: "/images/insa11.png",
    title: "Custom Enterprise Solutions",
    description: "Tailored TMS implementations for Ethiopia's largest fleets and logistics providers.",
  },
  {
    image: "/images/insa21.png",
    title: "24/7 Operational Support",
    description: "Dedicated technical team ensuring your transport network runs smoothly.",
  }
];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("right");
  const [showSlideshow, setShowSlideshow] = useState(false); // Start with animated hero mode

  // Function to go to the next slide
  const nextSlide = useCallback(() => {
    setSlideDirection("right");
    setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  // Function to go to the previous slide
  const prevSlide = useCallback(() => {
    setSlideDirection("left");
    setCurrentSlideIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Toggle between slideshow and animated hero section
  useEffect(() => {
    // Start with animated hero for 15 seconds, then switch to slideshow for 15 seconds
    const interval = setInterval(() => {
      setShowSlideshow(prev => !prev);
    }, 15000); // Switch every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Automatic slideshow when in slideshow mode
  useEffect(() => {
    if (!showSlideshow) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [showSlideshow, nextSlide]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section - Two Modes */}
      <section className="relative h-screen overflow-hidden">
        {/* Slideshow Mode */}
        <AnimatePresence>
          {showSlideshow && (
            <motion.div
              key="slideshow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 h-full flex items-center"
            >
              {/* Background Image */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ x: slideDirection === "right" ? "100%" : "-100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: slideDirection === "right" ? "-100%" : "100%", opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={slides[currentSlideIndex].image}
                    alt="Background"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/30"></div>
                </motion.div>
              </AnimatePresence>

              {/* Hero Content - Centered */}
              <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlideIndex}
                    initial={{ x: slideDirection === "right" ? 100 : -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: slideDirection === "right" ? -100 : 100, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                      {slides[currentSlideIndex].title}
                    </h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-white drop-shadow-lg">
                      {slides[currentSlideIndex].description}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all"
                      >
                        Start Free Trial
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-white/90 border-2 border-white text-blue-600 font-bold rounded-lg shadow-lg hover:bg-white transition-colors"
                      >
                        Watch Video
                      </motion.button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Arrows */}
              <div
                className="absolute top-1/2 left-5 z-20 cursor-pointer transform -translate-y-1/2"
                onClick={prevSlide}
              >
                <FaArrowLeft size={30} color="white" className="drop-shadow-lg" />
              </div>
              <div
                className="absolute top-1/2 right-5 z-20 cursor-pointer transform -translate-y-1/2"
                onClick={nextSlide}
              >
                <FaArrowRight size={30} color="white" className="drop-shadow-lg" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Hero Mode - Shown first */}
        <AnimatePresence>
          {!showSlideshow && (
            <motion.div
              key="animated-hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 h-full flex items-center"
              style={{ y: yPos, scale }}
            >
              <div className="absolute inset-0 z-0">
                {/* <Image 
                  src="/images/hero/road-background.jpg" 
                  alt="Road background"
                  layout="fill"
                  objectFit="cover"
                  className="opacity-30"
                /> */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50"></div>
              </div>
              
              {/* Animated moving cars */}
              <motion.div 
                className="absolute bottom-20 left-0 z-10"
                animate={{ x: ['-100%', '120vw'] }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Image 
                  src="/images/car2.jpeg" 
                  alt="Moving car"
                  width={200}
                  height={100}
                  className="filter drop-shadow-lg"
                />
              </motion.div>
              
              <motion.div 
                className="absolute bottom-40 left-0 z-10"
                animate={{ x: ['-150%', '110vw'] }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 2
                }}
              >
                <Image 
                  src="/images/car1.jpeg" 
                  alt="Moving truck"
                  width={250}
                  height={120}
                  className="filter drop-shadow-lg"
                />
              </motion.div>

              {/* Centered Content */}
              <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      Next-Generation
                    </span> Transport Management
                  </h1>
                  <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-gray-700">
                    Revolutionize your logistics with AI-powered optimization and real-time tracking
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all"
                    >
                      Start Free Trial
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-lg shadow-lg hover:bg-blue-50 transition-colors"
                    >
                      Watch Video
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Rest of the page content remains the same */}
      {/* Asymmetric Feature Grid */}
      <section className="relative py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Transform Your Fleet Operations
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Our platform delivers measurable results across all aspects of fleet management
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            {/* Large feature card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-8 bg-gray-900 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="relative h-64 md:h-80">
                <Image 
                  src="/images/car1.jpeg" 
                  alt="Real-time tracking"
                  layout="fill"
                  objectFit="cover"
                  className="opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-2">Real-Time Fleet Tracking</h3>
                  <p className="text-gray-300">Monitor every vehicle with live GPS updates and predictive analytics</p>
                  <Link href="/tms-modules/tracking" className="mt-4 inline-flex items-center text-blue-400 hover:text-blue-300">
                    Learn more
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Small feature card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="lg:col-span-4 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Route Optimization</h3>
                <p className="text-gray-600 mb-4">Reduce mileage by up to 20% with intelligent routing algorithms</p>
                <Link href="/tms-modules/routing" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Explore feature →
                </Link>
              </div>
            </motion.div>

            {/* Small feature card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="lg:col-span-4 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fuel Cost Reduction</h3>
                <p className="text-gray-600 mb-4">Save 15-30% on fuel with our efficiency monitoring</p>
                <Link href="/tms-modules/fuel" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Explore feature →
                </Link>
              </div>
            </motion.div>

            {/* Medium feature card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Driver Performance</h3>
                  <p className="text-gray-600 mb-4">Improve safety and efficiency with driver scoring and coaching</p>
                  <Link href="/tms-modules/drivers" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Explore feature →
                  </Link>
                </div>
                <div className="md:w-1/2 relative">
                  <Image 
                    src="/images/car8.jpeg" 
                    alt="Driver performance dashboard"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {stats.map((stat, index) => (
              <div key={index} className="p-6">
                <motion.div
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-5xl font-bold mb-2"
                >
                  {stat.value}
                </motion.div>
                <div className="text-lg font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonial Carousel */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Trusted by Industry Leaders</h2>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-between z-10">
              <button className="p-2 rounded-full bg-white shadow-md -ml-4 hover:bg-gray-100">
                <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-2 rounded-full bg-white shadow-md -mr-4 hover:bg-gray-100">
                <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="relative overflow-hidden">
              <motion.div 
                className="flex"
                drag="x"
                dragConstraints={{ right: 0, left: -1000 }}
              >
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4"
                  >
                    <div className="bg-white p-8 rounded-xl shadow-lg h-full">
                      <div className="flex items-center mb-6">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{testimonial.name}</h4>
                          <p className="text-gray-500">{testimonial.position}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-12 shadow-inner"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Fleet?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses optimizing their operations with our platform
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-lg shadow-lg hover:bg-blue-50 transition-colors"
              >
                Schedule Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

const stats = [
  { value: "500+", label: "Fleets Managed" },
  { value: "30%", label: "Average Cost Reduction" },
  { value: "99.8%", label: "System Uptime" },
  { value: "24/7", label: "Customer Support" }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    position: "Fleet Manager, TransGlobal",
    quote: "Reduced our operational costs by 28% in the first quarter. The analytics are incredibly insightful.",
    rating: 5,
    avatar: "/images/insa14.jpeg"
  },
  {
    name: "Michael Chen",
    position: "COO, QuickDeliver",
    quote: "The driver portal has significantly improved our on-time delivery rates. Highly recommend!",
    rating: 4,
    avatar: "/images/insa16.jpeg"
  },
  {
    name: "David Rodriguez",
    position: "Logistics Director, MegaFreight",
    quote: "Implementation was seamless and the support team is exceptional. Game changer for our business.",
    rating: 5,
    avatar: "/images/insa5.png"
  },
  {
    name: "Emma Wilson",
    position: "Operations Manager, UrbanTransit",
    quote: "The route optimization alone paid for the system in the first three months.",
    rating: 5,
    avatar: "/images/insa1.png"
  },
  {
    name: "James Peterson",
    position: "CEO, GreenFleet",
    quote: "Best decision we made for our growing logistics company. The ROI is outstanding.",
    rating: 5,
    avatar: "/images/insa4.png"
  }
];