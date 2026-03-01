import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { decryptBuffer } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const { caseId } = await req.json();

    if (!caseId) {
      return NextResponse.json({ error: "No case ID provided" }, { status: 400 });
    }

    // 1. Fetch case from database to get the encryption keys and IPFS CID
    const targetCase = await prisma.case.findUnique({
      where: { id: caseId }
    });

    if (!targetCase || !targetCase.encryptionKey) {
      return NextResponse.json({ error: "Case not found or key has been shredded" }, { status: 404 });
    }

    // 2. Parse the symmetric IV and Key
    const cryptoPayload = JSON.parse(targetCase.encryptionKey);
    const { key, iv, authTag } = cryptoPayload;

    // 3. Fetch the raw encrypted binary blob from IPFS via our Gateway
    // In production we would use a dedicated gateway, here we use the public one defined in env
    const gatewayUrl = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${targetCase.cid}`;
    const ipfsResponse = await fetch(gatewayUrl);
    
    if (!ipfsResponse.ok) {
      return NextResponse.json({ error: "Failed to retrieve evidence from IPFS network" }, { status: 502 });
    }

    const encryptedArrayBuffer = await ipfsResponse.arrayBuffer();
    // Use any cast to satisfy turbopack node buffer type mismatch
    const encryptedBuffer: any = Buffer.from(encryptedArrayBuffer as ArrayBuffer);

    // 4. Decrypt the file securely on the server
    const decryptedBuffer = decryptBuffer(encryptedBuffer, key, iv, authTag);

    // 5. Send back as a base64 Data URI so the frontend investigator can view/download it securely
    // In a real app we would detect the mimetype properly, assuming JPEG here for the MVP demo
    const base64Data = decryptedBuffer.toString("base64");
    const dataUri = `data:image/jpeg;base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      dataUri,
      message: "Evidence successfully decrypted from IPFS"
    });

  } catch (error) {
    console.error("Decryption error:", error);
    return NextResponse.json({ error: "Internal Server Error during decryption" }, { status: 500 });
  }
}
