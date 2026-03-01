import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
// The master key would typically be in an environment variable, 
// here we use a placeholder for the hackathon MVP or expect it from env
const MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY || crypto.randomBytes(32).toString("hex");

/**
 * Encrypts a buffer of data (like a file buffer) securely.
 * @param buffer The input file buffer
 * @returns An object containing the encrypted buffer, the iv, the auth tag, and the generated key
 */
export function encryptBuffer(buffer: Buffer): { encryptedBuffer: Buffer, key: string, iv: string, authTag: string } {
    // Generate a unique per-file encryption key (Crypto-shredding key)
    const fileKey = crypto.randomBytes(32);
    
    // Generate initialization vector
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(ALGORITHM, fileKey, iv);
    
    const encryptedBuffer = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
        encryptedBuffer,
        key: fileKey.toString("hex"),
        iv: iv.toString("hex"),
        authTag: authTag.toString("hex")
    };
}

/**
 * Decrypts a buffer using the historically saved key, iv, and auth tag.
 */
export function decryptBuffer(encryptedBuffer: Buffer, keyHex: string, ivHex: string, authTagHex: string): Buffer {
    const key = Buffer.from(keyHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    return decryptedBuffer;
}

/**
 * Generates a SHA-256 hash of a file buffer for blockchain anchoring.
 */
export function generateFileHash(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
}
