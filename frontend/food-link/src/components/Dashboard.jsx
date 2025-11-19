import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, Eye, Package, Users, MapPin, Calendar } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  
  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };
  
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    claimedDonations: 0,
    availableNearby: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (user.role === 'donor') {
        const response = await axios.get(API_ENDPOINTS.DONATIONS.BASE, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const allDonations = response.data.data || response.data || [];
        
        setStats({
          totalDonations: allDonations.length,
          activeDonations: allDonations.filter(d => d.status === 'available').length,
          claimedDonations: allDonations.filter(d => d.status === 'reserved' || d.status === 'collected').length,
          availableNearby: 0
        });
      } else if (user.role === 'ngo') {
        const [availableResponse, claimedResponse] = await Promise.all([
          axios.get(API_ENDPOINTS.DONATIONS.BASE),
          axios.get(API_ENDPOINTS.DONATIONS.CLAIMED, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { data: [] } }))
        ]);
        
        const availableData = availableResponse.data.data || availableResponse.data || [];
        const claimedData = claimedResponse.data.data || claimedResponse.data || [];
        
        const availableDonations = availableData.filter(d => d.status === 'available');
        
        setStats({
          totalDonations: 0,
          activeDonations: 0,
          claimedDonations: claimedData.length,
          availableNearby: availableDonations.length
        });
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user.role]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-bold text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-10 animate-fadeInUp">
          <h1 className="text-5xl font-bold text-green-900 mb-3">
            Welcome to your Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            {user.role === 'donor' 
              ? 'Manage your food donations and help reduce waste'
              : 'Find and claim food donations to help those in need'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-green-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {user.role === 'donor' ? (
              <button
                onClick={() => handleNavigation('postDonation')}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-3xl shadow-2xl hover:shadow-[0_20px_50px_rgba(34,197,94,0.3)] hover:scale-[1.02] transition-all duration-300 flex items-center space-x-4"
              >
                <div className="bg-white/20 p-4 rounded-2xl">
                  <Plus className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold">Post a New Donation</h3>
                  <p className="text-green-100 font-medium">Share your surplus food with NGOs</p>
                </div>
              </button>
            ) : (
              <button
                onClick={() => handleNavigation('getDonations')}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-3xl shadow-2xl hover:shadow-[0_20px_50px_rgba(34,197,94,0.3)] hover:scale-[1.02] transition-all duration-300 flex items-center space-x-4"
              >
                <div className="bg-white/20 p-4 rounded-2xl">
                  <Eye className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold">View Available Donations</h3>
                  <p className="text-green-100 font-medium">Browse and claim food donations</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-green-900 mb-6">Your Statistics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {user.role === 'donor' ? (
              <>
                <div className="bg-white p-6 rounded-3xl shadow-2xl border-2 border-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:scale-105 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                      <Package className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-900">{stats.totalDonations}</p>
                      <p className="text-gray-600 font-medium text-sm">Total Donations</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-2xl border-2 border-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:scale-105 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-7 h-7 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-900">{stats.activeDonations}</p>
                      <p className="text-gray-600 font-medium text-sm">Active Donations</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-6 rounded-3xl shadow-2xl border-2 border-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:scale-105 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                      <Package className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-900">{stats.claimedDonations}</p>
                      <p className="text-gray-600 font-medium text-sm">Donations Claimed</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-2xl border-2 border-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:scale-105 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                      <MapPin className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-900">{stats.availableNearby}</p>
                      <p className="text-gray-600 font-medium text-sm">Available Nearby</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-gray-100">
          <h2 className="text-3xl font-bold text-green-900 mb-6">Profile Information</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Name</p>
              <p className="font-bold text-green-900 text-lg">{user.name}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Email</p>
              <p className="font-bold text-green-900 text-lg">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Role</p>
              <p className="font-bold text-green-900 text-lg capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Member Since</p>
              <p className="font-bold text-green-900 text-lg">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Dashboard;

