import React, { useEffect, useState } from 'react';
import { authAPI } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { RiEditLine, RiCheckLine, RiCloseLine } from '@remixicon/react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [editableName, setEditableName] = useState('');
    const [editableEmail, setEditableEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        authAPI.getProfile()
            .then(res => setProfile(res.data.user || res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);
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
            <div className="max-w-4xl space-y-4 sm:space-y-6 pb-4">
                <h1 className="text-xl sm:text-2xl font-semibold">Profile</h1>
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <div className='flex gap-3 items-center'>
                        <Input
                            className='w-full sm:max-w-xs lg:max-w-sm'
                            value={isEditingName ? editableName : profile.name}
                            disabled={!isEditingName}
                            onChange={e => setEditableName(e.target.value)}
                        />
                        <div className="flex gap-2">
                            {isEditingName ? (
                                <>
                                    <RiCheckLine
                                        className='cursor-pointer hover:text-green-600 transition-colors'
                                        size={20}
                                        onClick={async () => {
                                            try {
                                                const res = await authAPI.updateProfile({ name: editableName, email: profile.email });
                                                setProfile(res.data.user);
                                                setIsEditingName(false);
                                                toast.success('Name updated successfully!');
                                            } catch (err: any) {
                                                console.error(err);
                                                toast.error(err.response?.data?.message || 'Failed to update name');
                                            }
                                        }}
                                    />
                                    <RiCloseLine
                                        className='cursor-pointer hover:text-red-600 transition-colors'
                                        size={20}
                                        onClick={() => {
                                            setIsEditingName(false);
                                            setEditableName(profile.name);
                                        }}
                                    />
                                </>
                            ) : (
                                <RiEditLine
                                    className='cursor-pointer hover:text-primary transition-colors'
                                    size={20}
                                    onClick={() => setIsEditingName(true)}
                                />
                            )}
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <div className='flex gap-3 items-center'>
                        <Input
                            className='w-full sm:max-w-xs lg:max-w-sm'
                            value={isEditingEmail ? editableEmail : profile.email}
                            disabled={!isEditingEmail}
                            onChange={e => setEditableEmail(e.target.value)}
                        />
                        <div className="flex gap-2">
                            {isEditingEmail ? (
                                <>
                                    <RiCheckLine
                                        className='cursor-pointer hover:text-green-600 transition-colors'
                                        size={20}
                                        onClick={async () => {
                                            try {
                                                const res = await authAPI.updateProfile({ name: profile.name, email: editableEmail });
                                                setProfile(res.data.user);
                                                setIsEditingEmail(false);
                                                toast.success('Email updated successfully!');
                                            } catch (err: any) {
                                                console.error(err);
                                                toast.error(err.response?.data?.message || 'Failed to update email');
                                            }
                                        }}
                                    />
                                    <RiCloseLine
                                        className='cursor-pointer hover:text-red-600 transition-colors'
                                        size={20}
                                        onClick={() => {
                                            setIsEditingEmail(false);
                                            setEditableEmail(profile.email);
                                        }}
                                    />
                                </>
                            ) : (
                                <RiEditLine
                                    className='cursor-pointer hover:text-primary transition-colors'
                                    size={20}
                                    onClick={() => setIsEditingEmail(true)}
                                />
                            )}
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <Input className='w-full sm:max-w-xs lg:max-w-sm' value={profile.role} disabled />
                </div>
                <div className="pt-4 space-y-3">
                    <label className="text-xl sm:text-2xl font-semibold">Change Password</label>
                    <div className="pt-4 space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Old Password</label>
                            <Input
                                type="password"
                                className="w-full sm:max-w-xs lg:max-w-sm"
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">New Password</label>
                            <Input
                                type="password"
                                className="w-full sm:max-w-xs lg:max-w-sm"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                            <Input
                                type="password"
                                className="w-full sm:max-w-xs lg:max-w-sm"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <Button onClick={async () => {
                            if (newPassword !== confirmPassword) {
                                toast.error('New passwords do not match');
                                return;
                            }
                            try {
                                await authAPI.changePassword(oldPassword, newPassword);
                                toast.success('Password changed successfully!');
                                setOldPassword('');
                                setNewPassword('');
                                setConfirmPassword('');
                            } catch (err: any) {
                                console.error(err);
                                toast.error(err.response?.data?.message || 'Failed to change password');
                            }
                        }}>
                            Save Password
                        </Button>
                    </div>
                </div>
            </div>

        </Layout>
    );
};

export default Profile;
