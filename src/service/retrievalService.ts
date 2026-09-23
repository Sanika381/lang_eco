import { getEmbedding } from "./embeddingService"
import { sequelize } from "../db/dbConnect"
import { QueryTypes } from "sequelize"
class RetriveService {
    async retrive(question: string, docId: string[],topK: number = 10) {
        console.log(question, "question in retrieve");

        const queryVector = await getEmbedding(question)
        const vectorString = `[${queryVector.join(",")}]`;

        const escapedVector = sequelize.escape(vectorString);
        const similarchunks = await sequelize.query(`
                SELECT
                    id,
                    document_id,
                    content,
                    metadata,
                    embedding <=> CAST(${escapedVector} AS vector) AS distance
                FROM chunks
                WHERE document_id IN (:docId)
                ORDER BY embedding <=> CAST(${escapedVector} AS vector)
                LIMIT :topK
            `, {
            replacements: {
                docId,
                topK
            },
            type: QueryTypes.SELECT,
        });

        // console.table(similarchunks)
        return similarchunks
    }
}

export default new RetriveService()