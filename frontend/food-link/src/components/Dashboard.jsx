import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, Eye, Package, Users, MapPin, Calendar, Trash2 } from 'lucide-react';
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
        setDonations(allDonations);
        
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
      console.error('Error deleting donation:', error);
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
        {user.role === 'donor' && donations.length > 0 && (
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-green-900 mb-6">Your Donations</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((donation) => (
                <div
                  key={donation._id}
                  className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 border-gray-100"
                  onClick={() => navigate(`/donation/${donation._id}`)}
                >
                  <div className={`h-3 ${
                    donation.status === 'available' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                    donation.status === 'reserved' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                    'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}></div>
                  
                  {/* Image */}
                  {donation.photos && donation.photos.length > 0 && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={`${BACKEND_BASE_URL}${donation.photos[0]}`}
                        alt={donation.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                        {donation.donationId || 'No ID'}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-green-900 mb-2">{donation.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          donation.status === 'available' ? 'bg-green-100 text-green-800' :
                          donation.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Quantity: {donation.quantity}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Pickup: {new Date(donation.pickupDateTime).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {donation.pickupAddress}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/donation/${donation._id}`);
                        }}
                        className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(donation._id, e)}
                        className="bg-red-500 text-white py-2.5 px-4 rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fadeInUp">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Donation?</h3>
              <p className="text-gray-600">
                Are you sure you want to delete this donation? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={cancelDelete}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 text-white py-3 px-6 rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;

