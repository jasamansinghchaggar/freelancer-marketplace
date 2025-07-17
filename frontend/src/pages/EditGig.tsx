import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gigsAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ComboboxDemo from '../components/combobox-demo';

const EditGig: React.FC = () => {
  // State for category options
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [initialImage, setInitialImage] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const descRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = 'auto';
      descRef.current.style.height = `${descRef.current.scrollHeight}px`;
    }
  }, [desc]);

  // Redirect if not freelancer
  useEffect(() => {
    if (!authLoading && user && user.role !== 'freelancer') {
      navigate('/home');
    }
  }, [authLoading, user, navigate]);

  // Fetch gig data
  useEffect(() => {
    if (id) {
      gigsAPI.getGig(id)
        .then(res => {
          const gig = res.data;
          // ensure owner: only check when user is loaded
          if (user && gig.userId?._id !== user.id) {
            navigate('/my-gigs');
            return;
          }
          // if user not loaded yet, wait for next effect run
          if (!user) return;
          setTitle(gig.title);
          setDesc(gig.desc);
          setPrice(gig.price.toString());
          // category may be string or object: use its name
          const initialCategory = typeof gig.category === 'string'
            ? gig.category
            : (gig.category as any)?.name ?? '';
          setCategory(initialCategory);
          setInitialImage(gig.imageURL);
          // load initial category list including this one
          setCategories([{ value: initialCategory, label: initialCategory }]);
        })
        .catch((error) => {
          console.error(error);
          
          navigate('/my-gigs')
        })
        .finally(() => setLoadingData(false));
    }
  }, [id, user, navigate]);
  // Fetch categories for combobox
  useEffect(() => {
    categoriesAPI.getCategories()
      .then(res => {
        const items = res.data.map((c: any) => ({ value: c.name, label: c.name }));
        setCategories(items);
      })
      .catch(err => console.error('Failed to load categories', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    // Ensure category exists in DB
    try { await categoriesAPI.createCategory(category); } catch { }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('desc', desc);
    formData.append('price', price);
    formData.append('category', category);
    if (file) {
      formData.append('image', file);
    }
    try {
      await gigsAPI.updateGig(id, formData);
      navigate('/my-gigs');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <Layout>
        <div className="p-4">
          <Skeleton className="h-40 w-full rounded-lg mb-4" />
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-6 w-2/3 mb-2" />
          <Skeleton className="h-8 w-20" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl p-4">
        <h1 className="text-2xl font-semibold mb-4">Edit Gig</h1>
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
            <label className="block mb-1 font-medium">Current Image</label>
            {initialImage && <img src={initialImage} alt="Current" className="w-full h-40 object-cover mb-2 rounded" />}
            <label className="block mb-1 font-medium">Replace Image</label>
            <Input type="file" accept="image/*" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Price (₹)</label>
              <Input type="number" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Category</label>
              <ComboboxDemo
                value={category}
                onChange={async (val: string) => {
                  setCategory(val);
                  // persist new category if not existing
                  if (!categories.some(c => c.value === val)) {
                    try { await categoriesAPI.createCategory(val); } catch { }
                    setCategories(prev => [...prev, { value: val, label: val }]);
                  }
                }}
                items={categories}
                placeholder="Select or add a category"
              />
            </div>
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Gig'}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default EditGig;
