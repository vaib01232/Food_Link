import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { 
  Heart, 
  Upload, 
  Package, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { API_ENDPOINTS, BACKEND_BASE_URL } from '../config/api';
import toast from 'react-hot-toast';
import LocationPicker from './LocationPicker';
import PhoneVerificationModal from './PhoneVerificationModal';

const PostDonationPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quantity: "",
    pickupAddress: "",
    pickupDate: "",
    pickupTime: "",
    expiryDate: "",
    expiryTime: "",
    lat: "",
    lng: "",
    photos: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [user, setUser] = useState(null);

  // Load user on component mount
  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData({
      ...formData,
      lat: lat.toString(),
      lng: lng.toString()
    });
  };

  const nextStep = () => {
    // Validate step 1
    if (currentStep === 1) {
      if (!formData.title || !formData.quantity) {
        toast.error('Please fill in all required fields (Title and Quantity)');
        return;
      }
      if (parseInt(formData.quantity) <= 0) {
        toast.error('Quantity must be greater than 0');
        return;
      }
    }
    
    // Validate step 2
    if (currentStep === 2) {
      if (!formData.lat || !formData.lng) {
        toast.error('Please select a pickup location on the map');
        return;
      }
      if (!formData.pickupDate || !formData.pickupTime) {
        toast.error('Please select pickup date and time');
        return;
      }
      if (!formData.expiryDate || !formData.expiryTime) {
        toast.error('Please select expiry date and time');
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const MAX_PHOTOS = 10;

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    
    // Check if total files exceed limit
    if (files.length > MAX_PHOTOS) {
      toast.error(`You can only upload a maximum of ${MAX_PHOTOS} photos at once`);
      e.target.value = ''; // Clear the file input
      return;
    }
    
    setSelectedFiles(files);
    setUploadedUrls([]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
  };

  const handleRemovePhoto = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
    
    // Also clear uploaded URLs if any
    if (uploadedUrls.length > 0) {
      const newUploadedUrls = uploadedUrls.filter((_, i) => i !== index);
      setUploadedUrls(newUploadedUrls);
    }
  };

  // Compute min values for date/time inputs to prevent past selections
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const nowTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const pickupMinDate = todayDate;
  const pickupMinTime = formData.pickupDate === todayDate ? nowTime : undefined;

  const expiryMinDate = formData.pickupDate || todayDate;
  let expiryMinTime;
  if (formData.expiryDate === todayDate) {
    expiryMinTime = nowTime;
  } else if (formData.pickupDate && formData.expiryDate === formData.pickupDate && formData.pickupTime) {
    expiryMinTime = formData.pickupTime;
  }

  const uploadImages = async () => {
    if (!selectedFiles.length) {
      toast.error("Please select images to upload");
      return;
    }
    if (selectedFiles.length > MAX_PHOTOS) {
      toast.error(`You can only upload a maximum of ${MAX_PHOTOS} photos`);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to be logged in as a donor.");
      return;
    }
    try {
      setUploading(true);
      const form = new FormData();
      
      // Validate each file before uploading
      for (let file of selectedFiles) {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File "${file.name}" is too large. Maximum size is 10MB.`);
          setUploading(false);
          return;
        }
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`File "${file.name}" has invalid type. Only JPEG, PNG, WebP, and GIF are allowed.`);
          setUploading(false);
          return;
        }
        form.append("images", file);
      }
      
      const res = await axios.post(`${API_ENDPOINTS.UPLOADS.IMAGES}`, form, {
        headers: { 
          Authorization: `Bearer ${token}`
        },
      });
      const urls = res.data?.urls || [];
      setUploadedUrls(urls);
      toast.success("Images uploaded successfully");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to upload images";
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user has phone number
    if (!user?.phoneNumber) {
      setShowPhoneModal(true);
      return;
    }

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

      if (!formData.title || !formData.quantity) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      if (!formData.pickupDate || !formData.pickupTime || !formData.expiryDate || !formData.expiryTime) {
        setError("Please fill in all date and time fields.");
        setLoading(false);
        return;
      }

      if (!formData.lat || !formData.lng) {
        setError("Please select a pickup location on the map.");
        toast.error("Please select a pickup location on the map");
        setLoading(false);
        return;
      }

      // Generate address from coordinates
      const pickupAddress = formData.pickupAddress || `Location: ${parseFloat(formData.lat).toFixed(4)}, ${parseFloat(formData.lng).toFixed(4)}`;

      const donationData = {
        title: formData.title,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        pickupAddress: pickupAddress,
        pickupDateTime: `${formData.pickupDate}T${formData.pickupTime}`,
        expireDateTime: `${formData.expiryDate}T${formData.expiryTime}`,
        photos: uploadedUrls,
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
      toast.success("Donation posted successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to post donation.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-10 animate-fadeInUp">
          <div className="flex items-center justify-center mb-6 space-x-3">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-2xl shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">Post a Donation</h1>
          </div>
          <p className="text-gray-600 text-lg font-medium">Share your surplus food with NGOs in need</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-br from-green-600 to-green-700 text-white scale-110' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-6 h-6" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-20 h-2 mx-3 rounded-full transition-all duration-300 ${
                    currentStep > step ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStep === 1 && "Food Details"}
              {currentStep === 2 && "Pickup Information"}
              {currentStep === 3 && "Review & Submit"}
            </h2>
            <p className="text-gray-600 font-medium">
              {currentStep === 1 && "Tell us about the food you're donating"}
              {currentStep === 2 && "When and where can NGOs pick up the food?"}
              {currentStep === 3 && "Review your donation details before posting"}
            </p>
          </div>

          {/* Card Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Food Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Food Title *</label>
                    <div className="relative">
                      <Package className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="title"
                        placeholder="e.g., Fresh Vegetables, Cooked Meals, Baked Goods"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Description</label>
                    <textarea
                      name="description"
                      placeholder="Describe the food items, ingredients, preparation method, etc."
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Quantity / Number of Servings *</label>
                    <input
                      type="number"
                      name="quantity"
                      placeholder="e.g., 50, 20"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Upload Photos (Optional)</label>
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-3 mb-3">
                      <p className="text-blue-800 text-xs font-medium">
                        Maximum {MAX_PHOTOS} photos allowed per donation
                      </p>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-green-400 hover:bg-green-50/50 transition-all duration-300 cursor-pointer">
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <input
                        id="photos"
                        type="file"
                        name="photos"
                        accept="image/*"
                        multiple
                        onChange={handleFilesSelected}
                        className="hidden"
                      />
                      <label htmlFor="photos" className="cursor-pointer">
                        <span className="text-sm text-gray-500 font-medium">Click to upload or drag and drop</span>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB (Max {MAX_PHOTOS} photos)</p>
                      </label>
                    </div>
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {previewUrls.map((src, idx) => (
                          <div key={idx} className="relative w-full h-28 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md group">
                            <img src={src} alt="preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                              title="Remove photo"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={uploadImages}
                        disabled={uploading || !selectedFiles.length}
                        className={`mt-2 px-6 py-3 rounded-xl text-white font-bold transition-all duration-300 ${uploading || !selectedFiles.length ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg hover:scale-105'}`}
                      >
                        {uploading ? 'Uploading...' : uploadedUrls.length ? 'Re-upload' : 'Upload Images'}
                      </button>
                      {uploadedUrls.length > 0 && (
                        <span className="text-sm text-green-700 font-bold">✓ {uploadedUrls.length} image(s) uploaded</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Pickup Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Location Picker */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      Select Pickup Location *
                    </label>
                    {!formData.lat || !formData.lng ? (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-4 mb-3">
                        <p className="text-yellow-800 text-sm font-medium">
                          ⚠️ Please select your pickup location on the map and click "Confirm Location" button
                        </p>
                      </div>
                    ) : (
                      <div className="bg-green-50 border-l-4 border-green-400 rounded-xl p-4 mb-3">
                        <p className="text-green-800 text-sm font-medium">
                          ✓ Location confirmed: {parseFloat(formData.lat).toFixed(4)}, {parseFloat(formData.lng).toFixed(4)}
                        </p>
                      </div>
                    )}
                    <LocationPicker
                      onLocationSelect={handleLocationSelect}
                      initialLat={formData.lat}
                      initialLng={formData.lng}
                      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Pickup Date *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          name="pickupDate"
                          value={formData.pickupDate}
                          onChange={handleChange}
                          min={pickupMinDate}
                          className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Pickup Time *</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                          type="time"
                          name="pickupTime"
                          value={formData.pickupTime}
                          onChange={handleChange}
                          min={pickupMinTime}
                          className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Expiry Date *</label>
                      <div className="relative">
                        <AlertCircle className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          min={expiryMinDate}
                          className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Expiry Time *</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                          type="time"
                          name="expiryTime"
                          value={formData.expiryTime}
                          onChange={handleChange}
                          min={expiryMinTime}
                          className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-5 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold text-yellow-800 mb-1">Important Note</p>
                      <p className="text-yellow-700 font-medium">
                        Please ensure the food is safe for consumption and the expiry information is accurate.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Food Details
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Title:</strong> {formData.title}</p>
                        <p><strong>Description:</strong> {formData.description || 'N/A'}</p>
                        <p><strong>Quantity:</strong> {formData.quantity}</p>
                        {uploadedUrls.length > 0 && (
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {uploadedUrls.map((u, i) => (
                              <img key={i} src={u} alt="uploaded" className="w-full h-20 object-cover rounded" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Pickup Information
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Location:</strong> {formData.lat && formData.lng ? `${parseFloat(formData.lat).toFixed(4)}, ${parseFloat(formData.lng).toFixed(4)}` : 'Not selected'}</p>
                        <p><strong>Pickup:</strong> {formData.pickupDate} at {formData.pickupTime}</p>
                        <p><strong>Expiry:</strong> {formData.expiryDate} at {formData.expiryTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-800 mb-1">Ready to Post?</p>
                      <p className="text-green-700">
                        Once you submit, NGOs in your area will be notified and can claim your donation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-10">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center px-8 py-4 rounded-xl font-bold transition-all duration-300 text-lg ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 border-2 border-gray-200 text-gray-700 hover:bg-gray-200 hover:shadow-lg hover:scale-105'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg"
                  >
                    Next
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    className={`flex items-center px-8 py-4 rounded-xl font-bold transition-all duration-300 text-lg ${
                      loading 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-2xl hover:scale-105'
                    }`}
                    onClick={() => setShowConfirm(true)}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Post Donation
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Error and Success Messages */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}
              {message && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-medium">{message}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Post</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to post this donation?</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                onClick={(e) => { setShowConfirm(false); handleSubmit(e); }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSuccess={() => {
          // Reload user data
          const userData = localStorage.getItem('user');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }}
      />
    </>
  );
};

export default PostDonationPage;
