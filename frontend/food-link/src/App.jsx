import React, { useState } from 'react';
import LandingPage from './components/LandingPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import LoginPage from './components/LoginPage.jsx';
import PostDonationPage from './components/PostDonation.jsx';
import GetDonationsPage from './components/GetDonation.jsx';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [userRole, setUserRole] = useState('');

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
        />
      )}
      {currentPage === 'getDonations' && (
        <GetDonationsPage 
          setCurrentPage={setCurrentPage} 
        />
      )}
    </div>
  );
};

export default App;