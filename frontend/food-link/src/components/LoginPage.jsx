import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const LoginPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendingEmail, setResendingEmail] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowVerificationPrompt(false);

    try {
      const res = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate("/dashboard");
    } catch (error) {
      if (error.response?.data?.requiresVerification) {
        setUnverifiedEmail(error.response.data.email || email);
        setShowVerificationPrompt(true);
        setError("Please verify your email before logging in.");
      } else {
        const msg = 
          error.response?.data?.message || "Login failed, please try again.";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    try {
      await axios.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {
        email: unverifiedEmail
      });
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification email');
    } finally {
      setResendingEmail(false);
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
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back</h2>
          <p className="text-gray-600 text-lg">Login to continue making a difference</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100">
          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 text-gray-900"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 text-gray-900"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm animate-fadeInUp font-medium">
                {error}
              </div>
            )}

            {showVerificationPrompt && (
              <div className="mb-5 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-xl animate-fadeInUp">
                <p className="text-yellow-800 text-sm mb-3 font-medium">
                  Your email address is not verified yet. Please check your inbox or request a new verification email.
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                >
                  {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>
            )}

            <div className="mb-6 text-right">
              <a href="#" className="text-green-600 hover:text-green-700 text-sm font-semibold hover:underline transition-all duration-300">
                Forgot Password?
              </a>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-8">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/register')}
              className="text-green-600 font-bold hover:text-green-700 hover:underline transition-all duration-300"
            >
              Sign Up
            </button>
          </p>
        </div>

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

export default LoginPage;