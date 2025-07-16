import React, { useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { RiEditLine } from '@remixicon/react';
import Layout from '@/components/Layout';

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authAPI.getProfile()
            .then(res => setProfile(res.data.user || res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <Skeleton className="w-10 h-10 rounded-full" />
                </div>
            </Layout>
        );
    }

    if (!profile) {
        return (
            <Layout>
                <div className="p-6 text-center text-foreground">User not found.</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-3xl space-y-6">
                <h1 className="text-2xl font-semibold">Profile</h1>
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <div className='flex gap-3 items-center'>
                        <Input className='max-w-[20vw]' value={profile.name} disabled />
                        <RiEditLine className='cursor-pointer'/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <div className='flex gap-3 items-center'>
                        <Input className='max-w-[20vw]' value={profile.email} disabled />
                        <RiEditLine className='cursor-pointer' />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <div className='flex gap-3 items-center'>
                        <Input className='max-w-[20vw]' value={profile.role} disabled />
                        <RiEditLine className='cursor-pointer' />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
