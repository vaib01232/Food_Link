import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import LandingPage from './components/LandingPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import LoginPage from './components/LoginPage.jsx';
import EmailVerificationPage from './components/EmailVerificationPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import PostDonationPage from './components/PostDonation.jsx';
import GetDonationsPage from './components/GetDonation.jsx';
import DonationDetails from './components/DonationDetails.jsx';
import AuthenticatedLayout from './components/AuthenticatedLayout.jsx';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Check for existing session on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Set axios default header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Update currentPage based on route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setCurrentPage('landing');
    } else if (path === '/register') {
      setCurrentPage('register');
    } else if (path === '/login') {
      setCurrentPage('login');
    } else if (path === '/dashboard') {
      setCurrentPage('dashboard');
    } else if (path === '/postDonation') {
      setCurrentPage('postDonation');
    } else if (path === '/getDonations') {
      setCurrentPage('getDonations');
    } else if (path.startsWith('/donation/')) {
      setCurrentPage('donationDetails');
    }
  }, [location]);

  // Show loading spinner while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            <LandingPage />
          } 
        />
        <Route 
          path="/register" 
          element={
            <RegisterPage />
          } 
        />
        <Route 
          path="/login" 
          element={
            <LoginPage 
              setUser={setUser}
            />
          } 
        />
        <Route 
          path="/verify-email" 
          element={
            <EmailVerificationPage 
              setUser={setUser}
            />
          } 
        />
        
        {/* Donation Details - Accessible to all (with or without auth) */}
        <Route 
          path="/donation/:id" 
          element={
            user ? (
              <AuthenticatedLayout 
                user={user} 
                setUser={setUser}
                currentPage={currentPage}
              >
                <DonationDetails 
                  user={user}
                />
              </AuthenticatedLayout>
            ) : (
              <DonationDetails user={user} />
            )
          } 
        />
        
        {/* Authenticated Routes */}
        {user && (
          <>
            <Route 
              path="/dashboard" 
              element={
                <AuthenticatedLayout 
                  user={user} 
                  setUser={setUser}
                  currentPage={currentPage}
                >
                  <Dashboard 
                    user={user}
                  />
                </AuthenticatedLayout>
              } 
            />
            <Route 
              path="/postDonation" 
              element={
                <AuthenticatedLayout 
                  user={user} 
                  setUser={setUser}
                  currentPage={currentPage}
                >
                  <PostDonationPage />
                </AuthenticatedLayout>
              } 
            />
            <Route 
              path="/getDonations" 
              element={
                <AuthenticatedLayout 
                  user={user} 
                  setUser={setUser}
                  currentPage={currentPage}
                >
                  <GetDonationsPage 
                    user={user}
                  />
                </AuthenticatedLayout>
              } 
            />
          </>
        )}
      </Routes>
    </div>
  );
};

export default App;