import * as Minio from "minio";
import dotenv from "dotenv";

dotenv.config();

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || "localhost",
    port: Number(process.env.MINIO_PORT || 9000),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY!,
    secretKey: process.env.MINIO_SECRET_KEY!,
});

const bucket = process.env.MINIO_BUCKET || "hsnnotifications";

export async function uploadBufferToMinio(
    buffer: Buffer,
    objectKey: string
): Promise<string> {
    await minioClient.putObject(
        bucket,
        objectKey,
        buffer,
        buffer.length,
        {
            "Content-Type": "application/pdf",
        }
    );
    return `${bucket}/${objectKey}`;
}

export async function getObjectFromMinio(objectKey: string): Promise<Buffer> {
    const stream = await minioClient.getObject(bucket, objectKey);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}