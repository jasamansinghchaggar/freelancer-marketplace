import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";
import mongoose from "mongoose";

export interface AuthenticatedRequest extends Request {
    user?: any
    role?: string
}

export const userMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    const token = req.cookies.token;    

    if (!token) {
        // Only log this as debug info, not an error, as it's expected for unauthenticated requests
        res.status(401).json({
            message: "Unauthorized access. No token provided."
        });
        return;
    }

    try {
        const decoded = verifyJwt(token);
        // Token is valid and not expired
        req.user = {
            id: new mongoose.Types.ObjectId(decoded.id),
            role: decoded.role,
        };
        next();
    } catch (error: any) {
        // Handle expired token separately
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Unauthorized access. Token expired."
            });
        }
        console.error('JWT verification error:', error);
        return res.status(401).json({
            message: "Unauthorized access. Invalid token."
        });
    }
};