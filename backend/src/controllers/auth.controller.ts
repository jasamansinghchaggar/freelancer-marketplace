import { Request, Response } from "express";
import { signJwt } from "../utils/jwt";
import { cookieOptions } from "../utils/cookieOptions";
import { generatePasswordResetToken, findUserByResetToken, resetUserPassword } from "../services/user.service";
import { sendPasswordResetEmail } from "../services/email.service";

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

/**
 * Initiate password reset flow: generate token and send email
 */
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const frontendUrl = process.env.FRONTEND_URL;
  try {
    const { token, user } = await generatePasswordResetToken(email);
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, resetLink);
    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    // still respond with 200 to avoid disclosing user existence
    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  }
};

/**
 * Complete reset: validate token and set new password
 */
export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  try {
    const user = await findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }
    await resetUserPassword(user, password);
    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Could not reset password.' });
  }
};
