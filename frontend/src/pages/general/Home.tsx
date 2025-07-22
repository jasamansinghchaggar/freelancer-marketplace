import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { gigsAPI } from '@/services/api';
import Layout from '@/components/Layout';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { predefinedCategories } from '@/common/predefinedCategories';


const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    gigsAPI.getGigs()
      .then(res => setGigs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);
  const pageCount = Math.ceil(gigs.length / pageSize);
  const currentGigs = gigs.slice((page - 1) * pageSize, page * pageSize);

  // Navigate to individual gig detail page
  const handleGigClick = (gigId: string) => {
    navigate(`/gigs/${gigId}`);
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <p className="text-foreground font-medium">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='w-full'>
        <h1 className="text-2xl font-semibold mb-6">Welcome, {user.name}!</h1>
        <Carousel className="pb-8 mx-auto max-w-5xl">
          <CarouselContent className='gap-4 px-10'>
            {predefinedCategories.map((category) => (
              <CarouselItem
                key={category.value}
                className="w-max p-2 flex flex-col items-center justify-between h-40 bg-red-700 rounded-lg shadow md:basis-1/7 lg:basis-1/6"
              >
                <span className="font-bold mb-2">{category.label}</span>
                <p className="text-muted-foreground bg-background rounded-sm p-2">Explore services in {category.label}.</p>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(pageSize).fill(0).map((_, idx) => (
                <Skeleton key={idx} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <div>
                <div className='min-h-[70vh] max-h-max'>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentGigs.map(gig => (
                      <div
                        key={gig._id}
                        className="bg-card rounded-lg shadow hover:shadow-md transform hover:scale-101 overflow-hidden border cursor-pointer transition-all duration-200"
                        onClick={() => handleGigClick(gig._id)}
                      >
                        <img src={gig.imageURL} alt={gig.title} className="w-full h-40 object-cover" />
                        <div className="p-4">
                          <h3 className="text-lg font-semibold truncate">{gig.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {(typeof gig.category === 'string'
                              ? gig.category
                              : (gig.category as any)?.name) ?? 'Uncategorized'}
                          </p>
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-sm font-medium">${gig.price}</span>
                            <span className="text-xs text-muted-foreground">By {gig.userId?.name ?? 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                    Previous
                  </Button>
                  {Array(pageCount).fill(0).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`px-3 py-1 rounded ${page === pageNum ? 'bg-primary text-primary-foreground' : 'bg-card'} hover:bg-primary hover:text-primary-foreground`}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage(page + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
