import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./user.middleware";

export const requireRole = (role: "freelancer" | "client") => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({
                message: `Access denied. Only ${role}s are allowed.`
            });
        }
        next();
    };
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized. Please login first."
        });
    }
    next();
};
