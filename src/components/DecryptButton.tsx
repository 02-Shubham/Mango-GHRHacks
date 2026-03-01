"use client";

import { useState } from "react";
import { Key, Loader2, Download, EyeOff } from "lucide-react";

export function DecryptButton({ caseId }: { caseId: string }) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDecrypt = async () => {
    setIsDecrypting(true);
    setError(null);
    try {
      const res = await fetch("/api/decrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Decryption failed");
      }

      setDecryptedData(data.dataUri);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDecrypting(false);
    }
  };

  if (decryptedData) {
    return (
      <div className="w-full space-y-2">
        <a
          href={decryptedData}
          download={`evidence_${caseId.split("-")[0]}.jpg`}
          className="w-full flex items-center justify-center gap-2 bg-brand-primary/10 border border-brand-primary/20 hover:bg-brand-primary/20 text-brand-primary px-4 py-3 rounded-lg transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download Evidence
        </a>
        <button
          onClick={() => setDecryptedData(null)}
          className="w-full flex items-center justify-center gap-2 bg-bg-page hover:bg-border-subtle text-text-muted px-4 py-2 rounded-lg transition-colors text-xs font-medium border border-border-subtle"
        >
          <EyeOff className="w-3 h-3" />
          Hide Evidence
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <button
        onClick={handleDecrypt}
        disabled={isDecrypting}
        className="w-full flex items-center justify-center gap-2 bg-brand-accent/10 border border-brand-accent/20 hover:bg-brand-accent/20 text-brand-accent disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg transition-colors text-sm font-medium"
      >
        {isDecrypting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Decrypting IPFS payload...
          </>
        ) : (
          <>
            <Key className="w-4 h-4" />
            Decrypt Evidence
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
