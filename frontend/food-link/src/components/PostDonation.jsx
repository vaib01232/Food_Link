import React from 'react';
import { Heart, Upload } from 'lucide-react';

const PostDonationPage = ({ setCurrentPage, handlePostDonation }) => {
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

      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-green-900 mb-2">Post a Donation</h2>
          <p className="text-gray-600">Share your surplus food with NGOs in need</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handlePostDonation}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Food Title</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="e.g., Fresh Vegetables, Cooked Meals"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                rows="4"
                placeholder="Describe the food items, condition, and any special notes"
                required
              ></textarea>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Quantity</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                  placeholder="e.g., 20 kg, 50 servings"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Pickup Address</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                  placeholder="Your location"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Pickup Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Pickup Time</label>
                <input 
                  type="time" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Expiry Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Expiry Time</label>
                <input 
                  type="time" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                  required
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-2">Upload Photos</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setCurrentPage('landing')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
              >
                Post Donation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDonationPage;