import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Clock, CheckCircle, Upload } from 'lucide-react';

const LandingPage = ({ setUserRole }) => {
  const navigate = useNavigate();
  
  const handleNavigation = (page, role = null) => {
    if (role && setUserRole) {
      setUserRole(role);
    }
    // Always use React Router navigation, pass role in state
    navigate(`/${page}`, { state: role ? { role } : undefined });
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">Food Link</span>
          </div>
          <div className="space-x-4">
            <button 
              onClick={() => handleNavigation('login')}
              className="text-green-700 hover:text-green-900 font-medium"
            >
              Login
            </button>
            <button 
              onClick={() => handleNavigation('register')}
              className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl font-bold text-green-900 mb-6">
          Connect Surplus Food with Those Who Need It — Instantly
        </h1>
        <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
          Food Link bridges the gap between food donors and NGOs in real-time, reducing waste and fighting hunger in your community.
        </p>
        <div className="flex justify-center space-x-4 flex-wrap gap-4">
          <button 
            onClick={() => handleNavigation('register', 'donor')}
            className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition shadow-lg"
          >
            Donate Food Now
          </button>
          <button 
            onClick={() => handleNavigation('register', 'ngo')}
            className="bg-yellow-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-600 transition shadow-lg"
          >
            Claim Food Now
          </button>
        </div>
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
          <img 
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800" 
            alt="Food donation" 
            className="rounded-lg w-full h-64 object-cover"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-green-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">1. Create Alert</h3>
              <p className="text-gray-600">Donors post available surplus food with details and pickup information.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">2. Real-Time Matching</h3>
              <p className="text-gray-600">NGOs see available donations instantly and can browse by location and quantity.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">3. Claim & Deliver</h3>
              <p className="text-gray-600">Food is claimed quickly and delivered efficiently to those in need.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-green-900 mb-12">Why Food Link?</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-green-800 mb-6">For Donors</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Reduce food waste and make a positive environmental impact</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Simple and quick donation process in minutes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Support your local community and build goodwill</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Track your impact and donations history</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-yellow-700 mb-6">For NGOs</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Access fresh surplus food from verified donors</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Save time with real-time alerts and notifications</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Feed more people with consistent food supply</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Free platform to maximize your resources</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-xl">Meals Donated</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-xl">Active Partners</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-xl">Free to Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-green-900 mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl text-gray-700 mb-8">Join our community today and help reduce food waste while feeding those in need.</p>
          <div className="flex justify-center space-x-4 flex-wrap gap-4">
            <button 
              onClick={() => handleNavigation('register', 'donor')}
              className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition shadow-lg"
            >
              Donate Food
            </button>
            <button 
              onClick={() => handleNavigation('register', 'ngo')}
              className="bg-yellow-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-600 transition shadow-lg"
            >
              Claim Food
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-8 h-8" />
                <span className="text-2xl font-bold">Food Link</span>
              </div>
              <p className="text-green-200">Connecting surplus food with those who need it, one donation at a time.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-green-200">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-green-200">
                <li>Email: support@foodlink.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Food St, City</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-green-800 text-center text-green-200">
            <p>&copy; 2025 Food Link. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;