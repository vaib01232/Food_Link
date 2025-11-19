import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Clock, CheckCircle, Upload, ArrowRight, Sparkles, TrendingUp, Utensils, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showContactModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showContactModal]);
  
  const handleGetStarted = (role) => {
    navigate('/register', { state: { role } });
  };

  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setContactForm({ name: '', email: '', message: '' });
        setShowContactModal(false);
      } else {
        toast.error(data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50 overflow-hidden">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes scrollIndicator {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.5; }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out forwards;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 4s ease-in-out infinite;
        }
        
        .animate-scroll-indicator {
          animation: scrollIndicator 2s ease-in-out infinite;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .hero-glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        
        .hero-btn-primary {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .hero-btn-primary:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 100%);
          box-shadow: 0 8px 30px rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }
        
        .hero-btn-secondary {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hero-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 30px rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
        
        .hero-image-overlay {
          background: linear-gradient(
            135deg,
            rgba(5, 150, 105, 0.88) 0%,
            rgba(16, 185, 129, 0.85) 25%,
            rgba(16, 120, 90, 0.87) 50%,
            rgba(180, 83, 9, 0.82) 75%,
            rgba(146, 64, 14, 0.85) 100%
          );
        }
        
        @media (max-width: 768px) {
          .hero-image-overlay {
            background: linear-gradient(
              135deg,
              rgba(5, 150, 105, 0.92) 0%,
              rgba(16, 185, 129, 0.90) 50%,
              rgba(146, 64, 14, 0.90) 100%
            );
          }
        }
      `}</style>

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'glass-effect shadow-lg py-3' : 'bg-white/80 backdrop-blur-sm shadow-sm py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
            <Heart className="w-9 h-9 text-green-600 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-2xl font-bold gradient-text">Food Link</span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => handleNavigation('login')}
              className="text-green-700 hover:text-green-900 font-semibold px-4 py-2 rounded-lg hover:bg-green-50 transition-all duration-300"
            >
              Login
            </button>
            <button 
              onClick={() => handleNavigation('register')}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold flex items-center space-x-2"
            >
              <span>Sign Up</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Full-screen responsive background image */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source 
              media="(max-width: 640px)" 
              srcSet="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=1200&fit=crop&q=80" 
            />
            <source 
              media="(max-width: 1024px)" 
              srcSet="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&h=1000&fit=crop&q=80" 
            />
            <img 
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&h=1080&fit=crop&q=85" 
              alt="Food donation community" 
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          </picture>
          {/* Sophisticated gradient overlay */}
          <div className="absolute inset-0 hero-image-overlay"></div>
        </div>
        
        {/* Subtle floating decorative elements */}
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-yellow-300/8 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-32 left-1/4 w-96 h-96 bg-green-300/8 rounded-full blur-3xl animate-pulse-slow"></div>
        
        {/* Hero content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-16 sm:pt-24 sm:pb-20 md:pt-32 md:pb-24">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 hero-glass px-5 py-2.5 rounded-full mb-6 sm:mb-8 animate-fadeInUp border border-white/20 shadow-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
              <span className="text-white font-semibold text-sm sm:text-base tracking-wide">Making a Real Impact</span>
            </div>
            
            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-4 animate-fadeInUp delay-100">
              Connect Surplus Food
              <br className="hidden sm:block" />
              <span className="sm:inline"> </span>
              <span className="text-white inline-block mt-2 sm:mt-0">
                with Those Who Need It
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4 animate-fadeInUp delay-200 font-light">
              Food Link bridges the gap between food donors and NGOs in real-time, reducing waste and fighting hunger in your community.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 px-4 animate-fadeInUp delay-300 mb-12 sm:mb-16">
              <button 
                onClick={() => handleGetStarted('donor')}
                className="hero-btn-primary text-green-900 px-8 sm:px-10 py-4 sm:py-4.5 rounded-2xl text-base sm:text-lg font-bold flex items-center space-x-2 group w-full sm:w-auto justify-center"
                aria-label="Start donating food"
              >
                <span>Donate Food</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button 
                onClick={() => handleGetStarted('ngo')}
                className="hero-btn-secondary text-white px-8 sm:px-10 py-4 sm:py-4.5 rounded-2xl text-base sm:text-lg font-bold flex items-center space-x-2 group w-full sm:w-auto justify-center"
                aria-label="Claim food as an NGO"
              >
                <span>Claim Food</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
            
            {/* Scroll indicator */}
            <div className="hidden md:flex mt-16 lg:mt-20 animate-fadeIn delay-500">
              <div className="flex flex-col items-center text-white/60 mx-auto">
                <span className="text-xs sm:text-sm mb-2 tracking-wider uppercase font-medium">Scroll to explore</span>
                <div className="w-6 h-10 border-2 border-white/25 rounded-full flex justify-center pt-2">
                  <div className="w-1 h-3 bg-white/40 rounded-full animate-scroll-indicator"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-white relative overflow-hidden scroll-mt-20">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-green-100 rounded-full blur-3xl opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full mb-4">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-800 font-semibold text-sm">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Three simple steps to make a difference</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-white hover-lift animate-fadeInUp delay-100 group">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-green-100 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-green-100 to-green-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto transform group-hover:rotate-6 transition-transform duration-300">
                  <Upload className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">1</div>
              <h3 className="text-2xl font-bold text-green-800 mb-3">Create Alert</h3>
              <p className="text-gray-600 leading-relaxed">Donors post available surplus food with details and pickup information in seconds.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-white hover-lift animate-fadeInUp delay-200 group">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-yellow-100 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-yellow-100 to-yellow-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto transform group-hover:rotate-6 transition-transform duration-300">
                  <Clock className="w-12 h-12 text-yellow-600" />
                </div>
              </div>
              <div className="bg-yellow-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">2</div>
              <h3 className="text-2xl font-bold text-green-800 mb-3">Real-Time Matching</h3>
              <p className="text-gray-600 leading-relaxed">NGOs see available donations instantly and can browse by location and quantity.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-white hover-lift animate-fadeInUp delay-300 group">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-green-100 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-green-100 to-green-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto transform group-hover:rotate-6 transition-transform duration-300">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">3</div>
              <h3 className="text-2xl font-bold text-green-800 mb-3">Claim & Deliver</h3>
              <p className="text-gray-600 leading-relaxed">Food is claimed quickly and delivered efficiently to those in need.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="py-24 bg-gradient-to-br from-green-50 via-yellow-50 to-green-50 relative overflow-hidden scroll-mt-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Why Food Link?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Join thousands making a difference</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="glass-effect rounded-3xl p-10 shadow-xl hover-lift animate-slideInLeft">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-green-800">For Donors</h3>
              </div>
              <ul className="space-y-5">
                <li className="flex items-start group">
                  <div className="bg-green-100 rounded-full p-1 mr-4 mt-1 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-lg leading-relaxed">Reduce food waste and make a positive environmental impact</span>
                </li>
                <li className="flex items-start group">
                  <div className="bg-green-100 rounded-full p-1 mr-4 mt-1 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-lg leading-relaxed">Simple and quick donation process in minutes</span>
                </li>
                <li className="flex items-start group">
                  <div className="bg-green-100 rounded-full p-1 mr-4 mt-1 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-lg leading-relaxed">Support your local community and build goodwill</span>
                </li>
                <li className="flex items-start group">
                  <div className="bg-green-100 rounded-full p-1 mr-4 mt-1 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-lg leading-relaxed">Track your impact and donations history</span>
                </li>
              </ul>
            </div>
            
            <div className="glass-effect rounded-3xl p-10 shadow-xl hover-lift animate-slideInRight">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-yellow-700">For NGOs</h3>
              </div>
              <ul className="space-y-5">
                <li className="flex items-start group">
                  <div className="bg-yellow-100 rounded-full p-1 mr-4 mt-1 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-gray-700 text-lg leading-relaxed">Access fresh surplus food from verified donors</span>
                </li>
                <li className="flex items-start group">
                  <div className="bg-yellow-100 rounded-full p-1 mr-4 mt-1 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-gray-700 text-lg leading-relaxed">Save time with real-time alerts and notifications</span>
                </li>
                <li className="flex items-start group">
                  <div className="bg-yellow-100 rounded-full p-1 mr-4 mt-1 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-gray-700 text-lg leading-relaxed">Feed more people with consistent food supply</span>
                </li>
                <li className="flex items-start group">
                  <div className="bg-yellow-100 rounded-full p-1 mr-4 mt-1 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-gray-700 text-lg leading-relaxed">Free platform to maximize your resources</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      
      <section className="py-24 bg-gradient-to-br from-green-600 via-green-700 to-green-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-300 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-white/20">
              <TrendingUp className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Our Growing Impact</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Making Real Change Together</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center group hover-lift animate-fadeInUp">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20 shadow-2xl">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Utensils className="w-10 h-10 text-green-800" />
                </div>
                <div className="text-6xl font-bold text-white mb-3 shimmer">500+</div>
                <div className="text-xl text-green-50">Meals Donated</div>
                <div className="text-sm text-green-200 mt-2">And counting every day</div>
              </div>
            </div>
            
            <div className="text-center group hover-lift animate-fadeInUp delay-100">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20 shadow-2xl">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-10 h-10 text-green-800" />
                </div>
                <div className="text-6xl font-bold text-white mb-3 shimmer">50+</div>
                <div className="text-xl text-green-50">Active Partners</div>
                <div className="text-sm text-green-200 mt-2">Restaurants & NGOs united</div>
              </div>
            </div>
            
            <div className="text-center group hover-lift animate-fadeInUp delay-200">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20 shadow-2xl">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-10 h-10 text-green-800" />
                </div>
                <div className="text-6xl font-bold text-white mb-3 shimmer">100%</div>
                <div className="text-xl text-green-50">Free Service</div>
                <div className="text-sm text-green-200 mt-2">Always free, always helping</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-yellow-50 to-green-50"></div>
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-green-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-yellow-300/30 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="glass-effect rounded-3xl p-12 md:p-16 shadow-2xl animate-fadeInUp">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-yellow-100 px-6 py-3 rounded-full mb-8 border border-green-200">
              <Sparkles className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-semibold">Join Our Mission</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gray-900">Ready to Make a</span>
              <br />
              <span className="gradient-text">Difference?</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of donors and NGOs working together to eliminate food waste and feed those in need.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => navigate('/register')}
                className="group bg-gradient-to-r from-green-600 to-green-700 text-white px-10 py-5 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Get Started Today</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <button 
                onClick={() => navigate('/login')}
                className="group bg-white text-green-700 px-10 py-5 rounded-2xl text-lg font-semibold border-2 border-green-200 hover:border-green-400 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Sign In
              </button>
            </div>
            
            <div className="mt-10 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Free forever</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      <footer className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-400 rounded-full blur-3xl animate-float"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2 animate-fadeInUp">
              <div className="flex items-center space-x-3 mb-6 group">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-3 group-hover:scale-110 transition-transform duration-300">
                  <Utensils className="w-8 h-8 text-green-900" />
                </div>
                <span className="text-3xl font-bold gradient-text bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">Food Link</span>
              </div>
              <p className="text-green-100 text-lg leading-relaxed mb-6 max-w-md">
                Connecting surplus food with those who need it most. Together, we're building a world without food waste.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="bg-white/10 backdrop-blur-sm p-3 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110 border border-white/20">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="bg-white/10 backdrop-blur-sm p-3 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110 border border-white/20">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="bg-white/10 backdrop-blur-sm p-3 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110 border border-white/20">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342V9.658z"/></svg>
                </a>
              </div>
            </div>
            
            <div className="animate-fadeInUp delay-100">
              <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-green-100 hover:text-yellow-300 transition-colors duration-300 flex items-center space-x-2 group cursor-pointer">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    <span>How It Works</span>
                  </a>
                </li>
                <li>
                  <a href="#benefits" onClick={(e) => { e.preventDefault(); document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-green-100 hover:text-yellow-300 transition-colors duration-300 flex items-center space-x-2 group cursor-pointer">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    <span>Benefits</span>
                  </a>
                </li>
                <li>
                  <button onClick={() => setShowContactModal(true)} className="text-green-100 hover:text-yellow-300 transition-colors duration-300 flex items-center space-x-2 group cursor-pointer w-full text-left">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    <span>Contact Us</span>
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="animate-fadeInUp delay-200">
              <h3 className="text-xl font-bold mb-6 text-white">Get Started</h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => navigate('/register')}
                    className="text-green-100 hover:text-yellow-300 transition-colors duration-300 flex items-center space-x-2 group"
                  >
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    <span>Sign Up</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/login')}
                    className="text-green-100 hover:text-yellow-300 transition-colors duration-300 flex items-center space-x-2 group"
                  >
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    <span>Sign In</span>
                  </button>
                </li>
                <li>
                  <a href="#faq" className="text-green-100 hover:text-yellow-300 transition-colors duration-300 flex items-center space-x-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    <span>FAQ</span>
                  </a>
                </li>
                <li>
                  <a href="#support" className="text-green-100 hover:text-yellow-300 transition-colors duration-300 flex items-center space-x-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    <span>Support</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-green-700/50 pt-8 animate-fadeInUp delay-300">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-green-100 text-center md:text-left">
                © {new Date().getFullYear()} Food Link. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="#privacy" className="text-green-100 hover:text-yellow-300 transition-colors duration-300">
                  Privacy Policy
                </a>
                <a href="#terms" className="text-green-100 hover:text-yellow-300 transition-colors duration-300">
                  Terms of Service
                </a>
                <a href="#cookies" className="text-green-100 hover:text-yellow-300 transition-colors duration-300">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowContactModal(false)}
          ></div>
          
          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fadeInUp">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 rounded-t-3xl flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Contact Us</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-gray-600 mb-6">
                We'd love to hear from you! Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors duration-300"
                    required
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors duration-300"
                    required
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Tell us what's on your mind..."
                    rows="5"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors duration-300 resize-none"
                    required
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;