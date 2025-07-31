import { Router } from "express";
import { userMiddleware } from "../middlewares/user.middleware";
import {
  fetchUserChats,
  fetchChatMessages,
  startOrGetChat,
  sendMessageRest,
  deleteChat,
  updateMessage,
  deleteMessage,
  uploadImage,
} from "../controllers/chat.controller";
import multer from "multer";

const router = Router();
const upload = multer();

router.use(userMiddleware);

router.get("/", fetchUserChats);
router.get("/:chatId/messages", fetchChatMessages);
router.post("/:chatId/upload", upload.single("image"), uploadImage);
router.post("/:chatId/messages", sendMessageRest);
router.put("/:chatId/messages/:messageId", updateMessage);
router.delete("/:chatId/messages/:messageId", deleteMessage);
router.post("/start", startOrGetChat);
router.delete("/:chatId", deleteChat);

export default router;
