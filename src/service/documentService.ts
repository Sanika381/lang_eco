import { sequelize } from "../db/dbConnect"
import Conversation from "../db/model/conversation.schema"
import Document from "../db/model/document.schema"
import ConversationDocument from "../db/model/convodoc.schema"
import { injestion } from "./injestionService"

class DocumentService {

    async createDocument(file: Express.Multer.File, conversationId: string) {
        const conversation = await Conversation.findOne({ where: { id: conversationId } })

        if (!conversation) {
            throw new Error("Conversation not found")
        }
        console.log("here1");
        
        const transaction = await sequelize.transaction()
        try {
            const document = await Document.create({
                filename: file?.originalname,
                doc_path: null,
            }, { transaction })
            await ConversationDocument.create({
                conversation_id: conversationId,
                document_id: document.id,
            }, { transaction })
            console.log("here2");
            
            await injestion(file,document.id, transaction)
            await transaction.commit()
            return document
        } catch (error) {
            console.log(error)
            await transaction.rollback()
            throw error
        }
    }
}

export default new DocumentService()