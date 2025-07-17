import { Response } from 'express';
import {
    createPurchaseService,
    getClientPurchasesService,
    getFreelancerPurchasesService,
} from '../services/purchase.service';
import Gig from '../models/gig.model';
import { AuthenticatedRequest } from '../middlewares/user.middleware';

// Client purchases a gig
export const purchaseGig = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const clientId = req.user?.id;
        const gig = await Gig.findById(req.params.gigId);
        if (!gig) {
            return res.status(404).json({ error: 'Gig not found' });
        }
        const purchase = await createPurchaseService({
            gigId: (gig._id as any).toString(),
            clientId: clientId!,
            freelancerId: (gig.userId as any).toString(),
        });
        res.status(201).json(purchase);
    } catch (err) {
        res.status(500).json({ error: 'Purchase failed', details: err });
    }
};

// Get purchases for client
export const getClientPurchases = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const clientId = req.user?.id!;
        const purchases = await getClientPurchasesService(clientId);
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch purchases', details: err });
    }
};

// Get sales for freelancer
export const getFreelancerPurchases = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const freelancerId = req.user?.id!;
        const purchases = await getFreelancerPurchasesService(freelancerId);
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch sales', details: err });
    }
};
