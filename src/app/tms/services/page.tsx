"use client";
import Footer from '@/app/component/Footer';
import Navbar from '@/app/component/Navbar';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 to-blue-900 text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/circuit-pattern.svg')] bg-repeat opacity-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Comprehensive <span className="text-yellow-300">Solutions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto"
          >
            Tailored services to optimize every aspect of your transportation operations
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Core Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48">
                  <Image 
                    src={service.image} 
                    alt={service.title} 
                    layout="fill" 
                    objectFit="cover"
                    className="transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${service.color} mr-4`}>
                      <Image 
                        src={service.icon} 
                        alt={service.title + " icon"} 
                        width={24} 
                        height={24}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2 mb-4">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={service.link} className="inline-block mt-4 px-4 py-2 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                    Learn More
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Advanced Features</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              {featuresLeft.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="mb-8 last:mb-0"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg mr-4">
                      <Image 
                        src={feature.icon} 
                        alt={feature.title + " icon"} 
                        width={24} 
                        height={24}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="relative">
              <Image 
                src="/images/insa17.jpeg" 
                alt="Features dashboard" 
                width={600} 
                height={500}
                className="rounded-lg shadow-lg"
              />
              <motion.div 
                className="absolute -bottom-4 -right-4 bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg shadow-lg font-bold"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
              >
                Live Preview
              </motion.div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Flexible Pricing Plans</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`rounded-xl shadow-lg overflow-hidden ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <div className="bg-blue-500 text-white text-center py-1 font-bold text-sm">
                    MOST POPULAR
                  </div>
                )}
                <div className="bg-white p-8">
                  <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-center mb-6">{plan.description}</p>
                  
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${feature.included ? 'text-green-500' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.included ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                        </svg>
                        <span className={`${feature.included ? 'text-gray-600' : 'text-gray-400'}`}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className={`w-full py-3 px-4 rounded-lg font-medium ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} transition-colors`}>
                    Get Started
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-4"
          >
            Ready to Transform Your Fleet Operations?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl mb-8 max-w-2xl mx-auto"
          >
            Schedule a demo with our team to see how our TMS can work for your business.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <button className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold rounded-lg shadow-lg transition-colors">
              Request Demo
            </button>
            <button className="px-8 py-3 bg-transparent border-2 border-white hover:bg-white hover:text-blue-800 font-bold rounded-lg shadow-lg transition-colors">
              Contact Sales
            </button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const coreServices = [
  {
    title: "Fleet Management",
    description: "Comprehensive tools to manage your entire fleet efficiently and reduce operational costs.",
    features: [
      "Real-time vehicle tracking",
      "Maintenance scheduling",
      "Fuel management",
      "Driver performance analytics"
    ],
    image: "/images/insa10.jpeg",
    icon: "/images/insaprofile.png",
    color: "bg-purple-100",
    link: "/services/fleet-management"
  },
  {
    title: "Route Optimization",
    description: "AI-powered routing to reduce mileage, fuel costs, and improve delivery times.",
    features: [
      "Dynamic routing based on traffic",
      "Multi-stop optimization",
      "Geofencing capabilities",
      "Delivery time estimation"
    ],
    image: "/images/insa11.jpeg",
    icon: "/images/insa15.jpeg",
    color: "bg-blue-100",
    link: "/services/route-optimization"
  },
  {
    title: "Driver Management",
    description: "Tools to monitor, train, and improve your driver workforce.",
    features: [
      "Electronic logging devices",
      "Driver scorecards",
      "Training modules",
      "Compliance tracking"
    ],
    image: "/images/insa17.jpeg",
    icon: "/images/insa18.png",
    color: "bg-green-100",
    link: "/services/driver-management"
  },
  {
    title: "Asset Tracking",
    description: "Monitor all your assets in real-time with advanced IoT sensors.",
    features: [
      "Real-time location tracking",
      "Temperature monitoring",
      "Shock/vibration alerts",
      "Theft prevention"
    ],
    image: "/images/insa13.jpeg",
    icon: "/images/insaprofile.png",
    color: "bg-red-100",
    link: "/services/asset-tracking"
  },
  {
    title: "Reporting & Analytics",
    description: "Powerful insights to make data-driven decisions for your operations.",
    features: [
      "Customizable dashboards",
      "KPI tracking",
      "Automated reports",
      "Predictive analytics"
    ],
    image: "/images/insa5.png",
    icon: "/images/insaprofile.png",
    color: "bg-yellow-100",
    link: "/services/analytics"
  },
  {
    title: "Compliance Management",
    description: "Stay compliant with regulations effortlessly with automated tools.",
    features: [
      "ELD compliance",
      "DOT reporting",
      "Driver certification tracking",
      "Audit preparation"
    ],
    image: "/images/insa4.png",
    icon: "/images/insaprofile.png",
    color: "bg-indigo-100",
    link: "/services/compliance"
  }
];

const featuresLeft = [
  {
    title: "Real-time GPS Tracking",
    description: "Monitor your entire fleet in real-time with live updates every 30 seconds. Set up geofences and receive instant alerts for deviations.",
    icon: "/images/insaprofile.png"
  },
  {
    title: "Predictive Maintenance",
    description: "Our AI analyzes vehicle data to predict maintenance needs before they become costly repairs, reducing downtime by up to 40%.",
    icon: "/images/insaprofile.png"
  },
  {
    title: "Driver Behavior Analysis",
    description: "Identify risky driving patterns like harsh braking and acceleration to improve safety and reduce fuel consumption.",
    icon: "/images/insaprofile.png"
  }
];

const pricingPlans = [
  {
    name: "Starter",
    description: "For small fleets getting started",
    price: "99",
    period: "month",
    popular: false,
    features: [
      { text: "Up to 10 vehicles", included: true },
      { text: "Basic tracking", included: true },
      { text: "Email support", included: true },
      { text: "Route optimization", included: false },
      { text: "Advanced analytics", included: false },
      { text: "API access", included: false }
    ]
  },
  {
    name: "Professional",
    description: "For growing fleets with more needs",
    price: "299",
    period: "month",
    popular: true,
    features: [
      { text: "Up to 50 vehicles", included: true },
      { text: "Advanced tracking", included: true },
      { text: "24/7 support", included: true },
      { text: "Route optimization", included: true },
      { text: "Basic analytics", included: true },
      { text: "Limited API access", included: false }
    ]
  },
  {
    name: "Enterprise",
    description: "For large operations with custom needs",
    price: "Custom",
    period: "month",
    popular: false,
    features: [
      { text: "Unlimited vehicles", included: true },
      { text: "Premium tracking", included: true },
      { text: "Dedicated support", included: true },
      { text: "Advanced optimization", included: true },
      { text: "Full analytics suite", included: true },
      { text: "Full API access", included: true }
    ]
  }
];