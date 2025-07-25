import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { gigsAPI } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { RiSearchLine, RiCloseLine } from '@remixicon/react';

const Gigs: React.FC = () => {
    const [gigs, setGigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 20;
    const navigate = useNavigate();

    useEffect(() => {
        gigsAPI.getGigs()
            .then(res => setGigs(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Filter gigs based on search term
    const filteredGigs = useMemo(() => {
        if (!searchTerm.trim()) {
            return gigs;
        }

        const lowercaseSearch = searchTerm.toLowerCase();
        return gigs.filter(gig => {
            const titleMatch = gig.title.toLowerCase().includes(lowercaseSearch);
            const categoryValue = typeof gig.category === 'string'
                ? gig.category
                : (gig.category as any)?.name ?? '';
            const categoryMatch = categoryValue.toLowerCase().includes(lowercaseSearch);
            const descText = (gig.desc ?? '').toLowerCase();
            const descMatch = descText.includes(lowercaseSearch);
            const userName = gig.userId?.name ?? '';
            const userMatch = userName.toLowerCase().includes(lowercaseSearch);
            return titleMatch || categoryMatch || descMatch || userMatch;
        });
    }, [gigs, searchTerm]);
    // Pagination calculations
    const pageCount = Math.ceil(filteredGigs.length / pageSize);
    const paginatedGigs = filteredGigs.slice((page - 1) * pageSize, page * pageSize);

    // Reset to first page on new search term
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const handleGigClick = (gigId: string) => {
        navigate(`/gigs/${gigId}`);
    };

    return (
        <Layout>
            <div className="space-y-4 sm:space-y-6">
                <div className="space-y-4 sm:space-y-6">
                    <h1 className="text-xl sm:text-2xl font-semibold">Browse Gigs</h1>

                    {/* Search Bar */}
                    <div className="relative w-full max-w-full sm:max-w-2xl">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <RiSearchLine className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Search gigs by title, category, or freelancer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-9 text-sm sm:text-base"
                        />
                        {searchTerm && (
                            <Button
                                variant="link"
                                size="sm"
                                onClick={handleClearSearch}
                                className="absolute inset-y-0.5 right-0 flex items-center"
                            >
                                <RiCloseLine className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Search Results Count */}
                    {searchTerm && !loading && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {filteredGigs.length} gig{filteredGigs.length !== 1 ? 's' : ''} found
                            {searchTerm && ` for "${searchTerm}"`}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {Array(8).fill(0).map((_, idx) => (
                            <Skeleton key={idx} className="h-48 sm:h-52 w-full rounded-lg" />
                        ))}
                    </div>
                ) : filteredGigs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 max-h-max">
                        <RiSearchLine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-base sm:text-lg font-medium text-foreground mb-2 text-center">
                            {searchTerm ? 'No gigs found' : 'No gigs available'}
                        </h3>
                        <p className="text-muted-foreground text-center px-4 text-sm sm:text-base">
                            {searchTerm
                                ? `Try adjusting your search or browse all available gigs.`
                                : 'Be the first to post a gig!'
                            }
                        </p>
                        {searchTerm && (
                            <Button
                                variant="outline"
                                onClick={handleClearSearch}
                                className="mt-4"
                                size="sm"
                            >
                                Clear search
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className='max-h-max'>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                {paginatedGigs.map(gig => (
                                    <div
                                        key={gig._id}
                                        className="bg-card rounded-lg shadow hover:shadow-md transform hover:scale-101 overflow-hidden border cursor-pointer transition-all duration-200"
                                        onClick={() => handleGigClick(gig._id)}
                                    >
                                        <img 
                                            src={gig.imageURL} 
                                            alt={gig.title} 
                                            className="w-full h-32 sm:h-40 object-cover" 
                                        />
                                        <div className="p-3 sm:p-4">
                                            <h3 className="text-base sm:text-lg font-semibold truncate">{gig.title}</h3>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                {typeof gig.category === 'string'
                                                    ? gig.category
                                                    : (gig.category as any)?.name ?? 'Uncategorized'
                                                }
                                            </p>
                                            <div className="mt-2 flex justify-between items-center">
                                                <span className="text-sm sm:text-base font-medium">₹{gig.price}</span>
                                                <span className="text-xs text-muted-foreground">
                                                  By {gig.userId?.name ?? 'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Pagination Controls */}
                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={page === 1} 
                                onClick={() => setPage(page - 1)}
                                className="w-full sm:w-auto"
                            >
                                Previous
                            </Button>
                            <div className="flex space-x-1 overflow-x-auto pb-2 sm:pb-0">
                                {Array(pageCount).fill(0).map((_, idx) => {
                                    const pageNum = idx + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`px-3 py-1 rounded text-sm transition-colors ${
                                                page === pageNum 
                                                    ? 'bg-primary text-primary-foreground' 
                                                    : 'bg-card hover:bg-primary hover:text-primary-foreground'
                                            }`}
                                            onClick={() => setPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={page === pageCount} 
                                onClick={() => setPage(page + 1)}
                                className="w-full sm:w-auto"
                            >
                                Next
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default Gigs;
