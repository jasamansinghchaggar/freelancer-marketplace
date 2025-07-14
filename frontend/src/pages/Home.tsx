import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <p className="text-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow max-w-5xl mx-auto p-8">
        {user.role === 'client' ? (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-card rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Post a New Gig</h2>
              <Button onClick={() => navigate('/gigs/new')}>Create Gig</Button>
            </div>
            <div className="p-6 bg-card rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">My Gigs</h2>
              <Button variant="outline" onClick={() => navigate('/gigs')}>View Gigs</Button>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-card rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Browse Gigs</h2>
              <Button onClick={() => navigate('/gigs')}>Browse All Gigs</Button>
            </div>
            <div className="p-6 bg-card rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">My Proposals</h2>
              <Button variant="outline" onClick={() => navigate('/proposals')}>View Proposals</Button>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
