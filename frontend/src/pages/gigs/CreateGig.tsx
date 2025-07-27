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
    const descRef = useRef<HTMLTextAreaElement>(null);

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
    
    const [categories, setCategories] = useState(predefinedCategories);

    const validateFile = (file: File): string | null => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (file.size > maxSize) {
            return 'File size must be less than 10MB';
        }

        if (!allowedTypes.includes(file.type)) {
            return 'Please select a valid image file (JPEG, PNG, GIF, or WebP)';
        }

        return null;
    };

    // Validate that image dimensions do not exceed 3000x2000
    const validateImageDimensions = (file: File): Promise<string | null> => {
        return new Promise(resolve => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.src = objectUrl;
            img.onload = () => {
                const maxWidth = 3000;
                const maxHeight = 2000;
                if (img.width > maxWidth || img.height > maxHeight) {
                    resolve(`Image dimensions must be at most ${maxWidth}x${maxHeight} pixels`);
                } else {
                    resolve(null);
                }
                URL.revokeObjectURL(objectUrl);
            };
            img.onerror = () => {
                resolve('Failed to validate image dimensions');
                URL.revokeObjectURL(objectUrl);
            };
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;
        if (selectedFile) {
            const validationError = validateFile(selectedFile);
            if (validationError) {
                toast.error(validationError);
                setError(validationError);
                e.target.value = ''; // Clear the input
                setFile(null);
                return;
            }
            setError(''); // Clear any previous errors
            setFile(selectedFile);
            toast.success(`File "${selectedFile.name}" selected successfully`);
        } else {
            setFile(null);
        }
    };

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
        
        if (!file) {
            toast.error('Please select an image file');
            setError('Please select an image file');
            setLoading(false);
            return;
        }

        const fileValidationError = validateFile(file);
        if (fileValidationError) {
            toast.error(fileValidationError);
            setError(fileValidationError);
            setLoading(false);
            return;
        }

        // Validate image dimensions
        const dimensionError = await validateImageDimensions(file);
        if (dimensionError) {
            toast.error(dimensionError);
            setError(dimensionError);
            setLoading(false);
            return;
        }

        try {
            await categoriesAPI.createCategory(category);
            const formData = new FormData();
            formData.append('title', title);
            formData.append('desc', desc);
            formData.append('price', price);
            formData.append('category', category);
            formData.append('image', file);
            
            toast.loading('Uploading gig...', { id: 'gig-upload' });
            await gigsAPI.createGig(formData);
            toast.dismiss('gig-upload');
            toast.success('Gig created successfully!');
            navigate('/gigs');
        } catch (err: any) {
            toast.dismiss('gig-upload');
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create gig';
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
                            onChange={handleFileChange}
                            required
                            className="text-sm sm:text-base"
                        />
                        {file && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        )}
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
