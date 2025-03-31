import Link from 'next/link';

const cards = [
  {
    title: "Request Service",
    description: "Request transportation service for official purposes",
    link: "/tms-modules/employee/request-service",
    icon: "🚗",
    bgColor: "from-blue-500 to-blue-700",
  },
  {
    title: "Request Field",
    description: "Request field visit transportation",
    link: "/tms-modules/employee/request-field",
    icon: "📍",
    bgColor: "from-green-500 to-green-700",
  },
  {
    title: "Send Complaint",
    description: "Submit complaints about transportation services",
    link: "/tms-modules/employee/send-complient",
    icon: "📝",
    bgColor: "from-purple-500 to-purple-700",
  },
];

export default function EmployeeDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Employee Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Link href={card.link} key={index}>
            <div className={`bg-gradient-to-r ${card.bgColor} rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl cursor-pointer`}>
              <div className="text-4xl mb-4">{card.icon}</div>
              <h2 className="text-xl font-bold mb-2">{card.title}</h2>
              <p className="opacity-90">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h2>
        {/* Add recent activities component */}
      </div>
    </div>
  );
}