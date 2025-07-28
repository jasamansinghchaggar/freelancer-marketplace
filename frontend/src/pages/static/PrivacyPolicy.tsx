import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="h-[60vh] container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
        <p>
          This is the Privacy Policy page. Here you can find information about how we handle user data and protect your privacy.
        </p>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
