import React from 'react';
import { Heart } from 'lucide-react';

const LoginPage = ({ setCurrentPage, setUserRole }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="w-10 h-10 text-green-600" />
            <span className="text-3xl font-bold text-green-800">Food Link</span>
          </div>
          <h2 className="text-3xl font-bold text-green-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Login to continue making a difference</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            const role = prompt('Enter your role (donor/ngo):');
            setUserRole(role);
            setCurrentPage(role === 'donor' ? 'postDonation' : 'getDonations');
          }}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="mb-6 text-right">
              <a href="#" className="text-green-600 hover:text-green-700 text-sm">
                Forgot Password?
              </a>
            </div>

            <button 
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
            >
              Login
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <button 
              onClick={() => setCurrentPage('register')}
              className="text-green-600 font-semibold hover:text-green-700"
            >
              Sign Up
            </button>
          </p>
        </div>

        <div className="text-center mt-6">
          <button 
            onClick={() => setCurrentPage('landing')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;