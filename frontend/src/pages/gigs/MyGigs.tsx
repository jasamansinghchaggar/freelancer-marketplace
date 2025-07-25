import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gigsAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Gig {
    _id: string;
    title: string;
    desc: string;
    price: number;
    category: string;
    imageURL: string;
    userId: { _id: string; name: string };
}

const MyGigs: React.FC = () => {
    const { user } = useAuth();
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchMyGigs = async () => {
        try {
            const res = await gigsAPI.getGigs();
            const userGigs = res.data.filter((gig: any) => gig.userId._id === user?.id);
            setGigs(userGigs);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchMyGigs();
    }, [user]);

    if (loading) {
        return (
            <Layout>
                <div className="space-y-4 sm:space-y-6">
                    <Skeleton className="h-6 sm:h-8 w-32 sm:w-40" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {Array(8).fill(0).map((_, idx) => (
                            <Skeleton key={idx} className="h-48 sm:h-52 w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            </Layout>
        );
    }

    const handleGigClick = (gigId: string) => {
        navigate(`/gigs/${gigId}`);
    };

    return (
        <Layout>
            <div className="space-y-4 sm:space-y-6">
                <div className='flex justify-between items-center'>
                    <h1 className="text-xl sm:text-2xl font-semibold">My Gigs</h1>
                    <Button
                        onClick={() => navigate('/gigs/new')}
                        className="text-sm sm:text-base"
                        size="sm"
                    >
                        Create New Gig
                    </Button>
                </div>

                {gigs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="max-w-md mx-auto">
                            <h3 className="text-lg font-medium text-foreground mb-2">No gigs found</h3>
                            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                                You haven't created any gigs yet. Create your first gig to start earning!
                            </p>
                            <Button
                                variant="default"
                                onClick={() => navigate('/gigs/new')}
                                className="text-sm sm:text-base"
                            >
                                Create Your First Gig
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {gigs.map(gig => (
                            <div
                                key={gig._id}
                                className="bg-card rounded-lg shadow hover:shadow-md transform hover:scale-101 overflow-hidden border cursor-pointer transition-all duration-200"
                                onClick={() => handleGigClick(gig._id)}
                            >
                                <img
                                    src={gig.imageURL}
                                    alt={gig.title}
                                    className="w-full h-32 sm:h-40 object-cover"
                                />
                                <div className="p-3 sm:p-4">
                                    <h3 className="text-base sm:text-lg font-semibold truncate">{gig.title}</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                        {typeof gig.category === 'string'
                                            ? gig.category
                                            : (gig.category as any)?.name ?? 'Uncategorized'
                                        }
                                    </p>
                                    <div className="mt-2 flex justify-between items-center">
                                        <span className="text-sm sm:text-base font-medium">₹{gig.price}</span>
                                        <span className="text-xs text-muted-foreground">
                                            By {gig.userId?.name?.split(' ')[0] ?? 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyGigs;
