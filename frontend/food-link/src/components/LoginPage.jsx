import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const LoginPage = ({ setCurrentPage, setUserRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log(email,password)
      const res = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      const payload = JSON.parse(atob(token.split(".")[1])); 
      const role = payload.role;
      localStorage.setItem("user", JSON.stringify(user));

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUserRole(role);
      if(role == "donor"){
        setCurrentPage("postDonation");
      }
      else if(role == "ngo") {
        setCurrentPage("getDonations");
      }
    } catch (error) {
      console.log(error)
      const msg = 
        error.response?.data?.message || "Login failed, please try again.";
      setError(msg);
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
          <h2 className="text-3xl font-bold text-green-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Login to continue making a difference</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

            <div className="mb-6 text-right">
              <a href="#" className="text-green-600 hover:text-green-700 text-sm">
                Forgot Password?
              </a>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
            >
              {loading ? "Logging in..." : "Login"}
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