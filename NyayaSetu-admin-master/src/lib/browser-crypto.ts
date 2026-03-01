/**
 * Browser-compatible cryptographic utilities for NyayaSetu.
 * Uses the Web Crypto API (window.crypto.subtle) for zero-trust client-side encryption.
 */

export async function generateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function encryptFile(file: File): Promise<{
    encryptedBlob: Blob;
    encryptionKeyHex: string;
    ivHex: string;
}> {
    const arrayBuffer = await file.arrayBuffer();

    // 1. Generate a random AES-GCM key
    const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    // 2. Generate a random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // 3. Encrypt the data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        arrayBuffer
    );

    // 4. Export the key to hex for storage
    const exportedKey = await window.crypto.subtle.exportKey('raw', key);
    const keyHex = Array.from(new Uint8Array(exportedKey))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    const ivHex = Array.from(iv)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return {
        encryptedBlob: new Blob([encryptedBuffer], { type: 'application/octet-stream' }),
        encryptionKeyHex: keyHex,
        ivHex: ivHex
    };
}

/**
 * Decrypts a blob using the provided hex key and iv.
 */
export async function decryptFile(
    encryptedBlob: Blob,
    keyHex: string,
    ivHex: string
): Promise<ArrayBuffer> {
    const encryptedBuffer = await encryptedBlob.arrayBuffer();

    const keyArray = new Uint8Array(keyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const ivArray = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    const key = await window.crypto.subtle.importKey(
        'raw',
        keyArray,
        'AES-GCM',
        true,
        ['decrypt']
    );

    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivArray },
        key,
        encryptedBuffer
    );

    return decryptedBuffer;
}

/**
 * RSA Asymmetric Encryption (Hybrid Flow)
 */

export async function importPublicKey(pem: string): Promise<CryptoKey> {
    const cleanPem = pem.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, '').replace(/[\s\r\n]/g, '');
    const binary = window.atob(cleanPem);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    return window.crypto.subtle.importKey(
        'spki',
        bytes.buffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['encrypt']
    );
}

export async function importPrivateKey(pem: string): Promise<CryptoKey> {
    // Sanitize PEM: remove headers, white spaces, and newlines (handle CRLF)
    const cleanPem = pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/[\s\r\n]/g, '');
    const binary = window.atob(cleanPem);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    return window.crypto.subtle.importKey(
        'pkcs8',
        bytes.buffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['decrypt']
    );
}

export async function encryptWithPublicKey(publicKeyPem: string, data: string): Promise<string> {
    const publicKey = await importPublicKey(publicKeyPem);
    const encodedData = new TextEncoder().encode(data);
    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        encodedData
    );
    return window.btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
}

export async function decryptWithPrivateKey(privateKeyPem: string, base64Data: string): Promise<string> {
    const privateKey = await importPrivateKey(privateKeyPem);
    const encryptedBuffer = new Uint8Array(
        window.atob(base64Data).split('').map(c => c.charCodeAt(0))
    );
    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encryptedBuffer
    );
    return new TextDecoder().decode(decryptedBuffer);
}

export async function generateRSAKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
    );

    const exportedPublic = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    const exportedPrivate = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    const toPem = (buf: ArrayBuffer, label: string) => {
        const b64 = window.btoa(String.fromCharCode(...new Uint8Array(buf)));
        return `-----BEGIN ${label}-----\n${b64.match(/.{1,64}/g)!.join('\n')}\n-----END ${label}-----`;
    };

    return {
        publicKey: toPem(exportedPublic, 'PUBLIC KEY'),
        privateKey: toPem(exportedPrivate, 'PRIVATE KEY'),
    };
}
