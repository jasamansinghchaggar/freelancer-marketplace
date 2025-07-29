import dotenv from "dotenv";
dotenv.config({
  quiet: true,
});

import express, { Request, Response } from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
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
import chatRoutes from "./routes/chat.route";
import { Chat } from "./models/chat.model";
import { Message } from "./models/message.model";
import { User } from "./models/user.model";
import { verifyJwt } from "./utils/jwt";

const app = express();
// Create HTTP server and Socket.IO instance
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT as string;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to the backend server!",
  });
});

app.use("/auth", authRoutes);
app.use("/api/v1/gigs", gigsRouter);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/purchases", purchaseRoutes);
app.use("/api/v1/chats", chatRoutes);

const startServer = async (): Promise<void> => {
  try {
    await connectDb();

    if (!validateImageKitConfig()) {
      console.warn(
        "ImageKit configuration is incomplete. Image uploads may fail."
      );
    } else {
      console.log("ImageKit configuration validated successfully");
    }

    // Socket.IO connection handling
    io.on("connection", (socket) => {
      // Authenticate socket user via JWT from cookies
      const cookieHeader = socket.handshake.headers.cookie;
      if (cookieHeader) {
        const token = cookieHeader
          .split(';')
          .map((c) => c.trim())
          .find((c) => c.startsWith('token='))
          ?.split('=')[1];
      if (token) {
        const decoded = verifyJwt(token);
        if (decoded && decoded.id) {
          const userId = decoded.id;
          // mark user online
          User.findByIdAndUpdate(userId, { online: true }).exec();
          // broadcast status
          io.emit('userStatus', { userId, online: true, lastSeen: null });
          // attach to socket for disconnect handling
          socket.data.userId = userId;
        }
      }
      }

      socket.on("joinChat", (chatId: string) => {
        socket.join(chatId);
      });

      socket.on("sendMessage", async (data) => {
        const { chatId, senderId, content, imageUrl } = data || {};
        if (!senderId) {
          console.warn('sendMessage: missing senderId, skipping');
          return;
        }
        // Determine receiverId from chat participants
        const chat = await Chat.findById(chatId).exec();
        if (!chat) return;
        const participants = chat.participants.map((id) => id.toString());
        const receiverId = participants.find((id) => id !== senderId);
        if (!receiverId) return;
        // Create and save message
        const newMessage = await Message.create({
          chatId,
          senderId,
          receiverId,
          content,
          imageUrl,
          isRead: false,
        });
        // Update lastMessage in chat
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: { content: content || "Image", createdAt: newMessage.createdAt },
        }).exec();
        io.to(chatId).emit("receiveMessage", newMessage);
      });

      socket.on("disconnect", () => {
        const uid = socket.data.userId;
        if (uid) {
          const lastSeenDate = new Date();
          // mark offline and record last seen
          User.findByIdAndUpdate(uid, { online: false, lastSeen: lastSeenDate }).exec();
          // broadcast status
          io.emit('userStatus', { userId: uid, online: false, lastSeen: lastSeenDate });
        }
      });
    });

    httpServer.listen(PORT, () => {
      console.log(`Server running with Socket.IO on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to database. Server not started.");
    process.exit(1);
  }
};
startServer();
