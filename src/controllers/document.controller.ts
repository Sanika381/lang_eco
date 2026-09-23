import { Request, Response } from "express"
import DocumentService from "../service/documentService.js"
class DocumentController {

    async createDocument(req: Request, res: Response) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({ error: "No file uploaded" })
            }
            const conversationId = req.params.id as string || "816587dd-3b02-44d5-83f8-97b9123e24f5";
            if (!conversationId) {
                return res.status(400).json({ error: "Conversation ID is required" })
            }
            const document = await DocumentService.createDocument(file, conversationId)
            return res.json({ document })
        } catch (error:any) {
            return res.json({ error: `Error creating Document: --${error}` })
        }
    }

    async getDocument(req: Request, res: Response) {
        try {

        } catch (error) {
            return res.json({ error: "Error fetching Document" })
        }
    }

    async deleteDocument(req: Request, res: Response) {
        try {

        } catch (error) {
            return res.json({ error: "Error deleting Document" })
        }
    }

}

export default new DocumentController()