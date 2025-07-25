import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            navigate('/home');
        }
    }, [user, navigate]);

    return (
        <div className='h-[100dvh] w-full'>
            <Navbar />
            <main className='w-full h-max flex flex-col items-center justify-center relative p-4 sm:p-6 lg:p-8 bg-background text-foreground'>
                {/* Hero Section */}
                <div className="flex flex-col items-center justify-center flex-1 max-w-7xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-center leading-tight">
                        Find <span className='font-heading'>Your</span> Perfect Freelancer
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 text-center max-w-xs sm:max-w-md lg:max-w-xl px-2">
                        Connect with talented professionals to build your dream project. Post a job,
                        review candidates, and collaborate—all in one place.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 lg:mb-16 w-full sm:w-auto">
                        <Button
                            onClick={() => navigate('/signup')}
                            className="w-full sm:w-auto text-sm sm:text-base"
                            size="default"
                        >
                            Get Started
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/signin')}
                            className="w-full sm:w-auto text-sm sm:text-base"
                            size="default"
                        >
                            Sign In
                        </Button>
                    </div>
                </div>

                {/* Features Section */}
                <section className="w-full bg-secondary-bg py-8 sm:py-12 lg:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            <div className="p-4 sm:p-6 bg-card border md:hover:shadow-[8px_8px_0px_2px] md:hover:-translate-y-1 md:hover:-translate-x-1 transition-all duration-200 rounded-lg">
                                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Post a Job</h3>
                                <p className="text-sm sm:text-base text-muted-foreground">Describe your project and get proposals from top freelancers in minutes.</p>
                            </div>
                            <div className="p-4 sm:p-6 bg-card border md:hover:shadow-[8px_8px_0px_2px] md:hover:-translate-y-1 md:hover:-translate-x-1 transition-all duration-200 rounded-lg">
                                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Browse Freelancers</h3>
                                <p className="text-sm sm:text-base text-muted-foreground">Search experts by skill, rate, and reviews to find the perfect match.</p>
                            </div>
                            <div className="p-4 sm:p-6 bg-card border md:hover:shadow-[8px_8px_0px_2px] md:hover:-translate-y-1 md:hover:-translate-x-1 transition-all duration-200 rounded-lg sm:col-span-2 lg:col-span-1">
                                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Secure Payments</h3>
                                <p className="text-sm sm:text-base text-muted-foreground">Pay safely with our escrow system and release funds upon satisfaction.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;