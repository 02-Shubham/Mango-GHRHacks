// node -r esbuild-register src/scripts/test-ledger-fetch.ts (if using esbuild)
// or just a simple node script if compiled

import { fetchAllBlockchainCases } from '../lib/blockchain-server';

async function test() {
    console.log("--- Testing Ledger Fetch ---");
    const cases = await fetchAllBlockchainCases();
    console.log(`Found ${cases.length} blockchain cases.`);
    cases.forEach(c => {
        console.log(`ID: ${c.id}, Dept: ${c.department}, Status: ${c.status}`);
    });
    console.log("--- End of Test ---");
}

test();
