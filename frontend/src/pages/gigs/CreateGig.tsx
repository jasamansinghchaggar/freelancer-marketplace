import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gigsAPI, categoriesAPI } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import ComboboxDemo from '@/components/combobox-demo';
import { predefinedCategories } from '@/common/predefinedCategories';
import { toast } from 'sonner';

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
    // Predefined categories
    
    // Initialize categories with predefined list
    const [categories, setCategories] = useState(predefinedCategories);

    // Auto-adjust textarea height on content change
    useEffect(() => {
        if (descRef.current) {
            descRef.current.style.height = 'auto';
            descRef.current.style.height = `${descRef.current.scrollHeight}px`;
        }
    }, [desc]);

    useEffect(() => {
        categoriesAPI.getCategories()
          .then(res => {
            const fetched: { value: string; label: string }[] =
              res.data.map((c: any) => ({ value: c.name, label: c.name }));
            // merge predefined and fetched, avoiding duplicates
            const merged = [
              ...predefinedCategories,
              ...fetched.filter(
                (f: { value: string; label: string }) =>
                  !predefinedCategories.some(p => p.value === f.value)
              ),
            ];
            setCategories(merged);
          })
          .catch(err => console.error(err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Persist category to DB (idempotent)
            await categoriesAPI.createCategory(category);
            const formData = new FormData();
            formData.append('title', title);
            formData.append('desc', desc);
            formData.append('price', price);
            formData.append('category', category);
            if (file) formData.append('image', file);
            await gigsAPI.createGig(formData);
            toast.success('Gig created successfully!');
            navigate('/gigs');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create gig';
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;

    return (
        <Layout>
            <div className="max-w-4xl">
                <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Create New Gig</h1>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div>
                        <label className="block mb-2 font-medium text-sm sm:text-base">Title</label>
                        <Input 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            required 
                            className="text-sm sm:text-base"
                            placeholder="Enter gig title"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium text-sm sm:text-base">Description</label>
                        <textarea
                            ref={descRef}
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            className="w-full p-3 border border-border rounded min-h-24 resize-none text-sm sm:text-base"
                            rows={4}
                            required
                            placeholder="Describe your gig in detail..."
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium text-sm sm:text-base">Image</label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                            required
                            className="text-sm sm:text-base"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 font-medium text-sm sm:text-base">Price (₹)</label>
                            <Input 
                                type="number" 
                                value={price} 
                                onChange={e => setPrice(e.target.value)} 
                                required 
                                className="text-sm sm:text-base"
                                placeholder="0"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-sm sm:text-base">Category</label>
                            <ComboboxDemo
                              value={category}
                              onChange={(val: string) => {
                                setCategory(val);
                                if (!categories.some(c => c.value === val)) {
                                  setCategories(prev => [...prev, { value: val, label: val }]);
                                }
                              }}
                              items={categories}
                              placeholder="Select category..."
                            />
                        </div>
                    </div>
                    {error && (
                        <div className="bg-destructive/10 text-destructive px-3 py-3 rounded-lg border border-destructive/30 text-sm">
                            {error}
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                        <Button 
                            type="submit" 
                            disabled={loadingSubmit}
                            className="w-full sm:w-auto text-sm sm:text-base"
                        >
                            {loadingSubmit ? 'Creating...' : 'Create Gig'}
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => navigate('/gigs')}
                            className="w-full sm:w-auto text-sm sm:text-base"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default CreateGig;
