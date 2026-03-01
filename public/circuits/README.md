# ShadowVault ZK Circuit Files

Place these files here after running the setup script:

```
blockchain/scripts/setup-circuits.cjs
```

Required files:
- `withdraw.wasm`        — compiled Circom circuit
- `circuit_final.zkey`  — Groth16 proving key
- `verification_key.json` — verification key

Until these are generated, the app runs in DEV_MODE (Groth16Verifier accepts all proofs).
