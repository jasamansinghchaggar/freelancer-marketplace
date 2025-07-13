import { Request, Response } from "express";
import { signJwt } from "../utils/jwt";
import { cookieOptions } from "../utils/cookieOptions";

export const handleGoogleCallback = (req: Request, res: Response) => {
    const user = req.user as any;

    const token = signJwt({
        id: user._id.toString(),
        role: user.role
    });

    res.cookie("token", token, cookieOptions);

    const frontendUrl = process.env.FRONTEND_URL;

    if (user.isFirstTime || !user.profileCompleted) {
        res.redirect(`${frontendUrl}/complete-profile`);
    } else {
        res.redirect(`${frontendUrl}/home`);
    }
};

export const handleGoogleFailure = (req: Request, res: Response) => {
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/signin?error=google_auth_failed`);
};
