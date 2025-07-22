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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
          {Array(4).fill(0).map((_, idx) => (
            <Skeleton key={idx} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Purchased Gigs</h1>
        {purchases.length === 0 ? (
          <p>You haven't purchased any gigs yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {purchases.map(purchase => (
              <div
                key={purchase._id}
                className="bg-card rounded-lg shadow hover:shadow-md cursor-pointer transition-all"
                onClick={() => navigate(`/gigs/${purchase.gigId._id}`)}
              >
                <img src={purchase.gigId.imageURL} alt={purchase.gigId.title} className="w-full h-40 object-cover rounded-t-lg" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold truncate">{purchase.gigId.title}</h3>
                  <p className="text-sm text-muted-foreground">₹{purchase.gigId.price}</p>
                  <p className="text-xs text-muted-foreground">By {purchase.gigId.userId.name.split(' ')[0]}</p>
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
