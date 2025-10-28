import React, { useState } from "react";
import axios from "axios";
import { Heart, Upload } from "lucide-react";
import { API_ENDPOINTS } from '../config/api';

const PostDonationPage = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quantity: "",
    pickupAddress: "",
    pickupDateTime: "",
    expireDateTime: "",
    lat: "",
    lng: "",
    photos: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You need to be logged in as a donor.");
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.title || !formData.pickupAddress || !formData.quantity) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      const donationData = {
        title: formData.title,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        pickupAddress: formData.pickupAddress,
        pickupDateTime: formData.pickupDateTime,
        expireDateTime: formData.expireDateTime,
        photos: formData.photos ? [formData.photos] : [],
        pickupGeo: {
          lat: parseFloat(formData.lat) || 0,
          lng: parseFloat(formData.lng) || 0,
        },
      };

      const res = await axios.post(API_ENDPOINTS.DONATIONS.BASE,
        donationData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Donation posted successfully!");
      console.log(res.data);
      setTimeout(() => setCurrentPage("getDonations"), 1500);
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to post donation.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">Food Link</span>
          </div>
          <button
            onClick={() => setCurrentPage("landing")}
            className="text-green-700 hover:text-green-900 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-green-900 mb-2">
            Post a Donation
          </h2>
          <p className="text-gray-600">Share your surplus food with NGOs in need</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { name: "title", label: "Title", type: "text" },
              { name: "description", label: "Description", type: "text" },
              { name: "quantity", label: "Quantity", type: "number" },
              { name: "pickupAddress", label: "Pickup Address", type: "text" },
              { name: "pickupDateTime", label: "Pickup Date & Time", type: "datetime-local" },
              { name: "expireDateTime", label: "Expiry Date & Time", type: "datetime-local" },
              { name: "lat", label: "Latitude", type: "number" },
              { name: "lng", label: "Longitude", type: "number" },
              { name: "photos", label: "Photo URL", type: "text" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-gray-700 font-semibold mb-2">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={["title", "pickupAddress", "quantity"].includes(field.name)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              } text-white py-3 rounded-lg font-semibold transition shadow-lg`}
            >
              {loading ? "Posting..." : "Post Donation"}
            </button>

            {error && (
              <p className="text-center mt-4 text-red-500 font-medium">{error}</p>
            )}
            {message && (
              <p className="text-center mt-4 text-green-700 font-medium">{message}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDonationPage;
