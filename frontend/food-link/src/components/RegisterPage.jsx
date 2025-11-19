import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Heart } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(location.state?.role || '');
  
  useEffect(() => {
    if (location.state?.role) {
      setUserRole(location.state.role);
    }
  }, [location.state]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

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
      const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: userRole
      });

      setError("");
      
      if (response.data.requiresVerification) {
        setRegisteredEmail(formData.email);
        setShowVerificationMessage(true);
        toast.success('Registration successful! Please check your email.');
      } else {
        toast.success('Registration successful! Please login to continue.');
        navigate('/login');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-3">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">Food Link</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Create Your Account</h2>
          <p className="text-gray-600 text-lg">Join us in fighting food waste and hunger</p>
        </div>

        {showVerificationMessage ? (
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100 animate-fadeInUp">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email!</h3>
              <p className="text-gray-600 mb-6 text-lg">
                We've sent a verification link to <span className="font-bold text-green-700">{registeredEmail}</span>
              </p>
              <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-5 mb-6">
                <p className="text-sm font-bold text-green-900 mb-3">
                  Next Steps:
                </p>
                <ol className="text-sm text-green-800 text-left space-y-2 list-decimal list-inside font-medium">
                  <li>Check your inbox (and spam folder)</li>
                  <li>Click the verification link in the email</li>
                  <li>You'll be automatically logged in</li>
                </ol>
              </div>
              <p className="text-sm text-gray-500 mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-xl">
                ⏰ The verification link will expire in 30 minutes.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-lg"
              >
                Go to Login
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100">
            <form onSubmit={handleRegister}>
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 text-gray-900"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 text-gray-900"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 text-gray-900"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">I am a</label>
                <select 
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 text-gray-900 bg-white"
                  required
                >
                  <option value="">Select your role</option>
                  <option value="donor">Donor (Restaurant, Hotel, Individual)</option>
                  <option value="ngo">NGO</option>
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 text-gray-900"
                  placeholder="Create a strong password"
                  required
                  minLength="8"
                />
                <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 text-gray-900"
                  placeholder="Re-enter your password"
                  required
                />
              </div>

              {error && (
                <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm font-medium animate-fadeInUp">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </form>

            <p className="text-center text-gray-600 mt-8">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-green-600 font-bold hover:text-green-700 hover:underline transition-all duration-300"
              >
                Login
              </button>
            </p>
          </div>
        )}

        <div className="text-center mt-6">
          <button 
            onClick={() => navigate('/')}
            className="text-green-600 hover:text-green-700 font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all duration-300"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;