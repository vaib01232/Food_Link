import React from 'react';
import Navbar from './Navbar';

const AuthenticatedLayout = ({ children, user, setUser, currentPage }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar 
          user={user} 
          setUser={setUser} 
          currentPage={currentPage}
        />
      </div>
      
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
};

export default AuthenticatedLayout;

