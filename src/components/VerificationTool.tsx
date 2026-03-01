"use client";

import { useState } from "react";
import { Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function VerificationTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = async () => {
    if (!file) return;
    
    setIsVerifying(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/verify", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ verified: false, message: "Verification failed due to an error." });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-[#020b06] border border-white/5 rounded-xl shadow-2xl overflow-hidden p-8 mb-12">
      <div className="flex items-center gap-3 mb-4">
        <Search className="w-6 h-6 text-[#10b981]" />
        <h2 className="text-xl font-medium text-white">Cryptographic Public Verification Tool</h2>
      </div>
      <p className="text-sm text-gray-400 mb-8 max-w-3xl">
        Journalists and public observers can upload leaked files here. The system will independently strip the metadata exactly as performed upon initial submission, calculate its SHA-256 fingerprint, and query the decentralized registry to cryptographically prove if the evidence is 100% authentic and untampered.
      </p>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex-1 w-full">
          <label className="block w-full border-2 border-dashed border-white/10 hover:border-[#10b981]/50 rounded-xl p-4 cursor-pointer transition-colors bg-white/2">
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                  setResult(null);
                }
              }}
            />
            <div className="flex items-center justify-center gap-3 h-[24px]">
              <span className="text-gray-400 text-sm font-medium truncate max-w-xs">
                {file ? file.name : "Select securely leaked file to authenticate..."}
              </span>
            </div>
          </label>
        </div>
        <button 
          onClick={handleVerify}
          disabled={!file || isVerifying}
          className="bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 w-full md:w-auto shrink-0 h-[60px]"
        >
          {isVerifying ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Verify Fingerprint"
          )}
        </button>
      </div>

      {result && (
        <div className={`mt-6 p-4 rounded-xl border flex items-start gap-4 ${result.verified ? 'bg-[#10b981]/10 border-[#10b981]/20' : 'bg-red-500/10 border-red-500/20'}`}>
          {result.verified ? (
            <CheckCircle2 className="w-6 h-6 text-[#10b981] shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          )}
          
          <div>
            <p className={`font-medium ${result.verified ? 'text-[#10b981]' : 'text-red-500'}`}>
              {result.message}
            </p>
            {result.verified && result.case && (
              <div className="mt-4 bg-[#041209] p-4 rounded-lg border border-[#10b981]/10 text-sm text-gray-300 space-y-2">
                <p><strong className="text-gray-500 font-medium">Matched Case Vault:</strong> {result.case.title}</p>
                <p><strong className="text-gray-500 font-medium">Original Vault Date:</strong> {formatDistanceToNow(new Date(result.case.createdAt))} ago ({new Date(result.case.createdAt).toLocaleString()})</p>
                <p><strong className="text-gray-500 font-medium">IPFS Location CID:</strong> <span className="font-mono text-xs text-[#10b981]/80">{result.case.cid}</span></p>
              </div>
            )}
            {!result.verified && (
              <p className="mt-2 text-sm text-red-400/80">
                The computed cryptographic hash of this individual file does not match any evidence currently secured on the CivicChain ledger. This document may have been structurally altered or is completely illegitimate.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
