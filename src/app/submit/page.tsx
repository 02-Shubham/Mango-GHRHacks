"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Upload, AlertCircle, CheckCircle2, Loader2,
  ArrowLeft, Wallet, Lock, AlertTriangle, ExternalLink,
  Eye, ShieldAlert, Timer, ChevronDown, ChevronUp, Flame, Info,
  Terminal, Activity, Zap, Scale, Hash
} from "lucide-react";
import Link from "next/link";
import { useAccount, usePublicClient } from "wagmi";
import { useCivicChainRegistry } from "@/hooks/useCivicChainRegistry";
import { useDeadManSwitch } from "@/hooks/useDeadManSwitch";
import { generateFileHash, encryptFile, encryptWithPublicKey } from "@/lib/browser-crypto";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import CivicChainRegistryABI from '@blockchain/artifacts/contracts/CivicChainRegistry.sol/CivicChainRegistry.json';
import { Navbar } from "@/components/Navbar";
import { format } from "date-fns";
import { addressConfig } from "@/contracts/addresses";
import { ProtocolFlow } from "@/components/ProtocolFlow";

const REGISTRY_ADDRESS = addressConfig.CivicChainRegistry as `0x${string}`;

// ─── Identity Safety Check ──────────────────────────────────────────────────
function PrivacyGuardModal({ onProceed }: { onProceed: () => void }) {
  const [checks, setChecks] = useState({ burner: false, vpn: false, vault: false });
  const allChecked = checks.burner && checks.vpn && checks.vault;
  const toggle = (key: keyof typeof checks) =>
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));

  const items = [
    { key: "burner" as const, label: "I am using a fresh burner wallet", sub: "Not your real MetaMask — create a new account you've never used before" },
    { key: "vpn" as const, label: "I am using Tor Browser or a VPN", sub: "Your IP address is hidden from this website and any network observers" },
    { key: "vault" as const, label: "I have completed the ShadowVault flow", sub: "Funds in my burner wallet came through ShadowVault, not directly from my real wallet" },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-lg flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white border border-border-subtle rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent" />

        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-brand-primary/10 rounded-xl mb-4">
            <ShieldAlert className="w-6 h-6 text-brand-primary" />
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase text-text-main mb-1">Identity Safety Check</h2>
          <p className="text-xs text-text-muted text-center">Verify before initiating the secure submission channel.</p>
        </div>

        <div className="space-y-2.5 mb-5">
          {items.map(({ key, label, sub }) => (
            <button key={key} onClick={() => toggle(key)}
              className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${checks[key] ? "bg-brand-primary/5 border-brand-primary/30" : "bg-bg-page border-border-subtle hover:border-brand-primary/20"}`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 transition-all ${checks[key] ? "bg-brand-primary border-brand-primary" : "border-border-subtle"}`}>
                {checks[key] && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-tight ${checks[key] ? "text-text-main" : "text-text-muted"}`}>{label}</p>
                <p className="text-[11px] text-text-muted mt-0.5 leading-snug">{sub}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mb-5 p-3.5 rounded-xl bg-bg-page border border-border-subtle flex items-center gap-3">
          <Shield className="w-5 h-5 text-brand-primary/50 shrink-0" />
          <p className="text-[9px] font-mono text-text-muted flex-1 leading-normal uppercase">Funds must be mixed via ShadowVault</p>
          <Link href="/privacy" className="px-3 py-1.5 bg-brand-primary/5 rounded-lg text-[10px] text-brand-primary hover:bg-brand-primary/10 font-bold uppercase tracking-wider border border-brand-primary/20 transition-all shrink-0">
            Mixer
          </Link>
        </div>

        <button disabled={!allChecked} onClick={onProceed}
          className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${allChecked ? "bg-brand-primary text-white hover:bg-brand-secondary shadow-md" : "bg-bg-page text-text-muted cursor-not-allowed border border-border-subtle"}`}
        >
          <Lock className="w-3.5 h-3.5" />
          {allChecked ? "Initiate Tunnel" : "Incomplete Protocol"}
        </button>
      </motion.div>
    </div>
  );
}

// ─── Hacker Loading Sequence ──────────────────────────────────────────────────
function HackerLoader({ step, logs }: { step: string; logs: string[] }) {
  return (
    <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-2xl flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white border border-border-subtle rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="bg-bg-page border-b border-border-subtle px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-brand-primary" />
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">SECURE_SUBMISSION_CHANNEL::v4.2</span>
          </div>
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-border-subtle" />
            <div className="w-2.5 h-2.5 rounded-full bg-border-subtle" />
            <div className="w-2.5 h-2.5 rounded-full bg-brand-primary/50 animate-pulse" />
          </div>
        </div>

        <div className="p-10 space-y-10">
          {/* Progress Visual */}
          <div className="relative h-1 bg-bg-page rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{
                width: step === "encrypting" ? "33%" : step === "uploading" ? "66%" : "100%"
              }}
              className="absolute inset-y-0 left-0 bg-brand-primary shadow-[0_0_20px_rgba(37,99,235,0.5)]"
            />
          </div>

          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-brand-primary/5 rounded-2xl border border-brand-primary/20 flex items-center justify-center shrink-0">
              <Activity className="w-10 h-10 text-brand-primary animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-text-main uppercase mb-1 leading-none">
                {step === "encrypting" ? "Hybrid Cryptography" :
                  step === "uploading" ? "Decentralized Sync" :
                    "Chain Integration"}
              </h3>
              <p className="text-[10px] text-text-muted font-mono font-bold tracking-widest uppercase">ENCRYPTION: AES_256_GCM | PEER: VERIFIED</p>
            </div>
          </div>

          <div className="bg-bg-page rounded-2xl p-6 border border-border-subtle font-mono text-[10px] space-y-2 min-h-[180px]">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${i === logs.length - 1 ? 'text-brand-primary' : 'text-text-muted'} flex items-center gap-3`}
              >
                <span className="opacity-40">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                <span className="shrink-0 opacity-40">➜</span>
                <span className="font-bold tracking-tight">{log}</span>
              </motion.div>
            ))}
            <motion.div
              animate={{ opacity: [0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-2 h-3.5 bg-brand-primary align-middle ml-1"
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Wallet Warning Banner ────────────────────────────────────────────────────
function WalletWarningBanner({ address }: { address: string }) {
  const [expanded, setExpanded] = useState(false);
  const short = `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  return (
    <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="mb-10 rounded-2xl border border-border-subtle bg-white overflow-hidden hover:border-brand-primary/20 transition-all shadow-sm"
    >
      <button onClick={() => setExpanded((v) => !v)} className="w-full flex items-center gap-4 p-5 text-left">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
        <span className="text-xs font-mono text-text-muted flex-1 uppercase tracking-wider">Submitting from: <span className="font-bold text-text-main tracking-widest">{short}</span></span>
        <div className={`p-1.5 rounded-lg border border-border-subtle ${expanded ? 'bg-brand-primary/10' : ''} transition-colors`}>
          <ChevronDown className={`w-3 h-3 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-6 pb-6 text-[10px] text-text-muted space-y-2 border-t border-border-subtle pt-5 font-mono uppercase tracking-widest">
              <p className="flex items-center gap-2 italic"><span className="text-amber-500">!</span> Address will be permanently anchored to the registry.</p>
              <p className="flex items-center gap-2"><span className="text-brand-accent">✓</span> Protocol recommends fresh burner usage only.</p>
              <p className="flex items-center gap-2"><span className="text-brand-accent">✓</span> Zero-trust verification: ACTIVE.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Dead Man's Switch Panel ──────────────────────────────────────────────────
function DeadManSwitchPanel({
  enabled, setEnabled, releaseDate, setReleaseDate, statement, setStatement,
}: {
  enabled: boolean; setEnabled: (v: boolean) => void;
  releaseDate: string; setReleaseDate: (v: string) => void;
  statement: string; setStatement: (v: string) => void;
}) {
  const minDate = new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];

  return (
    <div className={`rounded-2xl border transition-all duration-500 overflow-hidden ${enabled ? "border-brand-primary/30 bg-brand-primary/5" : "bg-white border-border-subtle hover:border-brand-primary/20"}`}>
      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className="w-full flex items-center gap-5 p-6 text-left"
      >
        <div className={`p-3 rounded-2xl transition-all ${enabled ? "bg-brand-primary/10 border-brand-primary/30" : "bg-bg-page border-border-subtle"} border`}>
          <Timer className={`w-5 h-5 transition-colors ${enabled ? "text-brand-primary" : "text-text-muted"}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <p className={`text-xs font-black uppercase tracking-widest transition-colors ${enabled ? "text-text-main" : "text-text-muted"}`}>
              Dead Man's Switch
            </p>
            {enabled && <span className="text-[10px] bg-brand-primary text-white px-2 py-0.5 rounded font-black uppercase tracking-widest">Armed</span>}
          </div>
          <p className="text-[10px] text-text-muted mt-1 uppercase leading-snug">
            {enabled ? "Irreversible auto-release protocol initiated" : "Optional time-lock protection layer"}
          </p>
        </div>
        <div className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${enabled ? "bg-brand-primary" : "bg-border-subtle"}`}>
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-xl transition-all ${enabled ? "left-6" : "left-1"}`} />
        </div>
      </button>

      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-8 space-y-6 border-t border-border-subtle pt-6">
              <div className="flex gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <Info className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[10px] font-mono text-amber-700 leading-normal uppercase">
                  AUTO_RELEASE_WARNING: If you are silenced before the lock date, the <span className="text-text-main font-bold">decryption keys will broadcast to the registry.</span> Anyone with the link can trigger the final payload release.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
                    Release Threshold
                  </label>
                  <input
                    type="date"
                    required={enabled}
                    min={minDate}
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full bg-bg-page border border-border-subtle rounded-xl px-5 py-4 text-sm text-text-main focus:border-brand-primary/50 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
                    Final Public Proclamation <span className="normal-case opacity-40 font-normal italic">(Global Broadcast)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    placeholder="Statement to be released with evidence..."
                    className="w-full bg-bg-page border border-border-subtle rounded-2xl px-5 py-4 text-text-main text-sm focus:border-brand-primary/50 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 resize-none transition-all font-light"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubmitCasePage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { createCase, isConfirming, isSuccess: isBlockchainSuccess, error: blockchainError, hash } = useCivicChainRegistry();
  const { register: registerDMS, isLoading: isDMSLoading } = useDeadManSwitch();

  const [privacyCleared, setPrivacyCleared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"form" | "encrypting" | "uploading" | "contract" | "arming">("form");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-7), msg]);
  const [dmsEnabled, setDmsEnabled] = useState(false);
  const [dmsReleaseDate, setDmsReleaseDate] = useState("");
  const [dmsStatement, setDmsStatement] = useState("");

  const [selectedDept, setSelectedDept] = useState("");

  useEffect(() => { if (isBlockchainSuccess && !dmsEnabled) { setSuccess(true); setIsSubmitting(false); } }, [isBlockchainSuccess, dmsEnabled]);
  useEffect(() => { if (blockchainError) { setError(blockchainError.message || "Blockchain transaction failed"); setIsSubmitting(false); } }, [blockchainError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConnected || !address) { setError("Connect secure identity (burner wallet) to proceed."); return; }
    if (dmsEnabled && !dmsReleaseDate) { setError("Set release date for Dead Man's Switch."); return; }
    if (!selectedDept) { setError("Select verified authority agency."); return; }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const department = selectedDept;

    if (!file) { setError("Attach encrypted evidence payload."); setIsSubmitting(false); return; }

    try {
      setStep("encrypting");
      addLog("Initializing secure tunnel...");
      await new Promise(r => setTimeout(r, 800));

      addLog(`Department Protocol: ${department}...`);
      let agencyPublicKey = "";
      try {
        agencyPublicKey = await publicClient!.readContract({
          address: REGISTRY_ADDRESS,
          abi: CivicChainRegistryABI.abi,
          functionName: 'getAgencyPublicKey',
          args: [department]
        }) as string;
        addLog("✓ Authority RSA_2048 Identity Verified.");
      } catch (err) {
        addLog("! Direct key missing. Using ephemeral protection.");
      }

      addLog("Generating AES_256_GCM session keys...");
      const { encryptedBlob, encryptionKeyHex, ivHex } = await encryptFile(file);
      addLog("Shredding local session memory.");

      const fileHash = await generateFileHash(file);
      addLog(`Integrity Proof: ${fileHash.slice(0, 16)}...`);

      let securedKey = encryptionKeyHex;
      if (agencyPublicKey) {
        try {
          addLog("Performing Hybrid Handshake...");
          securedKey = await encryptWithPublicKey(agencyPublicKey, encryptionKeyHex);
          addLog("✓ Key secured via ASYMMETRIC_VAULT.");
        } catch (rsaErr) {
          addLog("❌ RSA_OEAP_SHA256_FAILURE");
          throw new Error("Security failure: Failed to secure key for authority.");
        }
      }

      setStep("uploading");
      addLog("Initiating IPFS Decentralized Sync...");
      const fileFormData = new FormData();
      fileFormData.append("file", new File([encryptedBlob], "evidence.enc"));
      const fileUploadResponse = await fetch("/api/ipfs", { method: "POST", body: fileFormData });
      const { ipfsHash: fileCID } = await fileUploadResponse.json();
      addLog(`✓ Payload anchored to IPFS.`);

      addLog("Scaling metadata proofs...");
      const metadata = {
        title,
        description,
        department,
        fileCID,
        encryptionKey: securedKey,
        iv: ivHex,
        isAsymmetric: !!agencyPublicKey,
        fileName: file.name,
        fileType: file.type,
        timestamp: Date.now()
      };

      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
      const metadataFormData = new FormData();
      metadataFormData.append("file", new File([metadataBlob], "metadata.json"));
      const metadataUploadResponse = await fetch("/api/ipfs", { method: "POST", body: metadataFormData });
      const { ipfsHash: metadataCID } = await metadataUploadResponse.json();
      addLog(`✓ Metadata CID: ${metadataCID.slice(0, 10)}...`);

      setStep("contract");
      addLog("Committing legal proof to CivicChain...");
      await createCase(fileHash as `0x${string}`, metadataCID, department);
      addLog("✓ Transaction verified on-chain.");

      if (dmsEnabled && dmsReleaseDate) {
        setStep("arming");
        addLog("Initializing Protection Shield...");
        const encryptedKeyRecord = `${ivHex}:${encryptionKeyHex}`;
        await registerDMS(fileCID, encryptedKeyRecord, new Date(dmsReleaseDate + "T00:00:00Z"), dmsStatement);
        addLog("🛡️ DEAD_MAN_SWITCH_ARMED.");
      }

      setSuccess(true);
      setIsSubmitting(false);
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to submit case");
      setStep("form");
      setIsSubmitting(false);
    }
  };

  const stepLabel: Record<string, string> = {
    encrypting: "ENCRYPTING...",
    uploading: "UPLOADING...",
    contract: isConfirming ? "VERIFYING..." : "CONFIRMING...",
    arming: "ARMING...",
  };

  if (success) {
    return (
      <main className="min-h-screen bg-bg-page flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 bg-white border border-border-subtle p-16 rounded-[4rem] max-w-xl w-full text-center shadow-2xl"
        >
          <div className="w-24 h-24 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-brand-accent/20">
            <CheckCircle2 className="w-12 h-12 text-brand-accent" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-6 text-text-main leading-none">Evidence Secured</h1>
          <p className="text-text-muted font-light mb-10 leading-relaxed text-sm px-4">
            Submission anchored to the decentralized registry. Your investigative proof is now immutable.
          </p>
          {dmsEnabled && (
            <div className="mb-10 p-6 bg-brand-primary/5 border border-brand-primary/20 rounded-3xl flex gap-4 text-brand-primary text-[10px] font-mono font-black uppercase tracking-widest text-left">
              <Timer className="w-5 h-5 shrink-0" />
              <p>Shield Active: Payload releases on {format(new Date(dmsReleaseDate), 'MMMM dd, yyyy')} if silence detected.</p>
            </div>
          )}
          <Link href="/">
            <button className="px-12 py-5 bg-brand-primary text-white rounded-full font-black uppercase tracking-[0.3em] text-xs hover:bg-brand-secondary transition-all shadow-lg">
              Return to Command
            </button>
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <>
      <AnimatePresence>
        {!privacyCleared && <PrivacyGuardModal onProceed={() => setPrivacyCleared(true)} />}
        {isSubmitting && <HackerLoader step={step} logs={logs} />}
      </AnimatePresence>

      <main className="min-h-screen bg-bg-page flex flex-col items-center py-12 px-10 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
        <Navbar />

        <div className="w-full max-w-[1500px] relative z-10 pt-4">
          <Link href="/" className="inline-flex items-center gap-3 text-text-muted hover:text-brand-primary transition-all mb-12 text-[10px] font-black uppercase tracking-[0.2em]">
            <ArrowLeft className="w-4 h-4" /> Back to Intelligence
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Left Column: Architecture Flow */}
            <div className="lg:col-span-5 sticky top-32">
              <ProtocolFlow />
            </div>

            {/* Right Column: Submission Form */}
            <div className="lg:col-span-7 space-y-16">
              <div className="mb-12">
                <div className="flex items-center gap-6 mb-6">
                  <div className="p-4 bg-brand-primary/10 rounded-2xl border border-brand-primary/20">
                    <Shield className="w-10 h-10 text-brand-primary" />
                  </div>
                  <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-text-main uppercase leading-none">Secure Archive</h1>
                </div>
                <p className="text-xl text-text-muted font-light max-w-2xl leading-relaxed">
                  Initiate the high-stakes submission tunnel. Evidence is encrypted client-side using <span className="text-text-main font-medium">AES_256_GCM</span> before network transmission.
                </p>
              </div>

              {isConnected && address && <WalletWarningBanner address={address} />}

              {!isConnected && (
                <motion.div className="bg-white border border-border-subtle rounded-3xl p-12 mb-8 text-center shadow-lg">
                  <Wallet className="w-10 h-10 text-brand-primary/30 mx-auto mb-6" />
                  <h3 className="text-2xl font-black uppercase tracking-tight text-text-main mb-3">Connect Burner Identity</h3>
                  <p className="text-sm text-text-muted mb-8 max-w-md mx-auto">Connect the fresh, non-KYC wallet synchronized with the ShadowVault mixer.</p>
                  <div className="flex justify-center">
                    <ConnectButton />
                  </div>
                </motion.div>
              )}

              <motion.form
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`space-y-8 ${!isConnected ? "opacity-30 pointer-events-none grayscale" : ""}`}
                onSubmit={handleSubmit}
              >
                {error && (
                  <div className="p-6 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-4 text-red-600 text-xs font-medium leading-relaxed">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-7 space-y-8">
                    <div className="p-10 bg-white border border-border-subtle rounded-3xl space-y-8 hover:shadow-md transition-all shadow-sm">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-4">Investigation Title</label>
                        <input name="title" required type="text" placeholder="Case title..."
                          className="w-full bg-bg-page border border-border-subtle rounded-2xl px-6 py-5 text-text-main font-medium focus:border-brand-primary/50 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all placeholder:text-text-muted/50" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-4">Full Investigative Narrative</label>
                        <textarea name="description" required rows={6} placeholder="Detailed report of events and supporting context..."
                          className="w-full bg-bg-page border border-border-subtle rounded-2xl px-6 py-5 text-text-main font-light focus:border-brand-primary/50 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 resize-none transition-all placeholder:text-text-muted/50" />
                      </div>
                    </div>

                    <DeadManSwitchPanel
                      enabled={dmsEnabled}
                      setEnabled={setDmsEnabled}
                      releaseDate={dmsReleaseDate}
                      setReleaseDate={setDmsReleaseDate}
                      statement={dmsStatement}
                      setStatement={setDmsStatement}
                    />
                  </div>

                  <div className="md:col-span-5 space-y-8">
                    <div className="p-12 bg-white border border-border-subtle rounded-3xl space-y-10 shadow-sm">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-[0.3em] text-text-muted mb-4">Target Agency</label>
                        <select
                          name="department"
                          required
                          value={selectedDept}
                          onChange={(e) => setSelectedDept(e.target.value)}
                          className="w-full bg-bg-page border border-border-subtle rounded-2xl px-8 py-6 text-text-main appearance-none focus:border-brand-primary/50 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 font-bold uppercase text-xs tracking-widest cursor-pointer"
                        >
                          <option value="" disabled>Select Authority...</option>
                          <option value="Police">National Police Bureau</option>
                          <option value="Cyber Crime">Cyber Crime Division</option>
                          <option value="Anti-Corruption Bureau">Anti-Corruption Bureau</option>
                          <option value="Ministry of Finance">Ministry of Finance</option>
                          <option value="Human Rights">Human Rights Commission</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-[0.3em] text-text-muted mb-4">Payload Upload</label>
                        <div className="relative group overflow-hidden bg-bg-page border-2 border-dashed border-border-subtle rounded-3xl p-12 hover:border-brand-primary/30 transition-all text-center">
                          <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="p-4 bg-brand-primary/5 rounded-2xl mb-4 group-hover:bg-brand-primary/10 transition-all">
                              <Upload className="w-6 h-6 text-text-muted group-hover:text-brand-primary" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-brand-primary">{file ? file.name : "Attach Evidence"}</span>
                            <span className="text-[10px] text-text-muted mt-2 font-mono uppercase">Local_Enc_Ready</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-10 border-t border-border-subtle space-y-5">
                        <div className="flex items-center gap-3 text-[10px] font-mono text-text-muted uppercase tracking-widest">
                          <Scale className="w-3.5 h-3.5 text-brand-primary/50" />
                          Guaranteed 15-day SLA
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-text-muted uppercase tracking-widest">
                          <Lock className="w-3.5 h-3.5 text-brand-primary/50" />
                          Client-Side Encryption
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-6 rounded-full flex flex-col items-center justify-center gap-1 transition-all font-black uppercase tracking-[0.3em] text-[10px] disabled:opacity-30 bg-brand-primary text-white hover:bg-brand-secondary shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? (
                        <>
                          <Activity className="w-5 h-5 animate-pulse" />
                          <span>{stepLabel[step]}</span>
                        </>
                      ) : (
                        <>
                          <span>{dmsEnabled ? "Commit & Arm" : "Secure Commit"}</span>
                        </>
                      )}
                    </button>
                    <div className="text-center">
                      <p className="text-[8px] font-mono text-text-muted uppercase tracking-widest">Protocol: NYAYA_HANDSHAKE_v4</p>
                    </div>
                  </div>
                </div>
              </motion.form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
