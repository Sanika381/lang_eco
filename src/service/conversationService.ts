import { sequelize } from "../db/dbConnect"
import Conversation from "../db/model/conversation.schema"
import Message from "../db/model/message.schema"
import { runGraph } from "../graph/qaGraph"


class ConversationService {
    async createConversation(data: any) {
        const { title } = data
        const conversation = await Conversation.create({
            title: title || "New Chat"
        })
        return conversation
    }

    async getConversation(Id?: string) {
        if (Id) {
            const conversation = await Conversation.findByPk(Id)
            if (!conversation) {
                throw new Error("conversation not found")
            }
            return conversation
        }
        const conversations = await Conversation.findAll()
        return conversations
    }

    async updateConversation(Id: string, data: any) {
        const { title } = data
        const conversation = await Conversation.findByPk(Id)
        if (!conversation) {
            throw new Error("conversation not found")
        }
        const updatedConversation = await Conversation.update({
            title: title
        }, {
            where: {
                id: Id
            }
        })
        return updatedConversation
    }

    async askQuestion(question: string, conversationId: string) {
        
        const transaction = await sequelize.transaction()
        try {
            
            await this.createMessage(conversationId, "User", question, transaction)
            const answer = await runGraph(question, conversationId)
            await this.createMessage(conversationId, "Assistant", answer.answer, transaction)
            await transaction.commit()
            return answer
        } catch (error: any) {
            await transaction.rollback()
            throw new Error(`Error processing question: ${error.message}`);
        }
    }

    async createMessage(conversation_id: string, role: string, message: string, transaction?: any) {
        const createMessage = await Message.create({
            conversation_id: conversation_id,
            role: role,
            content: message
        }, { transaction })
        return createMessage
    }


    async getMessages(conversation_id: string, id?: number) {
        if (id) {
            const message = await Message.findByPk(id)
            if (!message) {
                throw new Error("Message not found")
            }
            return message
        }
        const messages = await Message.findAll({
            where: {
                conversation_id: conversation_id
            },
            order: [["created_at", "ASC"]]
        })
        if (!messages) {
            console.log("No message found in this conversation")
        }
        return messages
    }
}
export default new ConversationService()