import { ChunkInterface } from "../db/model/chunk.schema";
import { MessageInterface } from "../db/model/message.schema";

export type Source = {
    documentId: string;
    page: number;
    title: string;
    distance: number;
};
export type ChunkMetadata = {
    loc?: {
        lines?: {
            from?: number;
            to?: number;
        };
        pageNumber?: number;
    };

    pdf?: {
        info?: {
            Title?: string;
        };
        totalPages?: number;
    };

    source?: string;
    blobType?: string;
};
export type Chunk ={
  id: number,
  document_id: string,
  chunk_index: number,
  content: string,
  distance: number,
  metadata: ChunkMetadata,
  embedding:number[],
  createdAt: Date,
  updatedAt:Date
}
export  type StateType = {
    question: string,
    conversation_id: string,
    documentIds: string[],
    searchQuery: string,
    retrievedChunks: Chunk[],
    contextSufficient: boolean,
    retryCount: number,
    evaluationReason: string,
    answer: string,
    relevantChunkIndexes: number[],
    conversationHistory: MessageInterface[],
    sources: Source[],
}