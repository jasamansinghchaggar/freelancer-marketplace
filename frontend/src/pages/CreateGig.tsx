import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gigsAPI } from '../services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import Layout from '@/components/Layout';

const CreateGig: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    // Ref for auto-resizing textarea
    const descRef = useRef<HTMLTextAreaElement>(null);

    // Redirect if not logged in or not a freelancer
    React.useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/signin');
            } else if (user.role !== 'freelancer') {
                navigate('/home');
            }
        }
    }, [user, loading, navigate]);

    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loadingSubmit, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Auto-adjust textarea height on content change
    useEffect(() => {
        if (descRef.current) {
            descRef.current.style.height = 'auto';
            descRef.current.style.height = `${descRef.current.scrollHeight}px`;
        }
    }, [desc]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('desc', desc);
            formData.append('price', price);
            formData.append('category', category);
            if (file) formData.append('image', file);
            await gigsAPI.createGig(formData);
            navigate('/gigs');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create gig');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;

    return (
        <Layout>
            <div className="max-w-3xl">
                <h1 className="text-2xl font-semibold mb-4">Create New Gig</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Title</label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Description</label>
                        <textarea
                            ref={descRef}
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            className="w-full p-2 border border-border rounded min-h-24 resize-none"
                            rows={4}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Image</label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Price (₹)</label>
                            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Category</label>
                            <Input value={category} onChange={e => setCategory(e.target.value)} required />
                        </div>
                    </div>
                    {error && <p className="text-destructive">{error}</p>}
                    <Button type="submit" disabled={loadingSubmit}>
                        {loadingSubmit ? 'Creating...' : 'Create Gig'}
                    </Button>
                </form>
            </div>
        </Layout>
    );
};

export default CreateGig;
