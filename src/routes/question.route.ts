import express from "express";
import questionController from "../controllers/question.controller";

export const router = express.Router();

router.post("/conversation/:id/ask",questionController.askQuestion);