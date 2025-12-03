import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, Eye, Package, Users, MapPin, Calendar, Trash2, Clock, Tag, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS, BACKEND_BASE_URL } from '../config/api';
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
  const [donations, setDonations] = useState([]);
  const [claimedDonations, setClaimedDonations] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDonationId, setDeletingDonationId] = useState(null);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (user.role === 'donor') {
        const response = await axios.get(API_ENDPOINTS.DONATIONS.BASE, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const allDonations = response.data.data || response.data || [];
        // Show active and pending donations, hide claimed/collected/cancelled
        const activeDonations = allDonations.filter(d => 
          d.status === 'available' || d.status === 'pending'
        );
        setDonations(activeDonations);
        
        // Count claimed as reserved OR collected
        const claimedCount = allDonations.filter(d => 
          d.status === 'reserved' || d.status === 'collected'
        ).length;
        
        setStats({
          totalDonations: allDonations.length,
          activeDonations: activeDonations.length,
          claimedDonations: claimedCount,
          availableNearby: 0
        });
      } else if (user.role === 'ngo') {
        const [availableResponse, claimedResponse] = await Promise.all([
          axios.get(API_ENDPOINTS.DONATIONS.BASE, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(API_ENDPOINTS.DONATIONS.CLAIMED, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { data: [] } }))
        ]);
        
        const availableData = availableResponse.data.data || availableResponse.data || [];
        const claimedData = claimedResponse.data.data || claimedResponse.data || [];
        
        const availableDonations = availableData.filter(d => d.status === 'available');
        
        // Only show donations that are reserved (claimed) but NOT yet collected
        const activeClaimedDonations = claimedData.filter(d => d.status === 'reserved');
        
        setClaimedDonations(activeClaimedDonations);
        
        setStats({
          totalDonations: 0,
          activeDonations: 0,
          claimedDonations: activeClaimedDonations.length,
          availableNearby: availableDonations.length
        });
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (donationId, e) => {
    e.stopPropagation();
    setDeletingDonationId(donationId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(API_ENDPOINTS.DONATIONS.DELETE(deletingDonationId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Donation deleted successfully');
      setShowDeleteModal(false);
      setDeletingDonationId(null);
      
      // Refresh donations
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete donation');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingDonationId(null);
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
    <>
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
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-gray-100 mb-10">
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

        {/* Donor's Donations List */}
        {user.role === 'donor' && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Donations</h2>
            {donations.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                {donations.map((donation) => (
                  <div
                    key={donation._id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/donation/${donation._id}`)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Left Section - Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                            <Tag className="w-3 h-3" strokeWidth={2} />
                            {donation.donationId || 'N/A'}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            {donation.status === 'available' ? 'Active' : 'Pending'}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                          {donation.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                            {donation.pickupAddress && donation.pickupAddress.length > 30 
                              ? donation.pickupAddress.substring(0, 30) + '...' 
                              : donation.pickupAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/donation/${donation._id}`);
                          }}
                          className="px-3 py-1.5 text-sm font-medium text-green-700 hover:text-green-800 hover:bg-green-50 rounded transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" strokeWidth={2} />
                          View
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(donation._id, e)}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                          Delete
                        </button>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-gray-600">No active donations yet</p>
                <button
                  onClick={() => navigate('/postDonation')}
                  className="mt-4 text-sm font-medium text-green-700 hover:text-green-800"
                >
                  Create a donation
                </button>
              </div>
            )}
          </div>
        )}

        {/* NGO's Claimed Donations List */}
        {user.role === 'ngo' && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Claimed Donations</h2>
            {claimedDonations.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                {claimedDonations.map((donation) => (
                  <div
                    key={donation._id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/donation/${donation._id}`)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Left Section - Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                            <Tag className="w-3 h-3" strokeWidth={2} />
                            {donation.donationId || 'N/A'}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Claimed by You
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                          {donation.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                            {donation.pickupAddress && donation.pickupAddress.length > 30 
                              ? donation.pickupAddress.substring(0, 30) + '...' 
                              : donation.pickupAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                            Claimed: {new Date(donation.reservedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/donation/${donation._id}`);
                          }}
                          className="px-3 py-1.5 text-sm font-medium text-green-700 hover:text-green-800 hover:bg-green-50 rounded transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" strokeWidth={2} />
                          View Details
                        </button>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-gray-600">No claimed donations yet</p>
                <button
                  onClick={() => navigate('/getDonations')}
                  className="mt-4 text-sm font-medium text-green-700 hover:text-green-800"
                >
                  Browse available donations
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Donation?</h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone. The donation will be permanently removed from the system.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Donation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;

