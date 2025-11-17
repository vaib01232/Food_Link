import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Package, 
  Mail, 
  Phone, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS, BACKEND_BASE_URL } from '../config/api';
import toast from 'react-hot-toast';

const DonationDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDonationDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDonationDetails = async () => {
    if (!id) {
      console.error('No donation ID provided');
      setError('No donation ID provided');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      console.log('Fetching donation with ID:', id);
      console.log('API URL:', API_ENDPOINTS.DONATIONS.BY_ID(id));
      
      const res = await axios.get(API_ENDPOINTS.DONATIONS.BY_ID(id), config);
      console.log('Donation fetched successfully:', res.data);
      setDonation(res.data);
    } catch (err) {
      console.error('Error fetching donation:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load donation details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!user || user.role !== 'ngo') {
      toast.error('You must be logged in as an NGO to claim donations');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        API_ENDPOINTS.DONATIONS.CLAIM(id),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setDonation(res.data.donation);
      toast.success('Donation claimed successfully!');
    } catch (err) {
      console.error('Error claiming donation:', err);
      toast.error(err.response?.data?.message || 'Failed to claim donation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPickup = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        API_ENDPOINTS.DONATIONS.CONFIRM_PICKUP(id),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setDonation(res.data.donation);
      toast.success('Pickup confirmed successfully!');
    } catch (err) {
      console.error('Error confirming pickup:', err);
      toast.error(err.response?.data?.message || 'Failed to confirm pickup');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelClaim = async () => {
    if (!window.confirm('Are you sure you want to cancel this claim? The donation will become available for others.')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        API_ENDPOINTS.DONATIONS.CANCEL_CLAIM(id),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setDonation(res.data.donation);
      toast.success('Claim cancelled successfully');
    } catch (err) {
      console.error('Error cancelling claim:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel claim');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { bg: 'bg-green-100', text: 'text-green-800', label: 'Available' },
      reserved: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Claimed' },
      collected: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Collected' },
      expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.available;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const openGoogleMaps = () => {
    if (donation.pickupGeo && donation.pickupGeo.lat && donation.pickupGeo.lng) {
      const url = `https://www.google.com/maps?q=${donation.pickupGeo.lat},${donation.pickupGeo.lng}`;
      window.open(url, '_blank');
    } else {
      toast.error('Location coordinates not available');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-semibold">Loading donation details...</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Donation Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The donation you are looking for does not exist.'}</p>
          <button
            onClick={() => {
              if (user && user.role === 'ngo') {
                navigate('/getDonations');
              } else {
                navigate('/');
              }
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {user && user.role === 'ngo' ? 'Back to Donations' : 'Go to Home'}
          </button>
        </div>
      </div>
    );
  }

  const isClaimedByCurrentUser = user && donation.reservedBy && donation.reservedBy._id === user.id;
  const canClaim = user && user.role === 'ngo' && donation.status === 'available';
  const canConfirmPickup = user && user.role === 'ngo' && donation.status === 'reserved' && isClaimedByCurrentUser;
  const canCancelClaim = user && user.role === 'ngo' && donation.status === 'reserved' && isClaimedByCurrentUser;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => {
            if (user && user.role === 'ngo') {
              navigate('/getDonations');
            } else {
              navigate(-1);
            }
          }}
          className="flex items-center text-green-700 hover:text-green-900 mb-6 font-medium transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {user && user.role === 'ngo' ? 'Back to Donations' : 'Back'}
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Donation Information */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold text-green-900">{donation.title}</h1>
                {getStatusBadge(donation.status)}
              </div>
              
              {donation.description && (
                <p className="text-gray-700 text-lg leading-relaxed">{donation.description}</p>
              )}
            </div>

            {/* Photo Gallery */}
            {donation.photos && donation.photos.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Photos
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {donation.photos.map((photo, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={photo.startsWith('http') ? photo : `${BACKEND_BASE_URL}${photo}`}
                        alt={`${donation.title} - ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 hover:border-green-400 transition cursor-pointer"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                        }}
                        onClick={() => {
                          window.open(photo.startsWith('http') ? photo : `${BACKEND_BASE_URL}${photo}`, '_blank');
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Donation Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">Donation Details</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="font-semibold text-gray-900">{donation.quantity}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pickup Window</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(donation.pickupDateTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expires</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(donation.expireDateTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                {donation.reservedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Claimed At</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(donation.reservedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {donation.collectedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Collected At</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(donation.collectedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Donor Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Donor Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">
                    {donation.donorId?.name || 'Anonymous'}
                  </p>
                </div>
                
                {donation.donorId?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a 
                      href={`mailto:${donation.donorId.email}`}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      {donation.donorId.email}
                    </a>
                  </div>
                )}
                
                {donation.donorId?.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a 
                      href={`tel:${donation.donorId.phoneNumber}`}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      {donation.donorId.phoneNumber}
                    </a>
                  </div>
                )}

                {donation.donorId?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <p className="text-gray-700">{donation.donorId.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Map and Actions */}
          <div className="space-y-6">
            {/* Location */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Pickup Location
              </h2>
              <p className="text-gray-700 mb-4">{donation.pickupAddress}</p>
              
              {/* Google Maps */}
              {donation.pickupGeo && donation.pickupGeo.lat && donation.pickupGeo.lng ? (
                <div className="mb-4">
                  <div 
                    className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 mb-4 bg-gradient-to-br from-green-50 to-blue-50 cursor-pointer hover:border-green-400 transition group"
                    onClick={openGoogleMaps}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <MapPin className="w-16 h-16 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-gray-700 font-medium text-lg">Pickup Location</p>
                      <p className="text-gray-500 text-sm mt-1">Click to open in Google Maps</p>
                      <div className="mt-4 text-xs text-gray-400">
                        {donation.pickupGeo.lat.toFixed(6)}, {donation.pickupGeo.lng.toFixed(6)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={openGoogleMaps}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Open in Google Maps
                  </button>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Location coordinates not available</p>
                  {donation.pickupAddress && (
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(donation.pickupAddress)}`;
                        window.open(url, '_blank');
                      }}
                      className="mt-4 text-green-600 hover:text-green-800 font-medium flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Search address in Google Maps
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {user && user.role === 'ngo' && (
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-green-900 mb-4">Actions</h2>
                
                {canClaim && (
                  <button
                    onClick={handleClaim}
                    disabled={actionLoading}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Claiming...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Claim Donation
                      </>
                    )}
                  </button>
                )}

                {canConfirmPickup && (
                  <button
                    onClick={handleConfirmPickup}
                    disabled={actionLoading}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Confirming...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Confirm Pickup
                      </>
                    )}
                  </button>
                )}

                {canCancelClaim && (
                  <button
                    onClick={handleCancelClaim}
                    disabled={actionLoading}
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Cancel Claim
                      </>
                    )}
                  </button>
                )}

                {donation.status === 'collected' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-medium text-center">
                      This donation has been collected
                    </p>
                  </div>
                )}

                {donation.status === 'reserved' && !isClaimedByCurrentUser && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 font-medium text-center">
                      This donation has been claimed by another NGO
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Status Information for Non-NGOs */}
            {(!user || user.role !== 'ngo') && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-green-900 mb-4">Status</h2>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    {donation.status === 'available' && 'This donation is available for claim.'}
                    {donation.status === 'reserved' && 'This donation has been claimed.'}
                    {donation.status === 'collected' && 'This donation has been collected.'}
                    {donation.status === 'expired' && 'This donation has expired.'}
                    {donation.status === 'cancelled' && 'This donation has been cancelled.'}
                  </p>
                  {(!user || user.role !== 'ngo') && donation.status === 'available' && (
                    <p className="text-sm text-gray-600 mt-2">
                      Please log in as an NGO to claim this donation.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationDetails;

