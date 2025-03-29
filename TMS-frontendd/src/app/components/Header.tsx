import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faSearch } from '@fortawesome/free-solid-svg-icons'

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center">
        <div className="text-xl font-bold mr-8">INSA ERP</div>
        <button className="mr-4" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>
      <div className="flex items-center">
        <div className="relative mr-4">
          <input
            className="border rounded px-4 py-2 pl-10 text-gray-800"
            placeholder="Search"
            type="text"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-3 text-gray-500"
          />
        </div>
        <img
          alt="User profile picture"
          className="w-10 h-10 rounded-full"
          src="/assets/images/user.png"
        />
      </div>
    </header>
  )
}