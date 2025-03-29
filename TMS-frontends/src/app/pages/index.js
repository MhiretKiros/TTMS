import { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

// Home Component
const Home = () => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarHidden(!isSidebarHidden);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar isHidden={isSidebarHidden} />
        <div className="flex-1 p-6">
          {/* Main content goes here */}
          <h1 className="text-4xl text-blue-500">Welcome to My Tailwind App</h1>
          {/* Add more content as needed */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
