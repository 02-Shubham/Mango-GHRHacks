import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateFileHash } from "@/lib/crypto";
import { stripImageMetadata } from "@/lib/scrubber";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    // Using `any` cast here to bypass stricter types for turbopack node buffers
    let buffer: any = Buffer.from(arrayBuffer as ArrayBuffer);

    // [SECURITY] Apply identical EXIF stripping used during submission
    // to ensure the cryptographic hash matches the original scrubbed version precisely
    buffer = stripImageMetadata(buffer, file.type);

    const fileHash = generateFileHash(buffer);

    const existingCase = await prisma.case.findFirst({
      where: { fileHash: fileHash } // Exact string match on the sha256 fingerprint
    });

    if (existingCase) {
      return NextResponse.json({
        verified: true,
        case: {
          id: existingCase.id,
          title: existingCase.title,
          status: existingCase.status,
          createdAt: existingCase.createdAt,
          cid: existingCase.cid
        },
        message: "Cryptography Match: Evidence is Authentic & Untampered"
      });
    } else {
      return NextResponse.json({
        verified: false,
        message: "Hash Mismatch: Unrecognized or Tampered Evidence"
      });
    }

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
