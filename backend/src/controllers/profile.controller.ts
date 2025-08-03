import { Response } from 'express';
import { getUserById, updateUserProfile } from '../services/user.service';
import { hashPassword } from '../utils/hashPassword';
import { signJwt } from '../utils/jwt';
import { cookieOptions } from '../utils/cookieOptions';
import { AuthenticatedRequest } from '../middlewares/user.middleware';

export const completeProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { password, role } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized'
            });
        }

        if (!role) {
            return res.status(400).json({
                error: 'Role is required'
            });
        }

        if (role !== 'freelancer' && role !== 'client') {
            return res.status(400).json({
                error: 'Role must be either "freelancer" or "client"'
            });
        }

        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        if (user.profileCompleted) {
            return res.status(400).json({
                error: 'Profile already completed'
            });
        }

        if (!password) {
            return res.status(400).json({
                error: 'Password is required'
            });
        }

        const updateData: any = {
            role: role,
            profileCompleted: true
        };

        const hashedPassword = await hashPassword(password);
        updateData.password = hashedPassword;

        await updateUserProfile(userId, updateData);

        const token = signJwt({
            id: userId,
            role: role
        });

        res.cookie("token", token, cookieOptions);

        res.json({
            message: 'Profile completed successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: role,
                profileCompleted: true
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Profile completion failed",
            error: error
        });
    }
};

export const getProfileStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized'
            });
        }

        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            profileCompleted: user.profileCompleted,
            role: user.role,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileCompleted: user.profileCompleted
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get profile status",
            error: error
        });
    }
};

export const setPublicKey = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { publicKey } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!publicKey) return res.status(400).json({ error: 'publicKey is required' });
    const updated = await updateUserProfile(userId, { publicKey });
    res.json({ message: 'Public key saved' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save public key', error });
  }
};
