import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Clock, MapPin, Calendar, Search, Filter, Eye } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS, BACKEND_BASE_URL } from '../config/api';
import toast from 'react-hot-toast';

const GetDonationsPage = ({ user }) => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      try{
        const res = await axios.get(API_ENDPOINTS.DONATIONS.BASE);
        setDonations(res.data);
        setError("");
      } catch (error) {
        console.error("Error fetching donations: ", error);
        setError("Failed to load donations. Please try again.");
        toast.error("Failed to load donations");
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const handleViewDetails = (donationId, e) => {
    if (e) {
      e.stopPropagation(); // Prevent card click from firing
    }
    console.log('Navigating to donation:', donationId);
    navigate(`/donation/${donationId}`);
  };

  const handleClaimDonation = async (donationId, e) => {
    e.stopPropagation(); // Prevent navigation when claiming
    try{
      const token = localStorage.getItem("token");
      await axios.patch(API_ENDPOINTS.DONATIONS.CLAIM(donationId),{},
        { headers: {Authorization: `Bearer ${token}`} }
      );

      setDonations((prev) => 
        prev.map((d) => 
          d._id === donationId ? { ...d, status: 'reserved'} : d
        )
      );
      toast.success("Donation claimed successfully! Redirecting to details...");
      // Navigate to details page after claiming
      setTimeout(() => {
        navigate(`/donation/${donationId}`);
      }, 1000);
    } catch (error) {
      console.error("Error claiming donation:", error);
      toast.error(error.response?.data?.message || "Failed to claim donation");
    }
  };

  if (loading) {
    return(
      <div className='min-h-screen flex items-center justify-center text-green-700 font-semibold text-lg'>
        Loading donations...
      </div>
    );
  }

  if (error) {
    return(
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-500 font-semibold text-lg mb-4'>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-green-900 mb-2">Available Donations</h2>
          <p className="text-gray-600">Browse and claim food donations from verified donors</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Available Donations</h3>
              <p className="text-gray-500">Check back later for new food donations in your area.</p>
            </div>
          ) : (
            donations.map((donation) => (
              <div 
                key={donation._id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                onClick={(e) => {
                  // Only navigate if clicking directly on the card (not on buttons)
                  if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                    handleViewDetails(donation._id);
                  }
                }}
              >
                <div className="bg-gradient-to-r from-green-400 to-green-500 h-3"></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-green-900 mb-1">{donation.title}</h3>
                      <p className="text-gray-600 text-sm flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {donation.donorId?.name || donation.donor?.name || "Anonymous"}
                      </p>
                    </div>
                    {donation.status === 'reserved' && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                        Claimed
                      </span>
                    )}
                  </div>

                  {/* Photos */}
                  {donation.photos && donation.photos.length > 0 && (
                    <div className="mb-4">
                      <div className="grid grid-cols-3 gap-2">
                        {donation.photos.map((photo, idx) => (
                          <img 
                            key={idx} 
                            src={photo.startsWith('http') ? photo : `${BACKEND_BASE_URL}${photo}`} 
                            alt={`${donation.title} - ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {donation.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{donation.description}</p>
                    </div>
                  )}

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-bold text-sm">Q</span>
                      </div>
                      <span className="text-sm">
                        <span className="font-semibold">Quantity:</span> {donation.quantity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-yellow-600" />
                      </div>
                      <span className="text-sm">{donation.pickupAddress}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm">
                        <span className="font-semibold">Pickup:</span>{" "}
                        {new Date(donation.pickupDateTime).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-sm">
                        <span className="font-semibold">Expires:</span>{" "}
                        {new Date(donation.expireDateTime).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleViewDetails(donation._id, e)}
                      className="flex-1 py-3 rounded-lg font-semibold transition bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {donation.status === 'available' && user && user.role === 'ngo' && (
                      <button
                        onClick={(e) => handleClaimDonation(donation._id, e)}
                        className="flex-1 py-3 rounded-lg font-semibold transition bg-green-600 text-white hover:bg-green-700 shadow-md"
                      >
                        Claim Now
                      </button>
                    )}
                  </div>
                  {donation.status !== 'available' && (
                    <div className={`w-full py-3 rounded-lg font-semibold text-center ${
                      donation.status === 'reserved' 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-gray-200 text-gray-500"
                    }`}>
                      {donation.status === 'reserved' ? "Already Claimed" : "Unavailable"}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
  );
};

export default GetDonationsPage;