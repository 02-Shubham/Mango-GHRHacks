import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT || "dummy-jwt",
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || "example-gateway.mypinata.cloud",
});

export async function POST(req: NextRequest) {
    try {
        console.log("IPFS API called. Testing Pinata Authentication...");

        try {
            const authTest = await pinata.testAuthentication();
            console.log("Auth Test Result:", authTest);
        } catch (authErr: any) {
            console.error("Pinata Auth Test Failed:", authErr.message);
            return NextResponse.json({
                error: "Pinata authentication failed. Your key lacks 'Admin' or 'pinFileToIPFS' scopes.",
                details: authErr.message
            }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Bypass for local development without keys
        if (!process.env.PINATA_JWT || process.env.PINATA_JWT === "dummy-jwt") {
            console.warn("PINATA_JWT not found. Returning dummy CID.");
            return NextResponse.json({ ipfsHash: "QmDummyHashFallback" });
        }

        const upload = await pinata.upload.file(file);
        return NextResponse.json({ ipfsHash: upload.IpfsHash });
    } catch (error) {
        console.error("IPFS Upload Error:", error);
        return NextResponse.json({ error: "Failed to upload to IPFS" }, { status: 500 });
    }
}
