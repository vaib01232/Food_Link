import React, { useState } from 'react';
import LandingPage from './components/LandingPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import LoginPage from './components/LoginPage.jsx';
import PostDonationPage from './components/PostDonation.jsx';
import GetDonationsPage from './components/GetDonation.jsx';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [userRole, setUserRole] = useState('');
  const [donations, setDonations] = useState([
    {
      id: 1,
      donorName: 'Fresh Harvest Restaurant',
      title: 'Fresh Vegetables & Salads',
      quantity: '20 kg',
      address: '123 Main St, Downtown',
      pickupDate: '2025-10-05',
      pickupTime: '18:00',
      expiryDate: '2025-10-05',
      claimed: false
    },
    {
      id: 2,
      donorName: 'Sweet Bakery',
      title: 'Bread & Pastries',
      quantity: '50 items',
      address: '456 Baker Ave, City Center',
      pickupDate: '2025-10-05',
      pickupTime: '20:00',
      expiryDate: '2025-10-06',
      claimed: false
    },
    {
      id: 3,
      donorName: 'Grand Hotel',
      title: 'Cooked Meals',
      quantity: '100 servings',
      address: '789 Hotel Blvd, East Side',
      pickupDate: '2025-10-05',
      pickupTime: '21:00',
      expiryDate: '2025-10-06',
      claimed: false
    }
  ]);

  const handleClaimDonation = (id) => {
    setDonations(donations.map(d => d.id === id ? { ...d, claimed: true } : d));
  };

  const handlePostDonation = (e) => {
    e.preventDefault();
    alert('Donation posted successfully! NGOs will be notified.');
    setCurrentPage('landing');
  };

  return (
    <div>
      {currentPage === 'landing' && (
        <LandingPage 
          setCurrentPage={setCurrentPage} 
          setUserRole={setUserRole} 
        />
      )}
      {currentPage === 'register' && (
        <RegisterPage 
          setCurrentPage={setCurrentPage} 
          userRole={userRole}
          setUserRole={setUserRole}
        />
      )}
      {currentPage === 'login' && (
        <LoginPage 
          setCurrentPage={setCurrentPage} 
          setUserRole={setUserRole}
        />
      )}
      {currentPage === 'postDonation' && (
        <PostDonationPage 
          setCurrentPage={setCurrentPage} 
          handlePostDonation={handlePostDonation}
        />
      )}
      {currentPage === 'getDonations' && (
        <GetDonationsPage 
          setCurrentPage={setCurrentPage} 
          donations={donations}
          handleClaimDonation={handleClaimDonation}
        />
      )}
    </div>
  );
};

export default App;