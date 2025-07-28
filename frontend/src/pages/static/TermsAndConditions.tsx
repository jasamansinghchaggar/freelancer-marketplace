import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsAndConditions: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="h-[60vh] container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Terms and Conditions</h1>
        <p>
          This is the Terms and Conditions page. Please read these terms carefully before using our services.
        </p>
      </div>
      <Footer />
    </>
  );
};

export default TermsAndConditions;
