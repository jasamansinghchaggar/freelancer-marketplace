import { Request, Response } from "express";
import { signJwt } from "../utils/jwt";
import { cookieOptions } from "../utils/cookieOptions";

const frontendUrl = process.env.FRONTEND_URL;

export const handleGoogleCallback = (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    if (!user) {
      console.error('No user found in Google callback');
      return res.redirect(`${frontendUrl}/signin?error=auth_failed`);
    }

    const token = signJwt({
      id: user._id.toString(),
      role: user.role,
    });

    res.cookie("token", token, cookieOptions);

    if (user.isFirstTime || !user.profileCompleted) {
      res.redirect(`${frontendUrl}/complete-profile`);
    } else {
      res.redirect(`${frontendUrl}/home`);
    }
  } catch (error) {
    console.error('Error in Google callback:', error);
    res.redirect(`${frontendUrl}/signin?error=callback_error`);
  }
};

export const handleGoogleFailure = (req: Request, res: Response) => {
  console.error('Google authentication failed:', req.query);
  res.redirect(`${frontendUrl}/signin?error=google_auth_failed`);
};

export const logout = (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" as const : "lax" as const,
      domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined
    });
    
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: "Error during logout" });
  }
};
