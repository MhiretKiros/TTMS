import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard', href: '/tms-module/pages/dashboard', icon: '📊' },
  { name: 'Car Attendance', href: '/tms-module/pages/car-attendance', icon: '🚗' },
  { name: 'Register New Car', href: '/tms-module/pages/register-car', icon: '➕' },
  { name: 'View Car Parking', href: '/tms-module/pages/car-location', icon: '📍' },
  { name: 'Service Request', href: '/tms-module/pages/service-request', icon: '🔧' },
  { 
    name: 'Assign Car & Service', 
    icon: '⚙️',
    subItems: [
      { name: 'Assign Service', href: '/tms-module/pages/assign-service' },
      { name: 'Assign Car for Department', href: '/tms-module/pages/assign-car' },
      { name: 'Complain', href: '/tms-module/pages/complaints' },
      { name: 'Order Car', href: '/tms-module/pages/order-car' },
    ]
  },
  { name: 'Transport Management', href: '/tms-module/pages/transport-mgmt', icon: '🚛' },
  { name: 'REPORT', href: '/tms-module/pages/reports', icon: '📈' },
];

// src/app/tms-module/components/TMSSidebar.tsx
export default function TMSSidebar() {
    const pathname = usePathname();
    
    return (
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">TMS Module</h1>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1 p-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                {item.subItems ? (
                  <details className="group [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center px-4 py-2 rounded-lg hover:bg-blue-50 cursor-pointer text-gray-700">
                      <span className="mr-3 text-lg">{item.icon}</span>
                      <span className="flex-1">{item.name}</span>
                      <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                        ▼
                      </span>
                    </summary>
                    <ul className="mt-1 ml-8 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <Link href={subItem.href} className={`flex items-center px-3 py-2 text-sm rounded-lg ${
                            pathname === subItem.href 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'hover:bg-blue-50 text-gray-600'
                          }`}>
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link href={item.href} className={`flex items-center px-4 py-2 rounded-lg ${
                    pathname === item.href 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'hover:bg-blue-50 text-gray-700'
                  }`}>
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">TMS v2.0</div>
        </div>
      </div>
    );
  }