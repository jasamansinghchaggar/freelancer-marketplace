import React, { useEffect, useState } from 'react';
import { authAPI } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { RiEditLine, RiCheckLine, RiCloseLine } from '@remixicon/react';
import Layout from '@/components/Layout';

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    // editing state
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [editableName, setEditableName] = useState('');
    const [editableEmail, setEditableEmail] = useState('');

    useEffect(() => {
        authAPI.getProfile()
            .then(res => setProfile(res.data.user || res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);
    // initialize editable fields when profile loads
    useEffect(() => {
        if (profile) {
            setEditableName(profile.name);
            setEditableEmail(profile.email);
        }
    }, [profile]);

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
                        <Input
                            className='max-w-[20vw]'
                            value={isEditingName ? editableName : profile.name}
                            disabled={!isEditingName}
                            onChange={e => setEditableName(e.target.value)}
                        />
                        {isEditingName ? (
                            <>
                                <RiCheckLine className='cursor-pointer' onClick={async () => {
                                    try {
                                        const res = await authAPI.updateProfile({ name: editableName, email: profile.email });
                                        setProfile(res.data.user);
                                        setIsEditingName(false);
                                    } catch (err) {
                                        console.error(err);
                                        alert('Failed to update name');
                                    }
                                }} />
                                <RiCloseLine className='cursor-pointer' onClick={() => {
                                    setIsEditingName(false);
                                    setEditableName(profile.name);
                                }} />
                            </>
                        ) : (
                            <RiEditLine className='cursor-pointer' onClick={() => setIsEditingName(true)} />
                        )}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <div className='flex gap-3 items-center'>
                        <Input
                            className='max-w-[20vw]'
                            value={isEditingEmail ? editableEmail : profile.email}
                            disabled={!isEditingEmail}
                            onChange={e => setEditableEmail(e.target.value)}
                        />
                        {isEditingEmail ? (
                            <>
                                <RiCheckLine className='cursor-pointer' onClick={async () => {
                                    try {
                                        const res = await authAPI.updateProfile({ name: profile.name, email: editableEmail });
                                        setProfile(res.data.user);
                                        setIsEditingEmail(false);
                                    } catch (err) {
                                        console.error(err);
                                        alert('Failed to update email');
                                    }
                                }} />
                                <RiCloseLine className='cursor-pointer' onClick={() => {
                                    setIsEditingEmail(false);
                                    setEditableEmail(profile.email);
                                }} />
                            </>
                        ) : (
                            <RiEditLine className='cursor-pointer' onClick={() => setIsEditingEmail(true)} />
                        )}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <Input className='max-w-[20vw]' value={profile.role} disabled />
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
