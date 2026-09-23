import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import "dotenv/config";
export const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
});


export const getEmbedding = async (text: string) => {
    const embedding = await embeddings.embedQuery(text);
    console.log(embedding.length, "embedding");
    return embedding;
}


export const getembeddings = async (texts: any[]) => {
    const embeddings_data = await embeddings.embedDocuments(texts);
    console.log(embeddings_data, "embeddings");
    return embeddings_data;
}
