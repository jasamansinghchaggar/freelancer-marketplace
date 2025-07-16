import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gigsAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Layout from '@/components/Layout';
import { useAuth } from '../context/AuthContext';
import { RiArrowLeftLine, RiCalendarLine } from '@remixicon/react';

interface Gig {
  _id: string;
  title: string;
  desc: string;
  category: string;
  price: number;
  imageURL: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const GigDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Gig ID not found');
      setLoading(false);
      return;
    }

    gigsAPI.getGig(id)
      .then(res => {
        setGig(res.data);
        setError(null);
      })
      .catch(err => {
        console.error('Error fetching gig:', err);
        setError('Failed to load gig details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleBack = () => {
    navigate('/gigs');
  };

  const handleContact = () => {
    // TODO: Implement messaging/contact functionality
    console.log('Contact freelancer:', gig?.userId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full mb-6 rounded-lg" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-6" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !gig) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Gig Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'The requested gig could not be found.'}</p>
          <Button onClick={handleBack} variant="outline">
            <RiArrowLeftLine className="w-4 h-4 mr-2" />
            Back to Gigs
          </Button>
        </div>
      </Layout>
    );
  }

  const isOwner = user?.id === gig.userId._id;

  return (
    <Layout>
      <div className="max-w-4xl">
        {/* Back button */}
        <Button 
          onClick={handleBack} 
          variant="ghost" 
          className="mb-6"
        >
          <RiArrowLeftLine className="w-4 h-4 mr-2" />
          Back to Gigs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 pt-3">
            <div className="mb-6">
              <img 
                src={gig.imageURL} 
                alt={gig.title}
                className="w-full object-fit rounded-lg border"
              />
            </div>

            {/* Gig details */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{gig.title}</h1>
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <span className="bg-secondary px-2 py-1 rounded text-xs font-medium mr-3">
                  {gig.category}
                </span>
                <div className="flex items-center">
                  <RiCalendarLine className="w-4 h-4 mr-1" />
                  Posted on {formatDate(gig.createdAt)}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {gig.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 w-max">
            <div className="bg-card border rounded-lg p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-center text-2xl font-bold text-primary mb-2">
                  ₹{gig.price.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Starting price</p>
              </div>

              {/* Freelancer info */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold mb-3">Freelancer</h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {gig.userId.name.charAt(0).toUpperCase()}
                  </div>
                  <div className='pl-2'>
                    <p className="font-medium">{gig.userId.name}</p>
                    <p className="text-sm text-muted-foreground">{gig.userId.email}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                {!isOwner ? (
                  <>
                    <Button 
                      onClick={handleContact}
                      className="w-full"
                      size="lg"
                    >
                      Contact Freelancer
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      size="lg"
                    >
                      Save for Later
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">This is your gig</p>
                    <Button 
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={() => navigate(`/gigs/${gig._id}/edit`)}
                    >
                      Edit Gig
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GigDetail;
