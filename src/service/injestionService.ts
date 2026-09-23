import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import Chunk from "../db/model/chunk.schema";
import Document from "../db/model/document.schema";
import "dotenv/config";
import { getembeddings } from "./embeddingService";


export async function injestion(file: Express.Multer.File,docId:string, transaction: any) {
    console.log(
        "here3"
    );
    
    const buffer = Buffer.from(file.buffer);
    const blob = new Blob([buffer], { type: file.mimetype });
    const loader = new PDFLoader(blob)
    const documents = await loader.load();
    if (!documents || documents.length === 0) {
        throw new Error("No documents were loaded from the PDF.");
    }

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 200 })
    const texts = await splitter.splitDocuments(documents)
    if (texts.length === 0) {
        throw new Error("No text chunks were created from the document.");
    }
    console.log(texts[0], "here")
    const vectors = await getembeddings(texts.map((text) => text.pageContent));
    console.log(vectors[0], "vector here")
    const chunkRows = texts.map((text, index) => ({
        document_id: docId,
        chunk_index: index,
        content: text.pageContent,
        embedding: vectors[index],
        metadata: text.metadata,
    }));

    await Chunk.bulkCreate(chunkRows, { transaction: transaction });


}

