import { Router } from "express";
import { profile, signin, signout, signup } from "../controllers/user.controller";
import { userMiddleware } from "../middlewares/user.middleware";

const userRoutes = Router();

userRoutes.post("/signup", signup)
userRoutes.post("/signin", signin)
userRoutes.get("/signout", signout)
userRoutes.get("/profile", userMiddleware, profile)

export default userRoutes;