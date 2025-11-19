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

        {showVerificationMessage ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-4">Check Your Email!</h3>
              <p className="text-gray-600 mb-6">
                We've sent a verification link to <span className="font-semibold text-green-700">{registeredEmail}</span>
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800 mb-2">
                  <strong>Next Steps:</strong>
                </p>
                <ol className="text-sm text-green-700 text-left space-y-1 list-decimal list-inside">
                  <li>Check your inbox (and spam folder)</li>
                  <li>Click the verification link in the email</li>
                  <li>You'll be automatically logged in</li>
                </ol>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                The verification link will expire in 30 minutes.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Go to Login
              </button>
            </div>
          </div>
        ) : (
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
                  minLength="8"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
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
                onClick={() => navigate('/login')}
                className="text-green-600 font-semibold hover:text-green-700"
              >
                Login
              </button>
            </p>
          </div>
        )}

        <div className="text-center mt-6">
          <button 
            onClick={() => navigate('/')}
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