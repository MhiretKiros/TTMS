"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaTruck, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaLinkedin, FaTwitter, FaFacebook, FaYoutube } from "react-icons/fa";
import { FiArrowUp } from "react-icons/fi";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-gray-900 text-white pt-12 pb-6"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center md:items-start"
          >
            <div className="flex items-center mb-4">
              <FaTruck className="text-3xl text-blue-400 mr-2" />
              <h3 className="text-xl font-bold">TMS Pro</h3>
            </div>
            <p className="text-gray-400 text-center md:text-left mb-4">
              Revolutionizing fleet management with cutting-edge technology and exceptional service.
            </p>
            <div className="flex space-x-4">
              <motion.a 
                whileHover={{ y: -3, color: "#3b82f6" }}
                href="#" 
                className="text-gray-400 hover:text-blue-400"
              >
                <FaLinkedin size={20} />
              </motion.a>
              <motion.a 
                whileHover={{ y: -3, color: "#3b82f6" }}
                href="#" 
                className="text-gray-400 hover:text-blue-400"
              >
                <FaTwitter size={20} />
              </motion.a>
              <motion.a 
                whileHover={{ y: -3, color: "#3b82f6" }}
                href="#" 
                className="text-gray-400 hover:text-blue-400"
              >
                <FaFacebook size={20} />
              </motion.a>
              <motion.a 
                whileHover={{ y: -3, color: "#3b82f6" }}
                href="#" 
                className="text-gray-400 hover:text-blue-400"
              >
                <FaYoutube size={20} />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center md:items-start"
          >
            <h3 className="text-lg font-semibold mb-4 border-b border-blue-400 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", link: "/" },
                { name: "About Us", link: "/about" },
                { name: "Services", link: "/services" },
                { name: "Fleet", link: "/fleet" },
                { name: "Contact", link: "/contact" }
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link href={item.link} className="text-gray-400 hover:text-blue-400 transition-colors">
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center md:items-start"
          >
            <h3 className="text-lg font-semibold mb-4 border-b border-blue-400 pb-2">Our Services</h3>
            <ul className="space-y-2">
              {[
                "Fleet Tracking",
                "Route Optimization",
                "Driver Management",
                "Fuel Monitoring",
                "Maintenance Scheduling",
                "Reporting & Analytics"
              ].map((service, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="text-gray-400 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {service}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center md:items-start"
          >
            <h3 className="text-lg font-semibold mb-4 border-b border-blue-400 pb-2">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-blue-400 mt-1 mr-3" />
                <span className="text-gray-400">123 Transport St, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-blue-400 mr-3" />
                <span className="text-gray-400">+251 123 456 789</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-blue-400 mr-3" />
                <span className="text-gray-400">info@tmspro.com</span>
              </li>
              <li className="flex items-center">
                <FaClock className="text-blue-400 mr-3" />
                <span className="text-gray-400">Mon-Fri: 8:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Newsletter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-semibold mb-2">Subscribe to our Newsletter</h3>
              <p className="text-gray-400">Get the latest updates and news about our services</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 w-full"
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-lg transition-colors"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Copyright and Back to Top */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-800">
          <p className="text-gray-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} TMS Pro. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors">
              Terms of Service
            </Link>
            <motion.button
              onClick={scrollToTop}
              whileHover={{ y: -5 }}
              className="flex items-center text-gray-400 hover:text-blue-400 transition-colors"
            >
              Back to Top <FiArrowUp className="ml-1" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;