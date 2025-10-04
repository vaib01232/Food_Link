import React from 'react';
import { Heart, Users, Clock, MapPin, Calendar, Search, Filter } from 'lucide-react';

const GetDonationsPage = ({ setCurrentPage, donations, handleClaimDonation }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">Food Link</span>
          </div>
          <button 
            onClick={() => setCurrentPage('landing')}
            className="text-green-700 hover:text-green-900 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-green-900 mb-2">Available Donations</h2>
          <p className="text-gray-600">Browse and claim food donations from verified donors</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by food type, location..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <div key={donation.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="bg-gradient-to-r from-green-400 to-green-500 h-3"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-green-900 mb-1">{donation.title}</h3>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {donation.donorName}
                    </p>
                  </div>
                  {donation.claimed && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                      Claimed
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-bold text-sm">Q</span>
                    </div>
                    <span className="text-sm"><span className="font-semibold">Quantity:</span> {donation.quantity}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-yellow-600" />
                    </div>
                    <span className="text-sm">{donation.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm">
                      <span className="font-semibold">Pickup:</span> {donation.pickupDate} at {donation.pickupTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-sm">
                      <span className="font-semibold">Expires:</span> {donation.expiryDate}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => handleClaimDonation(donation.id)}
                  disabled={donation.claimed}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    donation.claimed 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                  }`}
                >
                  {donation.claimed ? 'Already Claimed' : 'Claim Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {donations.filter(d => !d.claimed).length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Available Donations</h3>
            <p className="text-gray-500">Check back later for new food donations in your area.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetDonationsPage;