import { Router } from "express";
import passport from "passport";
import { handleGoogleCallback, handleGoogleFailure, logout, forgotPassword, resetPassword } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

authRouter.get("/google/callback", passport.authenticate("google", { failureRedirect: "/auth/google/failure", session: false }), handleGoogleCallback
);

authRouter.get("/google/failure", handleGoogleFailure);

authRouter.post("/logout", logout);

// add forgot/reset endpoints
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
