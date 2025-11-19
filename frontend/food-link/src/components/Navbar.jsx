import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = ({ user, setUser, currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };

  const isActive = (page) => {
    if (currentPage) {
      return currentPage === page;
    }
    return location.pathname === `/${page}` || (page === 'dashboard' && location.pathname === '/');
  };

  const navItems = user.role === 'donor' 
    ? [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'postDonation', label: 'Post Donation' }
      ]
    : [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'getDonations', label: 'Get Donations' }
      ];

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-md border-b-2 border-green-100">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-2xl shadow-lg">
            <Heart className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Food Link
          </span>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-6">
          {/* Navigation Items */}
          <nav className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.key)}
                className={`px-4 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                  isActive(item.key)
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50 hover:scale-105'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* Mobile Navigation */}
          <nav className="md:hidden flex space-x-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.key)}
                className={`px-3 py-2 text-xs rounded-lg font-bold transition-all duration-300 ${
                  isActive(item.key)
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {item.label.split(' ')[0]}
              </button>
            ))}
          </nav>
          
          {/* User Info & Logout */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm text-gray-600 font-medium">Welcome back,</p>
              <p className="font-bold text-green-800">{user.name}</p>
            </div>
            <div className="md:hidden text-right">
              <p className="text-xs font-bold text-green-800">{user.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 md:space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm font-bold"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

