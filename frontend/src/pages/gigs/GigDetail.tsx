import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gigsAPI, purchaseAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
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
  const [hasPurchased, setHasPurchased] = useState(false);
  const [clients, setClients] = useState<{ name: string; email: string }[]>([]);
  useEffect(() => {
    if (user?.role === 'freelancer' && gig) {
      purchaseAPI.getFreelancerPurchases()
        .then(res => {
          if (Array.isArray(res.data)) {
            const filtered = res.data.filter((p: any) => {
              if (typeof p.gigId === 'string') {
                return p.gigId === gig._id;
              } else if (typeof p.gigId === 'object' && p.gigId?._id) {
                return p.gigId._id === gig._id;
              }
              return false;
            });
            setClients(filtered.map((p: any) => {
              if (typeof p.clientId === 'object') {
                return { name: p.clientId.name, email: p.clientId.email };
              }
              return { name: 'Unknown', email: '' };
            }));
          }
        })
        .catch(err => console.error('Failed to fetch sales:', err));
    }
  }, [user, gig]);

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

  useEffect(() => {
    if (gig && user) {
      purchaseAPI.getClientPurchases()
        .then(res => {
          const purchased = Array.isArray(res.data) && res.data.some((p: any) => {
            if (typeof p.gigId === 'string') {
              return p.gigId === gig._id;
            } else if (typeof p.gigId === 'object' && p.gigId?._id) {
              return p.gigId._id === gig._id;
            }
            return false;
          });
          setHasPurchased(purchased);
        })
        .catch(err => console.error('Failed to fetch purchases:', err));
    }
  }, [gig, user]);

  const handleBack = () => {
    navigate('/gigs');
  };

  const handleContact = () => {
    // TODO: Implement messaging/contact functionality
  };

  const handlepurchase = async () => {
    if (!gig) return;
    const confirmPurchase = confirm('Do you want to purchase this gig?');
    if (!confirmPurchase) return;
    try {
      await purchaseAPI.purchaseGig(gig._id);
      navigate('/purchased-gigs');
    } catch (err) {
      console.error('Purchase failed:', err);
      alert('Purchase failed. Please try again later.');
    }
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
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this gig?')) {
      try {
        await gigsAPI.deleteGig(gig._id);
        navigate('/my-gigs');
      } catch (error) {
        console.error('Failed to delete gig:', error);
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-full">
        {/* Back button */}
        <Button
          onClick={handleBack}
          variant="secondary"
          className="mb-6"
        >
          <RiArrowLeftLine className="w-4 h-4 mr-2" />
          Back to Gigs
        </Button>

        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  {(
                    typeof gig.category === 'string'
                      ? gig.category
                      : (gig.category as any)?.name
                  ) ?? 'Uncategorized'}
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
          <div className="lg:col-span-1 w-full">
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
                    {(gig.userId?.name?.charAt(0).toUpperCase()) ?? '?'}
                  </div>
                  <div className='pl-2'>
                    <p className="font-medium">{gig.userId?.name ?? 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{gig.userId?.email ?? ''}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons and sales info */}
              <div className="space-y-3 flex flex-col">
                {!isOwner ? (
                  <>
                    {!hasPurchased && (
                      <Button
                        onClick={handlepurchase}
                        className="w-full"
                        size="lg"
                      >
                        Purchase Gig
                      </Button>
                    )}
                    {hasPurchased && (
                      <Button disabled className="w-full" size="lg">
                        Already Purchased
                      </Button>
                    )}
                    <Button
                      onClick={handleContact}
                      className="w-full"
                      size="lg"
                      variant="outline"
                    >
                      Contact Freelancer
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-sm text-muted-foreground">This is your gig</p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/gigs/${gig._id}/edit`)}
                    >
                      Edit Gig
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleDelete}
                    >
                      Delete Gig
                    </Button>
                    {/* Show clients who purchased this gig */}
                    {clients.length > 0 && (
                      <div className="mt-4 text-left">
                        <h4 className="font-semibold mb-2">Clients who purchased this gig:</h4>
                        <ul className="text-sm space-y-1">
                          {clients.map((c, idx) => (
                            <li key={idx} className="border-b last:border-b-0 pb-1">
                              <span className="font-medium">{c.name}</span>
                              {c.email && <span className="text-muted-foreground ml-2">({c.email})</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
