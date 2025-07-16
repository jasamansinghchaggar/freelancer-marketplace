import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="w-screen sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 md:px-6">
                <Link
                    to="/"
                    className="text-xl md:text-2xl font-bold text-foreground font-logo hover:opacity-80 transition-opacity duration-200 hover:italic"
                >
                    Freelancer Marketplace
                </Link>

                <div className="flex items-center space-x-2 md:space-x-4">
                    {user ? (
                        <>
                            {user.role === 'freelancer' && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => navigate('/gigs/new')}
                                    className="hidden md:flex"
                                >
                                    Create Gig
                                </Button>
                            )}

                            {/* User avatar - shows they're logged in */}
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity">
                                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{user.email}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/signin')}
                                className="border"
                            >
                                Sign In
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => navigate('/signup')}
                            >
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
