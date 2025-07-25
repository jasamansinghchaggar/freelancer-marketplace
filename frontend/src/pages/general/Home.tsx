import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { gigsAPI, purchaseAPI } from '@/services/api';
import Layout from '@/components/Layout';
import { PlusCircle, Search, MessageCircle, TrendingUp, Users, Award, Star, ArrowRight } from 'lucide-react';


const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredGigs, setFeaturedGigs] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const gigsResponse = await gigsAPI.getGigs();
        setFeaturedGigs(gigsResponse.data.slice(0, 4));

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
      <div className='w-full space-y-6 sm:space-y-8'>
        {/* Hero Section with Personalized Greeting */}
        <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 rounded-lg p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-4 sm:mb-6">
              {user.role === 'freelancer'
                ? "Ready to showcase your skills and grow your business?"
                : "Find the perfect freelancer for your next project"}
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              {getQuickActions().map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-background hover:scale-101 transition-transform text-xs sm:text-sm"
                  style={{ backgroundColor: action.color }}
                >
                  <action.icon className="w-[18px] h-[18px] sm:w-6 sm:h-6" />
                  <span className="font-medium text-center leading-tight">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats and Recent Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Quick Stats */}
          <div className="bg-card rounded-lg p-4 sm:p-6 border">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="sm:hidden" />
              <TrendingUp size={20} className="hidden sm:block" />
              Your Stats
            </h2>
            {loading ? (
              <div className="space-y-3">
                {Array(2).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 sm:h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {user.role === 'freelancer' ? (
                  <>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-accent rounded-sm">
                      <span className="text-muted-foreground text-sm sm:text-base">Total Sales</span>
                      <span className="font-semibold text-base sm:text-lg text-green-500">{userStats.totalSales || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-accent rounded-sm">
                      <span className="text-muted-foreground text-sm sm:text-base">Total Earned</span>
                      <span className="font-semibold text-base sm:text-lg text-green-500">₹{userStats.totalEarned || 0}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-accent rounded-sm">
                      <span className="text-muted-foreground text-sm sm:text-base">Total Purchases</span>
                      <span className="font-semibold text-base sm:text-lg text-green-500">{userStats.totalPurchases || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-accent rounded-sm">
                      <span className="text-muted-foreground text-sm sm:text-base">Total Spent</span>
                      <span className="font-semibold text-base sm:text-lg text-green-500">₹{userStats.totalSpent || 0}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-lg p-4 sm:p-6 border">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <MessageCircle size={18} className="sm:hidden" />
              <MessageCircle size={20} className="hidden sm:block" />
              Recent Activity
            </h2>
            {loading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 sm:h-12 w-full" />
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-accent rounded-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">
                        {user.role === 'freelancer' ? 'Sale: ' : 'Purchase: '}
                        {activity.gigId?.title || 'Gig'}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <span className='text-sm'>₹</span>{activity.gigId.price} • {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <MessageCircle size={36} className="mx-auto mb-3 opacity-50 sm:hidden" />
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50 hidden sm:block" />
                <p className="text-sm sm:text-base">No recent activity</p>
                <p className="text-xs sm:text-sm mt-1">
                  {user.role === 'freelancer'
                    ? "Start by creating your first gig!"
                    : "Browse gigs to get started!"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Featured Gigs Section */}
        <div className="bg-card rounded-lg p-4 sm:p-6 border">
          <div className="w-full flex justify-between items-center mb-4 sm:mb-6 gap-3">
            <h2 className="text-sm sm:text-xl font-semibold flex items-center gap-2">
              <Star size={14} className="sm:hidden" />
              <Star size={20} className="hidden md:inline-block" />
              Featured Gigs
            </h2>
            <Button
              variant="outline"
              onClick={() => navigate('/gigs')}
              className="flex items-center gap-2 w-max sm:w-auto text-sm"
              size="sm"
            >
              View All <ArrowRight size={14} />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array(4).fill(0).map((_, idx) => (
                <Skeleton key={idx} className="h-40 sm:h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredGigs.map(gig => (
                <div
                  key={gig._id}
                  className="bg-background rounded-lg shadow hover:shadow-md transform hover:scale-101 overflow-hidden border cursor-pointer transition-all duration-200"
                  onClick={() => navigate(`/gigs/${gig._id}`)}
                >
                  <img src={gig.imageURL} alt={gig.title} className="w-full h-24 sm:h-32 object-cover" />
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold truncate text-xs sm:text-sm">{gig.title}</h3>
                    <p className="text-xs text-muted-foreground truncate mb-1 sm:mb-2">
                      {(typeof gig.category === 'string'
                        ? gig.category
                        : (gig.category as any)?.name) ?? 'Uncategorized'}
                    </p>
                    <div className="flex items-center">
                      <span className="text-xs sm:text-sm font-medium text-primary">₹{gig.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-4 sm:p-6 text-center border">
            <Users size={36} className="mx-auto mb-3 text-blue-500 sm:hidden" />
            <Users size={48} className="mx-auto mb-4 text-blue-500 hidden sm:block" />
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">10,000+</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Active Freelancers</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-4 sm:p-6 text-center border">
            <Award size={36} className="mx-auto mb-3 text-green-500 sm:hidden" />
            <Award size={48} className="mx-auto mb-4 text-green-500 hidden sm:block" />
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">50,000+</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Projects Completed</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-4 sm:p-6 text-center border col-span-1 sm:col-span-1">
            <Star size={36} className="mx-auto mb-3 text-purple-500 sm:hidden" />
            <Star size={48} className="mx-auto mb-4 text-purple-500 hidden sm:block" />
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">4.9/5</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Average Rating</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
