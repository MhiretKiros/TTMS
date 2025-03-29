import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTachometerAlt,
  faMoneyCheckAlt,
  faShoppingCart,
  faBoxes,
  faSearch,
  faUsers,
  faUser,
  faFileInvoiceDollar,
  faLayerGroup,
  faTruck,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons'

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const menuItems = [
    { icon: faTachometerAlt, label: 'Dashboard' },
    { icon: faTruck, label: 'TMS' },
    { icon: faMoneyCheckAlt, label: 'Payroll' },
    { icon: faShoppingCart, label: 'Procurement' },
    { icon: faBoxes, label: 'Material Management' },
    { icon: faSearch, label: 'Lookup Manager' },
    { icon: faUsers, label: 'HR Management' },
    { icon: faUser, label: 'Profile' },
    { icon: faFileInvoiceDollar, label: 'Internal Revenue Finance' },
    { icon: faLayerGroup, label: 'Layouts' },
    { icon: faFileAlt, label: 'Pages' },
  ]

  return (
    <div className={`w-64 bg-gray-800 text-white flex flex-col sidebar sticky top-0 h-screen ${className}`} id="sidebar">
      <ul className="mt-6 flex-1">
        {menuItems.map((item, index) => (
          <li key={index} className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
            <FontAwesomeIcon icon={item.icon} className="mr-2" />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

