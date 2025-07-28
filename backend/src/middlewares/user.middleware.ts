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
        console.log('ERROR: No token found in cookies');
        res.status(401).json({
            message: "Unauthorized access. No token provided."
        });
        return;
    }

    const decoded = verifyJwt(token);

    if (decoded === null) {
        console.log('ERROR: Invalid token');
        res.status(401).json({
            message: "Unauthorized access. Invalid token."
        });
        return;
    }

    req.user = {
        id: new mongoose.Types.ObjectId(decoded.id),
        role: decoded.role,
    };
    next();
};