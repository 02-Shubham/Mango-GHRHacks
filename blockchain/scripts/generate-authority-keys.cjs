/**
 * generate-authority-keys.cjs
 *
 * Generates a real RSA-2048 key pair in PEM format.
 * - Public Key: To be registered on the CivicChainRegistry contract for a department.
 * - Private Key: To be used in the NyayaAdmin portal to unlock evidence.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateKeys() {
    console.log("-----------------------------------------");
    console.log("🔐 Generating Legal Authority Key Pair");
    console.log("-----------------------------------------");

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    const publicPath = path.join(__dirname, 'authority_public.pem');
    const privatePath = path.join(__dirname, 'authority_private.pem');

    fs.writeFileSync(publicPath, publicKey);
    fs.writeFileSync(privatePath, privateKey);

    console.log(`\n✅ Generated successfully!`);
    console.log(`📁 Public Key saved to: ${publicPath}`);
    console.log(`📁 Private Key saved to: ${privatePath}`);

    console.log("\n⚠️  IMPORTANT:");
    console.log("1. Use the content of 'authority_public.pem' in your registration script.");
    console.log("2. Keep 'authority_private.pem' SECRET. This is what unlocks the evidence in the Admin Portal.");
    console.log("-----------------------------------------");

    console.log("\n--- PUBLIC KEY CONTENT (Copy this into register-test-agency.cjs) ---");
    console.log(publicKey);
}

generateKeys();
