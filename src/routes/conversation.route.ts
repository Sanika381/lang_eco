import express from "express";
import conversationController from "../controllers/conversation.controller";
export const conversationRouter = express.Router();

conversationRouter.post("/create",conversationController.createConversation)
conversationRouter.get("{/:id}",conversationController.getConversation)
conversationRouter.patch("/:id",conversationController.updateConversation)