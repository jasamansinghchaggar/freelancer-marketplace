import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { user, signout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        signout();
        navigate('/');
    };

    return (
        <nav className="w-full bg-background border-b border-border">
            <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-5">
                <Link to="/" className="text-2xl font-bold text-foreground font-logo not-hover:italic transition-all duration-200 ease-in-out">
                    Freelancer Marketplace
                </Link>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <Link to="/profile" className="text-muted-foreground hover:text-foreground">
                                Profile
                            </Link>
                            <Button variant="outline" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => navigate('/signin')} className='border'>
                                Sign In
                            </Button>
                            <Button onClick={() => navigate('/signup')}>
                                Sign Up
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
