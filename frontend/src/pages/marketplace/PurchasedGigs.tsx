import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { purchaseAPI } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

interface Purchase {
  _id: string;
  gigId: {
    _id: string;
    title: string;
    imageURL: string;
    price: number;
    userId: { name: string };
  };
  createdAt: string;
}

const PurchasedGigs: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    purchaseAPI.getClientPurchases()
      .then(res => setPurchases(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4 sm:space-y-6">
          <Skeleton className="h-6 sm:h-8 w-40 sm:w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array(4).fill(0).map((_, idx) => (
              <Skeleton key={idx} className="h-48 sm:h-52 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Purchased Gigs</h1>
        {purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 min-h-[60vh] text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-foreground mb-2">No purchases yet</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                You haven't purchased any gigs yet. Browse our marketplace to find amazing services!
              </p>
              <button
                onClick={() => navigate('/gigs')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm sm:text-base"
              >
                Browse Gigs
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {purchases.map(purchase => (
              <div
                key={purchase._id}
                className="bg-card rounded-lg shadow hover:shadow-md cursor-pointer transition-all border"
                onClick={() => navigate(`/gigs/${purchase.gigId._id}`)}
              >
                <img 
                  src={purchase.gigId.imageURL} 
                  alt={purchase.gigId.title} 
                  className="w-full h-32 sm:h-40 object-cover rounded-t-lg" 
                />
                <div className="p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold truncate">{purchase.gigId.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">₹{purchase.gigId.price}</p>
                  <p className="text-xs text-muted-foreground">By {purchase.gigId.userId.name.split(' ')[0]}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Purchased on {new Date(purchase.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PurchasedGigs;
