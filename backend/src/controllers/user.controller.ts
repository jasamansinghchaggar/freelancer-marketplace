import { Request, Response } from "express";
import { createUser, findUserByEmail } from "../services/user.service";
import { signInSchema, signUpSchema } from "../validations/user.validation";
import { signJwt } from "../utils/jwt";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import { cookieOptions } from "../utils/cookieOptions";
import { AuthenticatedRequest } from "../middlewares/user.middleware";
import { getUserById } from "../services/user.service";

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const parseResult = signUpSchema.safeParse(req.body);

        if (!parseResult.success) {
            res.status(400).json({
                message: "Invalid request data",
                errors: parseResult.error.errors
            });
            return;
        }

        const { name, email, password, role } = parseResult.data;

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            res.status(409).json({
                message: "User already exists with this email"
            });
            return;
        }

        const hashedPassword = await hashPassword(password);

        await createUser({ name, email, password: hashedPassword, role });

        res.status(200).json({
            message: "signup successful",
            user: {
                name,
                email,
                role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "signup failed",
            error: error
        });
    }
}

export const signin = async (req: Request, res: Response): Promise<void> => {
    try {
        const parseResult = signInSchema.safeParse(req.body);

        if (!parseResult.success) {
            res.status(400).json({
                message: "Invalid request data",
                errors: parseResult.error.errors
            });
            return;
        }

        const { email, password } = parseResult.data;

        if (email && password) {
            const user = await findUserByEmail(email);
            if (user) {
                const isPasswordValid = await comparePassword(password, user.password);
                if (isPasswordValid) {
                    const token = signJwt({ id: user._id, email: user.email });
                    res.cookie("token", token, cookieOptions);
                    res.status(200).json({
                        message: "signin successful",
                        user: {
                            email: user.email,
                            name: user.name,
                            role: user.role,
                        }
                    });
                } else {
                    res.status(401).json({
                        message: "Invalid credentials"
                    });
                }
            } else {
                res.status(404).json({
                    message: "User not found"
                });
            }
        }
    } catch (error) {
        res.status(500).json({
            message: "signin failed",
            error: error
        });
    }
}

export const signout = async (req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie("token", cookieOptions);
        res.status(200).json({
            message: "signout successful"
        });
    } catch (error) {
        res.status(500).json({
            message: "signout failed",
            error: error
        });
    }
}

export const profile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                message: "Unauthorized access"
            });
            return;
        }

        const user = await getUserById(userId);

        if (user) {
            res.status(200).json({
                message: "Profile fetched successfully",
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    profileCompleted: user.profileCompleted || false
                }
            });
        } else {
            res.status(404).json({
                message: "User not found"
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch profile",
            error: error
        });
    }
}