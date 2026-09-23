import {Request,Response} from "express"
import conversationService from "../service/conversationService";
class ConversationController{
    async createConversation(req:Request,res:Response){
        try {
            const data = req.body;
            const conversation = await conversationService.createConversation(data)
            return res.json({data:conversation})
        } catch (error) {
            return res.json({error:"Error creating Conversation"})
        }
    }

    async getConversation(req:Request,res:Response){
        try {
            const id=req.query.id as string
            const conversation = await conversationService.getConversation(id)
            return res.json({data: conversation})
        } catch (error) {
            return res.json({error:"Error fetching Conversation"})
        }
    }

    async updateConversation(req:Request,res:Response){
        try {
            const id=req.query.id as string
            const data = req.body
             await conversationService.updateConversation(id,data)
            return res.json({data: "conversation updated successfully!"})
        } catch (error) {
            return res.json({error:"Error updating Conversation"})
        }
    }
}

export default new ConversationController()