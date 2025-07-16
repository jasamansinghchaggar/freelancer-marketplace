import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { gigsAPI } from '../services/api';
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
        return gigs.filter(gig =>
            gig.title.toLowerCase().includes(lowercaseSearch) ||
            gig.category.toLowerCase().includes(lowercaseSearch) ||
            (gig.description && gig.description.toLowerCase().includes(lowercaseSearch)) ||
            gig.userId.name.toLowerCase().includes(lowercaseSearch)
        );
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
            <div>
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold mb-4">Browse Gigs</h1>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <RiSearchLine className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Search gigs by title, category, or freelancer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-9"
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
                        <p className="text-sm text-muted-foreground mt-2">
                            {filteredGigs.length} gig{filteredGigs.length !== 1 ? 's' : ''} found
                            {searchTerm && ` for "${searchTerm}"`}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array(8).fill(0).map((_, idx) => (
                            <Skeleton key={idx} className="h-40 w-full rounded-lg" />
                        ))}
                    </div>
                ) : filteredGigs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 min-h-[70vh] max-h-max">
                        <RiSearchLine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            {searchTerm ? 'No gigs found' : 'No gigs available'}
                        </h3>
                        <p className="text-muted-foreground">
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
                            >
                                Clear search
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className='min-h-[63vh] max-h-max'>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedGigs.map(gig => (
                                    <div
                                        key={gig._id}
                                        className="bg-card rounded-lg shadow hover:shadow-md transform hover:scale-101 overflow-hidden border cursor-pointer transition-all duration-200"
                                        onClick={() => handleGigClick(gig._id)}
                                    >
                                        <img src={gig.imageURL} alt={gig.title} className="w-full h-40 object-cover " />
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold truncate">{gig.title}</h3>
                                            <p className="text-sm text-muted-foreground truncate">{gig.category}</p>
                                            <div className="mt-2 flex justify-between items-center">
                                                <span className="text-sm font-medium">₹{gig.price}</span>
                                                <span className="text-xs text-muted-foreground">By {gig.userId.name}</span>
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
                    </>
                )}
            </div>
        </Layout>
    );
};

export default Gigs;
