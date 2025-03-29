// src/app/tms-module/components/DashboardCards.tsx
export default function DashboardCards() {
    const cards = [
      { title: 'Total Vehicles', value: '48', icon: '🚗', trend: '↑ 12%', color: 'bg-blue-100 text-blue-600' },
      { title: 'Active Services', value: '15', icon: '🔧', trend: '↑ 5%', color: 'bg-purple-100 text-purple-600' },
      { title: 'Available Cars', value: '22', icon: '✅', trend: '↓ 3%', color: 'bg-green-100 text-green-600' },
      { title: 'Pending Requests', value: '8', icon: '⏳', trend: '↑ 20%', color: 'bg-amber-100 text-amber-600' },
    ];
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className={`${card.color} rounded-xl p-6 shadow-sm border border-gray-200`}>
            {/* ... rest of the card content ... */}
          </div>
        ))}
      </div>
    );
  }