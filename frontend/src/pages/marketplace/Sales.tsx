import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { purchaseAPI } from '@/services/api';
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
      .then(res => {
        // Filter out sales with null or undefined gigId
        const validSales = res.data.filter((sale: any) => 
          sale.gigId && 
          sale.gigId._id && 
          sale.gigId.title && 
          sale.gigId.imageURL
        );
        setSales(validSales);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  console.log(sales);
  

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4 sm:space-y-6">
          <Skeleton className="h-6 sm:h-8 w-24 sm:w-32" />
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
        <h1 className="text-xl sm:text-2xl font-semibold">Sales</h1>
        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 min-h-[60vh] text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-foreground mb-2">No sales yet</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                You haven't made any sales yet. Create compelling gigs to attract clients!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {sales.map(sale => {
              // Additional safety check in case filtering missed something
              if (!sale.gigId || !sale.gigId._id) {
                return null;
              }
              
              return (
                <div
                  key={sale._id}
                  className="bg-card rounded-lg shadow hover:shadow-md cursor-pointer transition-all border"
                  onClick={() => navigate(`/gigs/${sale.gigId._id}`)}
                >
                  <img 
                    src={sale.gigId.imageURL || '/placeholder-image.jpg'} 
                    alt={sale.gigId.title || 'Deleted Gig'} 
                    className="w-full h-32 sm:h-40 object-cover rounded-t-lg" 
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                  <div className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold truncate">
                      {sale.gigId.title || 'Deleted Gig'}
                    </h3>
                    <p className="text-sm sm:text-base text-green-600 font-medium">
                      ₹{sale.gigId.price || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Purchased by {sale.clientId?.name?.split(' ')[0] || 'Unknown Client'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sold on {new Date(sale.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Sales;
