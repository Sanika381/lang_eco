import { Annotation, START, END, StateGraph } from "@langchain/langgraph";
import { llmService } from "../service/llmService.js";
import ConversationDocument from "../db/model/convodoc.schema.js";
import retrievalService from "../service/retrievalService.js";
import conversationService from "../service/conversationService.js";
import { Chunk, Source, StateType } from "../types/index.js";
import { ChunkInterface } from "../db/model/chunk.schema.js";
import { MessageInterface } from "../db/model/message.schema.js";

const state = Annotation.Root({
    conversation_id: Annotation<string>(),
    conversation_title: Annotation<string>(),
    question: Annotation<string>(),

    documentIds: Annotation<string[]>({
        reducer: (_, newValue) => newValue,
        default: () => [],
    }),
    searchQuery: Annotation<string>({
        reducer: (_, newValue) => newValue,
        default: () => "",
    }),
    retrievedChunks: Annotation<Chunk[]>({
        reducer: (_, newValue) => newValue,
        default: () => [],
    }),
    contextSufficient: Annotation<boolean>({
        reducer: (_, newValue) => newValue,
        default: () => false,
    }),
    retryCount: Annotation<number>({
        reducer: (_, newValue) => newValue,
        default: () => 0,
    }),
    evaluationReason: Annotation<string>({
        reducer: (_, newValue) => newValue,
        default: () => "",
    }),
    sources: Annotation<Source[]>({
        reducer: (_, newValue) => newValue,
        default: () => [],
    }),
    relevantChunkIndexes: Annotation<number[]>({
        reducer: (_, newValue) => newValue,
        default: () => [],
    }),
    conversationHistory: Annotation<MessageInterface[]>({
        reducer: (_, newValue) => newValue,
        default: () => [],
    }),
    answer: Annotation<string>(),
})

const checkDocument = async (state: StateType) => {
    const docId = await ConversationDocument.findAll({
        where: {
            conversation_id: state.conversation_id
        }
    })
    return { documentIds: docId.map((doc) => doc.document_id) }
}
const checkConvoTitle = async (state: StateType) => {
    const conversation: any = await conversationService.getConversation(state.conversation_id)
    let title = conversation?.title
    if (title === "New Chat") {
        title = await llmService.getTitle(state.question, state.conversation_id)
    }
    return {
        conversation_title: title
    }
}

const loadHistory = async (state: StateType) => {
    const messages = await conversationService.getMessages(state.conversation_id)
    
    return {
        conversationHistory: messages
    }
}
const checkDocumentRoute = async (state: StateType) => {
    if (state.documentIds.length > 0) {
        return "retrieve"
    }
    return "directLLM"
}

const retrieve = async (state: StateType) => {
    const chunks = await retrievalService.retrive(state.searchQuery, state.documentIds)

    return { retrievedChunks: chunks }
}
const evaluate = async (state: StateType) => {
    const context = state.retrievedChunks
        .map((chunk, index) => `
        [Chunk ${index}]
        ${chunk.content}
        `)
        .join("\n\n");

    const result = await llmService.evaluateContext(
        state.question,
        context
    );

    return {
        contextSufficient: result.sufficient,
        evaluationReason: result.reason,
        relevantChunkIndexes: result.relevantChunks
    };
}

const evaluateRoute = async (state: StateType) => {
    if (state.contextSufficient) {
        return "generate"
    }

    return "retry"
}

const retry = async (state: StateType) => {
    return {
        retryCount: state.retryCount + 1
    };
}

const retryRoute = async (state: StateType) => {
    if (state.retryCount < 2) {
        return "rewrite"
    }
    return "directLLM"
}

const rewrite = async (state: StateType) => {
    const prompt = `
        Rewrite the current search query into a better search query
        for finding relevant information in the user's documents.

        Original user question:
        ${state.question}

        Current search query:
        ${state.searchQuery}

        Retrieved context was insufficient.

        Return ONLY the rewritten search query.
    `;
    const newQuestion = await llmService.askWithPrompt(prompt)
    return { searchQuery: newQuestion }
}
const generate = async (state: StateType) => {
    const context = state.retrievedChunks
        .filter((_, index) =>
            state.relevantChunkIndexes.includes(index)
        )
        .map((chunk, index) => `
        Source ${index + 1}
        Document ID: ${chunk.document_id}
        Distance: ${chunk.distance}

        Content:
        ${chunk.content}
    `)
        .join("\n\n");

    const prompt = `
        Use the retrieved context to answer the user's question.

        If the context contains the answer, answer using the context.
        Do not invent information that is not supported by the context.

        Retrieved context:
        ${context}

        Question:
        ${state.question}

        Answer:
        `;
    const result = await llmService.askWithPrompt(prompt)
    const sources = state.retrievedChunks
        .filter((_, index) =>
            state.relevantChunkIndexes.includes(index)
        )
        .map((chunk) => ({
            documentId: chunk.document_id,
            page: chunk.metadata?.loc?.pageNumber,
            title: chunk.metadata?.pdf?.info?.Title,
            distance: chunk.distance,
        }));
    return {
        answer: result,
        sources: sources
    }
}

const contextualizeQuestion = async (state: StateType) => {

    
    if (state.conversationHistory.length === 0) {
        return {
            searchQuery: state.question
        };
    }
    
    const history = state.conversationHistory
        .map((message) => `${message.role}: ${message.content}`)
        .join("\n");

    const prompt = `
    Given the conversation history below, rewrite the user's
    current question into a standalone search query.

    Conversation history:
    ${history}

    Current question:
    ${state.question}

    Rules:
    - Resolve references such as "it", "they", "this", or "that"
      using the conversation history when they clearly refer to
      something previously discussed.
    - Preserve the user's original intent.
    - If the question is already standalone, return it unchanged.
    - If the current question is unrelated to the previous conversation,
      do not use the previous conversation to modify it.
    - Do not add information that is not present in the current question
      or needed to resolve an explicit reference.
    - Return ONLY the standalone search query.
`;

    const searchQuery = await llmService.askWithPrompt(prompt);
    return {
        searchQuery: searchQuery
    };
};
const directLLM = async (state: StateType) => {
    const result = await llmService.ask(state.question);
    return {
        answer: result
    }
}

const graph = new StateGraph(state)
    .addNode("checkDocument", checkDocument)
    .addNode("loadHistory", loadHistory)
    .addNode("contextualizeQuestion",contextualizeQuestion)
    .addNode("checkConvoTitle", checkConvoTitle)
    .addNode("retrieve", retrieve)
    .addNode("directLLM", directLLM)
    .addNode("evaluate", evaluate)
    .addNode("retry", retry)
    .addNode("rewrite", rewrite)
    .addNode("generate", generate)
    .addEdge(START, "loadHistory")
    .addEdge("loadHistory","contextualizeQuestion")
    .addEdge("contextualizeQuestion", "checkConvoTitle")
    .addEdge("checkConvoTitle", "checkDocument")
    .addConditionalEdges("checkDocument", checkDocumentRoute, { retrieve: "retrieve", directLLM: "directLLM" })
    .addEdge("retrieve", "evaluate")
    .addConditionalEdges("evaluate", evaluateRoute, { retry: "retry", generate: "generate" })
    .addConditionalEdges("retry", retryRoute, { rewrite: "rewrite", directLLM: "directLLM" })
    .addEdge("rewrite", "retrieve")
    .addEdge("generate", END)
    .addEdge("directLLM", END)
    .compile();

export async function runGraph(question: string, conversationId: string) {
    const result = await graph.invoke({
        conversation_id: conversationId,
        question: question,
        searchQuery: question
    })

    return result;
}
