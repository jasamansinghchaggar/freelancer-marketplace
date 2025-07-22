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
            <main className='w-full h-full flex flex-col items-center justify-center relative px-5 bg-background text-foreground'>
                <h1 className="text-5xl font-bold mb-4 text-center">Find <span className='font-heading'>Your</span> Perfect Freelancer</h1>
                <p className="text-lg text-muted-foreground mb-8 text-center max-w-xl">
                    Connect with talented professionals to build your dream project. Post a job,
                    review candidates, and collaborate—all in one place.
                </p>
                <div className="flex space-x-4 mb-16">
                    <Button onClick={() => navigate('/signup')}>Get Started</Button>
                    <Button variant="outline" onClick={() => navigate('/signin')}>Sign In</Button>
                </div>
                <section className="w-full bg-secondary-bg py-16">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 bg-card border hover:shadow-[6px_6px_0px_2px] hover:-translate-y-1 animation duration-200">
                            <h3 className="text-xl font-semibold mb-2 text-foreground">Post a Job</h3>
                            <p className="text-muted-foreground">Describe your project and get proposals from top freelancers in minutes.</p>
                        </div>
                        <div className="p-6 bg-card border hover:shadow-[6px_6px_0px_2px] hover:-translate-y-1 animation duration-200">
                            <h3 className="text-xl font-semibold mb-2 text-foreground">Browse Freelancers</h3>
                            <p className="text-muted-foreground">Search experts by skill, rate, and reviews to find the perfect match.</p>
                        </div>
                        <div className="p-6 bg-card border hover:shadow-[6px_6px_0px_2px] hover:-translate-y-1 animation duration-200">
                            <h3 className="text-xl font-semibold mb-2 text-foreground">Secure Payments</h3>
                            <p className="text-muted-foreground">Pay safely with our escrow system and release funds upon satisfaction.</p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;