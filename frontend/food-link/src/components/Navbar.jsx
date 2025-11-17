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
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Heart className="w-8 h-8 text-green-600" />
          <span className="text-xl md:text-2xl font-bold text-green-800">Food Link</span>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-6">
          {/* Navigation Items */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.key)}
                className={`px-3 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  isActive(item.key)
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
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
                className={`px-2 py-1 text-xs rounded font-semibold transition-all duration-200 ${
                  isActive(item.key)
                    ? 'bg-green-100 text-green-700 border border-green-200'
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
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-semibold text-green-800">{user.name}</p>
            </div>
            <div className="md:hidden text-right">
              <p className="text-xs font-semibold text-green-800">{user.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 md:space-x-2 bg-red-500 text-white px-2 md:px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
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

