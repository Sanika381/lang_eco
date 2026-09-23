import { runGraph } from "../graph/qaGraph";
import { Request, Response } from "express";
import conversationService from "../service/conversationService";


class QuestionController {
    async askQuestion(req: Request, res:Response) {
        try {
            let {question} = req.body;
            const conversationId = req.params.id as string
            if(!conversationId){
                throw new Error("conversation id is required")
            }
            if(!question){
            return res.json()
            }
            console.log("Request received with data:", question);
            const result = await conversationService.askQuestion(question,conversationId);
            return res.json({ answer: result });
        } catch (error: any) {
            console.error("Error handling request:", error);
            return res.status(500).json({ error: error.message || "Internal Server Error" });
        }
    }
}

export default new QuestionController();