import React, { useState } from 'react';
import axios from 'axios';
import { Heart } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const RegisterPage = ({ setCurrentPage, userRole, setUserRole }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if(formData.password !== formData.confirmPassword){
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if(!userRole) {
      setError('Please select your role');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(API_ENDPOINTS.AUTH.REGISTER, {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: userRole
      });

      setError("");
      alert('Registration successful! Please login to continue.');
      setCurrentPage('login');
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Registration failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="w-10 h-10 text-green-600" />
            <span className="text-3xl font-bold text-green-800">Food Link</span>
          </div>
          <h2 className="text-3xl font-bold text-green-900 mb-2">Create Your Account</h2>
          <p className="text-gray-600">Join us in fighting food waste and hunger</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Phone</label>
              <input 
                type="tel" 
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">I am a</label>
              <select 
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                required
              >
                <option value="">Select your role</option>
                <option value="donor">Donor (Restaurant, Hotel, Individual)</option>
                <option value="ngo">NGO</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="Create a strong password"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
              <input 
                type="password" 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="Re-enter your password"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              } text-white py-3 rounded-lg font-semibold transition shadow-lg`}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <button 
              onClick={() => setCurrentPage('login')}
              className="text-green-600 font-semibold hover:text-green-700"
            >
              Login
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

export default RegisterPage;