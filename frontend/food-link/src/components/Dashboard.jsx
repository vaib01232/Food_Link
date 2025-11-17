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
        // For donors, get all their donations (the endpoint now returns user-specific donations when authenticated as donor)
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
        // For NGOs, get available donations and their claimed donations
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
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">
            Welcome to your Dashboard
          </h1>
          <p className="text-gray-600">
            {user.role === 'donor' 
              ? 'Manage your food donations and help reduce waste'
              : 'Find and claim food donations to help those in need'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-green-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {user.role === 'donor' ? (
              <button
                onClick={() => handleNavigation('postDonation')}
                className="bg-green-600 text-white p-6 rounded-xl shadow-lg hover:bg-green-700 transition-colors flex items-center space-x-4"
              >
                <Plus className="w-8 h-8" />
                <div className="text-left">
                  <h3 className="text-xl font-semibold">Post a New Donation</h3>
                  <p className="text-green-100">Share your surplus food with NGOs</p>
                </div>
              </button>
            ) : (
              <button
                onClick={() => handleNavigation('getDonations')}
                className="bg-green-600 text-white p-6 rounded-xl shadow-lg hover:bg-green-700 transition-colors flex items-center space-x-4"
              >
                <Eye className="w-8 h-8" />
                <div className="text-left">
                  <h3 className="text-xl font-semibold">View Available Donations</h3>
                  <p className="text-green-100">Browse and claim food donations</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-green-900 mb-4">Your Statistics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {user.role === 'donor' ? (
              <>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-900">{stats.totalDonations}</p>
                      <p className="text-gray-600">Total Donations</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-900">{stats.activeDonations}</p>
                      <p className="text-gray-600">Active Donations</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-900">{stats.claimedDonations}</p>
                      <p className="text-gray-600">Donations Claimed</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-900">{stats.availableNearby}</p>
                      <p className="text-gray-600">Available Nearby</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
          <h2 className="text-2xl font-bold text-green-900 mb-4">Profile Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 mb-1">Name</p>
              <p className="font-semibold text-green-900">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Email</p>
              <p className="font-semibold text-green-900">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Role</p>
              <p className="font-semibold text-green-900 capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Member Since</p>
              <p className="font-semibold text-green-900">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Dashboard;

