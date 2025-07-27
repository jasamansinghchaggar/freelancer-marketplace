import dotenv from "dotenv";
dotenv.config({
    quiet: true,
});

import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import "./configs/passport.config";
import { connectDb } from "./utils/connectDb";
import { validateImageKitConfig } from "./utils/imageKit.utils";
import userRoutes from "./routes/user.route";
import gigsRouter from "./routes/gig.route";
import authRoutes from "./routes/auth.route";
import profileRoutes from "./routes/profile.route";
import categoryRoutes from "./routes/category.route";
import purchaseRoutes from "./routes/purchase.route";

const app = express();

const PORT = process.env.PORT as string;
const BACKEND_URL = process.env.BACKEND_URL as string;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Welcome to the backend server!"
    });
});

app.use("/auth", authRoutes)
app.use("/api/v1/gigs", gigsRouter)
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/profile", profileRoutes)
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/purchases", purchaseRoutes);

const startServer = async (): Promise<void> => {
    try {
        await connectDb();
        
        // Validate ImageKit configuration
        if (!validateImageKitConfig()) {
            console.warn("⚠️  ImageKit configuration is incomplete. Image uploads may fail.");
            console.warn("Please ensure IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT are set.");
        } else {
            console.log("✅ ImageKit configuration validated successfully");
        }
        
        app.listen(PORT, () => {
            console.log(`Server is running on ${BACKEND_URL}`)
        });
    } catch (err) {
        console.error("Failed to connect to database. Server not started.");
        process.exit(1);
    }
}
startServer()