import jwt from 'jsonwebtoken';
import { type StringValue } from "ms";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION as StringValue;

export const signJwt = (payload: Record<string, string>): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

export const verifyJwt = (token: string): any => {
    try {
        return jwt.verify(token, JWT_SECRET) as Record<string, any>;
    } catch (error) {
        console.error("JWT verification failed:", error);
        return null;
    }
};