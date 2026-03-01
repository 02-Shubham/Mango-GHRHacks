// "use client";

// import { motion } from "framer-motion";
// import { Shield, Folder, Volume2, MessageSquare, Files, ArrowRight, Activity, Lock } from "lucide-react";
// import Link from "next/link";

// export function HeroSection() {
//   return (
//     <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-bg-page pt-20">

//       {/* Subtle Background Gradients */}
//       <div className="absolute top-0 w-full h-[500px] pointer-events-none overflow-hidden flex justify-center z-0">
//         <div className="absolute -top-1/2 w-full max-w-4xl h-[600px] bg-brand-primary/5 rounded-full blur-[100px] opacity-70" />
//       </div>

//       {/* Main Content */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//         className="flex flex-col items-center text-center max-w-4xl z-10 px-6 w-full"
//       >
//         <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-border-subtle rounded-full shadow-sm mb-12">
//             <Shield className="w-3.5 h-3.5 text-brand-primary" />
//             <span className="text-brand-primary font-mono text-[10px] uppercase font-bold tracking-[0.2em] relative top-px">
//                 The National Decentralized Justice Registry
//             </span>
//         </div>

//         <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-text-main leading-tight">
//           Secure Reporting. <br className="hidden md:block" />
//           <span className="text-brand-primary font-black">Immutable Accountability.</span>
//         </h1>

//         <p className="text-lg md:text-xl text-text-muted mb-12 max-w-3xl font-normal leading-relaxed">
//           NyayaSetu is a secure platform designed to protect whistleblowers and register evidence. 
//           We ensure justice through cryptographic, blockchain-anchored proofs that cannot be altered or destroyed.
//         </p>

//         <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
//           <Link href="/submit" className="w-full sm:w-auto">
//             <button className="w-full sm:w-auto group relative px-8 py-4 bg-brand-primary text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-brand-secondary transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3">
//               <Lock className="w-4 h-4" />
//               Submit Secure Report
//               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//             </button>
//           </Link>
//           <Link href="/ledger" className="w-full sm:w-auto">
//             <button className="w-full sm:w-auto px-8 py-4 bg-white border border-border-subtle rounded-xl text-xs font-bold uppercase tracking-widest text-text-main hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm">
//               <Activity className="w-4 h-4 text-brand-primary" />
//               Access Public Archive
//             </button>
//           </Link>
//         </div>
//       </motion.div>

//       {/* Feature Highlights Instead of Rotating Shield */}
//       <motion.div 
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.4, duration: 0.8 }}
//         className="w-full max-w-5xl px-6 mt-24 mb-16 z-10"
//       >
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
//                 <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
//                     <Shield className="w-5 h-5 text-brand-primary" />
//                 </div>
//                 <h3 className="text-sm font-bold text-text-main uppercase tracking-tight mb-2">Cryptographic Protection</h3>
//                 <p className="text-sm text-text-muted leading-relaxed">Advanced AES-256 encryption ensures whistleblower identities and evidence remain completely secure.</p>
//             </div>

//             <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
//                 <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
//                     <Folder className="w-5 h-5 text-brand-primary" />
//                 </div>
//                 <h3 className="text-sm font-bold text-text-main uppercase tracking-tight mb-2">Immutable Ledger</h3>
//                 <p className="text-sm text-text-muted leading-relaxed">All submitted evidence is anchored to a decentralized blockchain, establishing a permanent, tamper-proof record.</p>
//             </div>

//             <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
//                 <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
//                     <Files className="w-5 h-5 text-brand-primary" />
//                 </div>
//                 <h3 className="text-sm font-bold text-text-main uppercase tracking-tight mb-2">Transparent Verification</h3>
//                 <p className="text-sm text-text-muted leading-relaxed">The public archive allows anyone to cryptographically verify the integrity of resolved investigations.</p>
//             </div>
//         </div>
//       </motion.div>
//     </section>
//   );
// }

"use client";

import { motion } from "framer-motion";
import { Shield, Folder, Volume2, MessageSquare, Files, ArrowRight, Activity, Lock } from "lucide-react";
import Link from "next/link";
import { useState, useRef, MouseEvent } from "react";

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-bg-page pt-20"
    >

      {/* Honeycomb Hover Effect */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700"
        style={{
          opacity: isHovering ? 1 : 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='69' viewBox='0 0 40 69' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366f1' fill-opacity='0.15' fill-rule='evenodd'%3E%3Cpath d='M20 13.84l18.45 10.65v21.3L20 56.44 1.55 45.79v-21.3L20 13.84zM3.45 26.9v15.2l16.55 9.55 16.55-9.55v-15.2L20 17.35 3.45 26.9zM0 21.3l18.45-10.65V0h-3v8.52L0 17.84v3.46zm0 26.4L18.45 58.35v10.65h-3V60.48L0 51.16v-3.46zM21.55 0v10.65L40 21.3h-3v-3.46l-15.45-8.92V0h-3zm0 69v-10.65L40 47.7h-3v3.46l-15.45 8.92V69h-3z'/%3E%3C/g%3E%3C/svg%3E")`,
          maskImage: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
          WebkitMaskImage: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`
        }}
      />

      {/* Subtle Background Gradients */}
      <div className="absolute top-0 w-full h-[500px] pointer-events-none overflow-hidden flex justify-center z-0">
        <div className="absolute -top-1/2 w-full max-w-4xl h-[600px] bg-brand-primary/5 rounded-full blur-[100px] opacity-70" />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center text-center max-w-4xl z-10 px-6 w-full"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-border-subtle rounded-full shadow-sm mb-12">
          <Shield className="w-3.5 h-3.5 text-brand-primary" />
          <span className="text-brand-primary font-mono text-[10px] uppercase font-bold tracking-[0.2em] relative top-px">
            The National Decentralized Justice Registry
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-text-main leading-tight">
          Secure Reporting. <br className="hidden md:block" />
          <span className="text-brand-primary font-black">Immutable Accountability.</span>
        </h1>

        <p className="text-lg md:text-xl text-text-muted mb-12 max-w-3xl font-normal leading-relaxed">
          NyayaSetu is a secure platform designed to protect whistleblowers and register evidence.
          We ensure justice through cryptographic, blockchain-anchored proofs that cannot be altered or destroyed.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/submit" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto group relative px-8 py-4 bg-brand-primary text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-brand-secondary transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3">
              <Lock className="w-4 h-4" />
              Submit Secure Report
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/ledger" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-white border border-border-subtle rounded-xl text-xs font-bold uppercase tracking-widest text-text-main hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm">
              <Activity className="w-4 h-4 text-brand-primary" />
              Access Public Archive
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Feature Highlights Instead of Rotating Shield */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="w-full max-w-5xl px-6 mt-24 mb-16 z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-brand-primary" />
            </div>
            <h3 className="text-sm font-bold text-text-main uppercase tracking-tight mb-2">Cryptographic Protection</h3>
            <p className="text-sm text-text-muted leading-relaxed">Advanced AES-256 encryption ensures whistleblower identities and evidence remain completely secure.</p>
          </div>

          <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Folder className="w-5 h-5 text-brand-primary" />
            </div>
            <h3 className="text-sm font-bold text-text-main uppercase tracking-tight mb-2">Immutable Ledger</h3>
            <p className="text-sm text-text-muted leading-relaxed">All submitted evidence is anchored to a decentralized blockchain, establishing a permanent, tamper-proof record.</p>
          </div>

          <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Files className="w-5 h-5 text-brand-primary" />
            </div>
            <h3 className="text-sm font-bold text-text-main uppercase tracking-tight mb-2">Transparent Verification</h3>
            <p className="text-sm text-text-muted leading-relaxed">The public archive allows anyone to cryptographically verify the integrity of resolved investigations.</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
