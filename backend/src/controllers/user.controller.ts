import { Request, Response } from "express";
import {
  createUser,
  findUserByEmail,
  updateUserProfile,
  getUserById,
  getUserByIdWithPassword,
} from "../services/user.service";
import {
  signInSchema,
  signUpSchema,
  changePasswordSchema,
} from "../validations/user.validation";
import { signJwt } from "../utils/jwt";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import { cookieOptions } from "../utils/cookieOptions";
import { AuthenticatedRequest } from "../middlewares/user.middleware";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = signUpSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        message: "Invalid request data",
        errors: parseResult.error.errors,
      });
      return;
    }

    const { name, email, password, role } = parseResult.data;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        message: "User already exists with this email",
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
        role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "signup failed",
      error: error,
    });
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = signInSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        message: "Invalid request data",
        errors: parseResult.error.errors,
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
            },
          });
        } else {
          res.status(401).json({
            message: "Invalid credentials",
          });
        }
      } else {
        res.status(404).json({
          message: "User not found",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      message: "signin failed",
      error: error,
    });
  }
};

export const signout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token", cookieOptions);
    res.status(200).json({
      message: "signout successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "signout failed",
      error: error,
    });
  }
};

export const profile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        message: "Unauthorized access",
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
          profileCompleted: user.profileCompleted || false,
        },
      });
    } else {
      res.status(404).json({
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error,
    });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, email } = req.body;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }
    if (!name || !email) {
      res.status(400).json({ message: "Name and email are required" });
      return;
    }
    const updatedUser = await updateUserProfile(userId, { name, email });
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profileCompleted: updatedUser.profileCompleted || false,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error });
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const parseResult = changePasswordSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        message: "Invalid request data",
        errors: parseResult.error.errors,
      });
      return;
    }

    const { oldPassword, newPassword } = parseResult.data;

    const user = await getUserByIdWithPassword(userId);

    const match = await comparePassword(oldPassword, user?.password!);
    if (!match) {
      res.status(401).json({
        message: "Unauthorized access",
      });
      return;
    }

    const hashedNewPassword = await hashPassword(newPassword);
    await updateUserProfile(userId!, { password: hashedNewPassword });
    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to change password",
      error: error,
    });
  }
};
