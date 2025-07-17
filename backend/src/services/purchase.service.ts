import Purchase from '../models/purchase.model';
import { Types } from 'mongoose';

export const createPurchaseService = async (data: {
  gigId: string;
  clientId: string;
  freelancerId: string;
}) => {
  return await Purchase.create({
    gigId: new Types.ObjectId(data.gigId),
    clientId: new Types.ObjectId(data.clientId),
    freelancerId: new Types.ObjectId(data.freelancerId),
  });
};

export const getClientPurchasesService = async (clientId: string) => {
  return await Purchase.find({ clientId })
    .populate({ path: 'gigId', populate: { path: 'userId', select: 'name email imageURL' } });
};

export const getFreelancerPurchasesService = async (freelancerId: string) => {
  return await Purchase.find({ freelancerId })
    .populate({ path: 'gigId', populate: { path: 'userId', select: 'name email imageURL' } })
    .populate('clientId', 'name email');
};
