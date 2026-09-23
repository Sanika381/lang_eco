
import express from "express";
import documentController from "../controllers/document.controller";
import multer from "multer";

export const docRouter = express.Router();

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });
docRouter.post("/create", upload.single("file"), documentController.createDocument);
docRouter.get("/:id", documentController.getDocument);
docRouter.patch("/:id", documentController.deleteDocument)