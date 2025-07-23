import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { gigsAPI, purchaseAPI } from '@/services/api';
import Layout from '@/components/Layout';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { predefinedCategories } from '@/common/predefinedCategories';
import { PlusCircle, Search, MessageCircle, TrendingUp, Users, Award, Star, ArrowRight } from 'lucide-react';


const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredGigs, setFeaturedGigs] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [randomCategories, setRandomCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Shuffle and get 10 random categories (duplicate for infinite loop)
        const shuffledCategories = [...predefinedCategories]
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
        
        // Create infinite loop by duplicating categories
        const infiniteCategories = [...shuffledCategories, ...shuffledCategories, ...shuffledCategories];
        setRandomCategories(infiniteCategories);

        // Fetch featured gigs (limit to 4)
        const gigsResponse = await gigsAPI.getGigs();
        setFeaturedGigs(gigsResponse.data.slice(0, 4));

        // Fetch user-specific data based on role
        if (user?.role === 'client') {
          const purchases = await purchaseAPI.getClientPurchases();
          setRecentActivity(purchases.data.slice(0, 5));
          setUserStats({
            totalPurchases: purchases.data.length,
            totalSpent: purchases.data.reduce((sum: number, p: any) => sum + p.gigId.price, 0)
          });
        } else if (user?.role === 'freelancer') {
          const sales = await purchaseAPI.getFreelancerPurchases();
          setRecentActivity(sales.data.slice(0, 5));
          setUserStats({
            totalSales: sales.data.length,
            totalEarned: sales.data.reduce((sum: number, s: any) => sum + s.gigId.price, 0)
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const getQuickActions = () => {
    const baseActions = [
      { icon: Search, label: 'Browse Gigs', onClick: () => navigate('/gigs'), color: 'bg-blue-500' },
      { icon: MessageCircle, label: 'Messages', onClick: () => navigate('/messages'), color: 'bg-green-500' },
    ];

    if (user?.role === 'freelancer') {
      return [
        { icon: PlusCircle, label: 'Create Gig', onClick: () => navigate('/gigs/create'), color: 'bg-purple-500' },
        ...baseActions,
        { icon: TrendingUp, label: 'My Sales', onClick: () => navigate('/sales'), color: 'bg-orange-500' },
      ];
    } else {
      return [
        ...baseActions,
        { icon: Award, label: 'My Purchases', onClick: () => navigate('/purchases'), color: 'bg-indigo-500' },
      ];
    }
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
      <div className='w-full space-y-8'>
        {/* Hero Section with Personalized Greeting */}
        <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 rounded-lg p-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
            <p className="text-lg text-muted-foreground mb-6">
              {user.role === 'freelancer'
                ? "Ready to showcase your skills and grow your business?"
                : "Find the perfect freelancer for your next project"}
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {getQuickActions().map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  className="h-20 flex-col gap-2 text-background hover:scale-105 transition-transform"
                  style={{ backgroundColor: action.color }}
                >
                  <action.icon size={24} />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats and Recent Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Stats */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Your Stats
            </h2>
            {loading ? (
              <div className="space-y-3">
                {Array(2).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {user.role === 'freelancer' ? (
                  <>
                    <div className="flex justify-between items-center p-3 bg-accent rounded-sm">
                      <span className="text-muted-foreground">Total Sales</span>
                      <span className="font-semibold text-lg text-green-500">{userStats.totalSales || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-accent rounded-sm">
                      <span className="text-muted-foreground">Total Earned</span>
                      <span className="font-semibold text-lg text-green-500">₹{userStats.totalEarned || 0}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center p-3 bg-accent rounded-sm">
                      <span className="text-muted-foreground">Total Purchases</span>
                      <span className="font-semibold text-lg text-green-500">{userStats.totalPurchases || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-accent rounded-sm">
                      <span className="text-muted-foreground">Total Spent</span>
                      <span className="font-semibold text-lg text-green-500">₹{userStats.totalSpent || 0}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageCircle size={20} />
              Recent Activity
            </h2>
            {loading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-accent rounded-sm">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {user.role === 'freelancer' ? 'Sale: ' : 'Purchase: '}
                        {activity.gigId?.title || 'Gig'}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <span className='text-base'>₹</span>{activity.gigId.price} • {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">
                  {user.role === 'freelancer'
                    ? "Start by creating your first gig!"
                    : "Browse gigs to get started!"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Categories Carousel */}
        <div className="bg-card rounded-lg p-6 border overflow-hidden relative">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Search size={20} />
            Explore Categories
          </h2>
          <div className="relative">
            <Carousel 
              className="mx-auto max-w-5xl"
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className='gap-4 pl-3'>
                {randomCategories.map((category, index) => (
                  <CarouselItem
                    key={`${category.value}-${index}`}
                    className="cursor-pointer md:basis-1/3 lg:basis-1/4"
                    onClick={() => navigate(`/gigs?category=${category.value}`)}
                  >
                    <div className="p-4 flex flex-col items-center justify-center h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg shadow hover:shadow-md hover:scale-103 transition-all duration-200 border">
                      <span className="font-semibold text-center mb-2">{category.label}</span>
                      <p className="text-xs text-muted-foreground text-center">
                        Explore {category.label.toLowerCase()} services
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className='z-11' />
              <CarouselNext className='z-11' />
            </Carousel>

            {/* Left gradient overlay */}
            <div className="absolute left-0 top-0 w-120 h-full bg-gradient-to-r from-card to-transparent pointer-events-none z-10"></div>

            {/* Right gradient overlay */}
            <div className="absolute right-0 top-0 w-120 h-full bg-gradient-to-l from-card to-transparent pointer-events-none z-10"></div>
          </div>
        </div>

        {/* Featured Gigs Section */}
        <div className="bg-card rounded-lg p-6 border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Star size={20} />
              Featured Gigs
            </h2>
            <Button variant="outline" onClick={() => navigate('/gigs')} className="flex items-center gap-2">
              View All <ArrowRight size={16} />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, idx) => (
                <Skeleton key={idx} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredGigs.map(gig => (
                <div
                  key={gig._id}
                  className="bg-background rounded-lg shadow hover:shadow-md transform hover:scale-101 overflow-hidden border cursor-pointer transition-all duration-200"
                  onClick={() => navigate(`/gigs/${gig._id}`)}
                >
                  <img src={gig.imageURL} alt={gig.title} className="w-full h-32 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold truncate text-sm">{gig.title}</h3>
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {(typeof gig.category === 'string'
                        ? gig.category
                        : (gig.category as any)?.name) ?? 'Uncategorized'}
                    </p>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-primary">₹{gig.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-6 text-center border">
            <Users size={48} className="mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2">10,000+</h3>
            <p className="text-muted-foreground">Active Freelancers</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-6 text-center border">
            <Award size={48} className="mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">50,000+</h3>
            <p className="text-muted-foreground">Projects Completed</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-6 text-center border">
            <Star size={48} className="mx-auto mb-4 text-purple-500" />
            <h3 className="text-lg font-semibold mb-2">4.9/5</h3>
            <p className="text-muted-foreground">Average Rating</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
