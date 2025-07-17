import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { purchaseAPI } from '../services/api';
import { Skeleton } from '@/components/ui/skeleton';

interface Sale {
  _id: string;
  gigId: {
    _id: string;
    title: string;
    imageURL: string;
    price: number;
    userId: { name: string };
  };
  clientId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    purchaseAPI.getFreelancerPurchases()
      .then(res => setSales(res.data))
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
        <h1 className="text-2xl font-semibold mb-4">Sales</h1>
        {sales.length === 0 ? (
          <p>No sales yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sales.map(sale => (
              <div
                key={sale._id}
                className="bg-card rounded-lg shadow hover:shadow-md cursor-pointer transition-all"
                onClick={() => navigate(`/gigs/${sale.gigId._id}`)}
              >
                <img src={sale.gigId.imageURL} alt={sale.gigId.title} className="w-full h-40 object-cover rounded-t-lg" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold truncate">{sale.gigId.title}</h3>
                  <p className="text-sm text-muted-foreground">₹{sale.gigId.price}</p>
                  <p className="text-xs text-muted-foreground">Purchased by {sale.clientId.name.split(' ')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Sales;
