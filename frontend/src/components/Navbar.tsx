import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '../context/AuthContext';
import { ModeToggle } from './mode-toggle';

const Navbar: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="w-screen z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="max-w-7xl mx-auto flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6">
                <Link
                    to="/"
                    className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground font-logo hover:opacity-80 transition-opacity duration-200 hover:italic truncate"
                >
                    <span className="hidden sm:inline">Freelancer Marketplace</span>
                    <span className="sm:hidden">FM</span>
                </Link>

                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                    <ModeToggle />
                    {user ? (
                        <>
                            {user.role === 'freelancer' && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => navigate('/gigs/new')}
                                    className="hidden sm:flex text-xs md:text-sm"
                                >
                                    <span className="hidden md:inline">Create Gig</span>
                                    <span className="md:hidden">Create</span>
                                </Button>
                            )}

                            {/* User avatar - shows they're logged in */}
                            <div className="flex items-center space-x-1 sm:space-x-2 text-sm text-muted-foreground">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity">
                                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs sm:text-sm">{user.email}</p>
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
                                className="border text-xs sm:text-sm px-2 sm:px-3"
                            >
                                Sign In
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => navigate('/signup')}
                                className="text-xs sm:text-sm px-2 sm:px-3"
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
