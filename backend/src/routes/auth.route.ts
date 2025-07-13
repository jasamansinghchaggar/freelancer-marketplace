import { Router } from "express";
import passport from "passport";
import { handleGoogleCallback, handleGoogleFailure } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

authRouter.get("/google/callback", passport.authenticate("google", { failureRedirect: "/auth/google/failure", session: false }), handleGoogleCallback
);

authRouter.get("/google/failure", handleGoogleFailure);

export default authRouter;
