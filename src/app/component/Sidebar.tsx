"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  title: string;
  link: string;
  icon: React.ReactNode;
  subItems?: {
    title: string;
    link: string;
    icon: React.ReactNode;
  }[];

}

export default function Sidebar({ items, isOpen, onToggle }: { 
  items: SidebarItem[];
  isOpen: boolean;
  onToggle: () => void;
  activeColor?: string;
}) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const pathname = usePathname();
  const activeColor = '#3c8dbc'; // Active text color

  const handleItemClick = (link: string) => {
    setExpandedItem(expandedItem === link ? null : link);
  };

  return (
    <div className={`bg-gray-800 text-white ${isOpen ? 'w-64' : 'w-20'} min-h-screen transition-all duration-300 ease-in-out`}>
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        {isOpen && <h2 className="text-xl font-bold">TMS</h2>}
        <button 
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-700"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? '«' : '»'}
        </button>
      </div>
      <nav className="mt-6">
        <ul>
          {items.map((item) => (
            <li key={item.link} className="mb-2">
              {item.subItems ? (
                <>
                  <div 
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      pathname.startsWith(item.link) 
                        ? 'text-[#3c8dbc] shadow-md shadow-gray-900' 
                        : 'hover:bg-gray-700 hover:shadow-md hover:shadow-gray-900'
                    }`}
                    onClick={() => handleItemClick(item.link)}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{item.icon}</span>
                      {isOpen && <span>{item.title}</span>}
                    </div>
                    {isOpen && item.subItems && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform ${expandedItem === item.link ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                  {isOpen && expandedItem === item.link && item.subItems && (
                    <ul className="ml-6 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.link}>
                          <Link
                            href={subItem.link}
                            className={`flex items-center p-2 pl-8 rounded transition-all ${
                              pathname === subItem.link 
                                ? 'text-[#3c8dbc] shadow-md shadow-gray-900' 
                                : 'hover:bg-gray-700 hover:shadow-md hover:shadow-gray-900'
                            }`}
                          >
                            <span className="mr-3">{subItem.icon}</span>
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.link}
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    pathname === item.link 
                      ? 'text-[#3c8dbc] shadow-md shadow-gray-900' 
                      : 'hover:bg-gray-700 hover:shadow-md hover:shadow-gray-900'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {isOpen && <span>{item.title}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}