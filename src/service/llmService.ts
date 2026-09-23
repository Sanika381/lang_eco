import { ChatGroq } from "@langchain/groq";
import "dotenv/config";
import Conversation from "../db/model/conversation.schema";
class LLMService {
    llm = new ChatGroq({
        model: "openai/gpt-oss-120b",
        temperature: 0
    });

    async ask(question: string) {
        const result = await this.llm.invoke(question);
        return result.content;
    }

    async askWithPrompt(prompt: string) {
        const result = await this.llm.invoke(prompt);
        return result.content;
    }
    async getTitle(question: string, conversationId: string) {
        const prompt = `
                Generate a short title for a conversation based on the user's question.

                Rules:
                - Maximum 6 words
                - Clear and descriptive
                - Do not use quotes
                - Return only the title
                - Do not add explanations

                User question:
                ${question}
                `;

        const result = await this.llm.invoke(prompt);
        await Conversation.update({
            title: result.content.toString().trim()
        }, {
            where: {
                id: conversationId
            }
        })
        return result.content.toString().trim();
    }
    async evaluateContext(question: string, context: string) {
        const prompt = `
            You are evaluating whether retrieved document context is sufficient
            to answer a user's question.

            Question:
            ${question}

            Retrieved context:
            ${context}

            Determine whether the retrieved context contains enough relevant
            information to answer the question.
            - relevantChunks must contain the indexes of chunks that contain
              information useful for answering the question.
            - Use an empty array [] if no chunk is relevant.
            - Only use indexes that actually exist.
            - sufficient is true only when the relevant chunks contain enough
              information to answer the question.
            Return ONLY valid JSON in this format:

            {
              "sufficient": true,
              "relevantChunks": [0, 2, 3],
              "reason": "short explanation"
            }

            Use false if the context is irrelevant, incomplete, or does not contain
            enough information to answer the question.
`;

        const result = await this.llm.invoke(prompt);

        return JSON.parse(result.content as string);
    }
}

export const llmService = new LLMService();