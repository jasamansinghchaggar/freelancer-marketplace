import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gigsAPI, purchaseAPI, chatAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { RiArrowLeftLine, RiCalendarLine } from '@remixicon/react';
import { toast } from 'sonner';

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

  const handleContact = async () => {
    if (!gig) return;
    try {
      // Start or retrieve a chat with this freelancer
      const res = await chatAPI.startChat(gig.userId._id);
      navigate(`/messages?chatId=${res.data._id}`, { state: { initialChat: res.data } });
    } catch (err) {
      console.error('Unable to start or retrieve chat:', err);
    }
  };

  const handlepurchase = async () => {
    if (!gig) return;
    const confirmPurchase = confirm('Do you want to purchase this gig?');
    if (!confirmPurchase) return;
    try {
      await purchaseAPI.purchaseGig(gig._id);
      toast.success('Gig purchased successfully!');
      navigate('/purchased-gigs');
    } catch (err: any) {
      console.error('Purchase failed:', err);
      toast.error(err.response?.data?.message || 'Purchase failed. Please try again later.');
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Skeleton className="h-6 sm:h-8 w-24 sm:w-32 mb-4 sm:mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-48 sm:h-64 w-full mb-4 sm:mb-6 rounded-lg" />
              <Skeleton className="h-6 sm:h-8 w-3/4 mb-3 sm:mb-4" />
              <Skeleton className="h-4 w-1/2 mb-4 sm:mb-6" />
              <Skeleton className="h-24 sm:h-32 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-64 sm:h-80 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !gig) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-8 sm:py-12 px-4">
          <h1 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Gig Not Found</h1>
          <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">{error || 'The requested gig could not be found.'}</p>
          <Button onClick={handleBack} variant="outline" size="sm">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <Button
          onClick={handleBack}
          variant="secondary"
          className="mb-4 sm:mb-6"
          size="sm"
        >
          <RiArrowLeftLine className="w-4 h-4 mr-2" />
          Back to Gigs
        </Button>

        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="mb-4 sm:mb-6">
              <img
                src={gig.imageURL}
                alt={gig.title}
                className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-lg border"
              />
            </div>

            {/* Gig details */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3">{gig.title}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <span className="bg-secondary px-2 py-1 rounded text-xs font-medium w-fit">
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
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Description</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                  {gig.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-card border rounded-lg p-4 sm:p-6 lg:sticky lg:top-24">
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center text-xl sm:text-2xl font-bold text-primary mb-1 sm:mb-2">
                  ₹{gig.price.toLocaleString()}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Starting price</p>
              </div>

              {/* Freelancer info */}
              <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
                <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Freelancer</h3>
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs sm:text-sm font-medium">
                    {(gig.userId?.name?.charAt(0).toUpperCase()) ?? '?'}
                  </div>
                  <div className='pl-2 sm:pl-3'>
                    <p className="font-medium text-sm sm:text-base">{gig.userId?.name ?? 'Unknown'}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-all">{gig.userId?.email ?? ''}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons and sales info */}
              <div className="space-y-2 sm:space-y-3 flex flex-col">
                {!isOwner ? (
                  <>
                    {!hasPurchased && (
                      <Button
                        onClick={handlepurchase}
                        className="w-full text-sm sm:text-base"
                        size="default"
                      >
                        Purchase Gig
                      </Button>
                    )}
                    {hasPurchased && (
                      <Button disabled className="w-full text-sm sm:text-base" size="default">
                        Already Purchased
                      </Button>
                    )}
                    <Button
                      onClick={handleContact}
                      className="w-full text-sm sm:text-base"
                      size="default"
                      variant="outline"
                    >
                      Contact Freelancer
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-2 sm:py-4 space-y-2">
                    <p className="text-xs sm:text-sm text-muted-foreground">This is your gig</p>
                    <Button
                      variant="outline"
                      className="w-full text-sm sm:text-base"
                      onClick={() => navigate(`/gigs/${gig._id}/edit`)}
                      size="sm"
                    >
                      Edit Gig
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full text-sm sm:text-base"
                      onClick={handleDelete}
                      size="sm"
                    >
                      Delete Gig
                    </Button>
                    {/* Show clients who purchased this gig */}
                    {clients.length > 0 && (
                      <div className="mt-3 sm:mt-4 text-left">
                        <h4 className="font-semibold mb-2 text-sm">Clients who purchased this gig:</h4>
                        <div className="max-h-32 overflow-y-auto">
                          <ul className="text-xs sm:text-sm space-y-1">
                            {clients.map((c, idx) => (
                              <li key={idx} className="border-b last:border-b-0 pb-1">
                                <span className="font-medium">{c.name}</span>
                                {c.email && <span className="text-muted-foreground ml-1 sm:ml-2 break-all">({c.email})</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
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
