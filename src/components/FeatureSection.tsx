"use client";

import { motion } from "framer-motion";
import { Clock, TrendingUp, ShieldAlert, Database, ArrowUpRight, Activity, Shield, Lock } from "lucide-react";

const features = [
  {
    title: "Immutable Archive",
    desc: "Every submitted case and evidence file is cryptographically hashed and permanently anchored to the blockchain registry.",
    icon: Database,
    delay: 0.1
  },
  {
    title: "Zero-Trust Privacy",
    desc: "End-to-end symmetric encryption and crypto-shredding ensure whistleblowers are protected from jurisdictional retaliation.",
    icon: ShieldAlert,
    delay: 0.2
  },
  {
    title: "Public Escalation",
    desc: "Ignored cases auto-escalate to public dashboards, forcing strategic transparency when authorities fail to act.",
    icon: TrendingUp,
    delay: 0.3
  },
  {
    title: "Time-Bound SLAs",
    desc: "Smart contracts enforce a strict 15-day SLA, guaranteeing timely responses from assigned government agencies.",
    icon: Clock,
    delay: 0.4
  }
];

export function FeatureSection() {
  return (
    <section className="relative w-full max-w-7xl mx-auto py-32 px-6 flex flex-col items-center">

      {/* Header Area */}
      <div className="w-full flex flex-col items-center mb-24 text-center">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-6 bg-brand-primary/30" />
          <span className="text-brand-primary font-mono text-[10px] uppercase tracking-[0.4em] font-bold">
            Operational Excellence
          </span>
          <div className="h-px w-6 bg-brand-primary/30" />
        </div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tight text-text-main mb-6 uppercase leading-none">
          Trusted <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary">Infrastructure</span>
        </h2>
        <p className="text-text-muted max-w-xl font-normal">
          Designed for high-stakes transparency. Our decentralized architecture ensures
          that no single entity can silence the truth or manipulate records.
        </p>
      </div>

      {/* Modern Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full relative">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: feature.delay }}
            className="group relative bg-white border border-border-subtle rounded-[2.5rem] p-10 hover:shadow-xl hover:border-brand-primary/20 transition-all duration-500 flex flex-col items-start h-full"
          >
            <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/5 mb-8 group-hover:bg-brand-primary/10 transition-all">
              <feature.icon className="w-6 h-6 text-brand-primary" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-4 text-text-main group-hover:text-brand-primary transition-colors uppercase">
              {feature.title}
            </h3>
            <p className="text-sm text-text-muted font-normal leading-relaxed mb-8 flex-1">
              {feature.desc}
            </p>
            <div className="w-full pt-8 border-t border-border-subtle flex items-center justify-between text-[10px] font-mono text-text-muted group-hover:text-text-main transition-colors uppercase font-bold tracking-widest">
              <span>Protocol_0{i + 1}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-brand-primary" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Global Trust Banner */}
      <div className="mt-32 w-full p-1 border-y border-border-subtle bg-white">
        <div className="flex items-center justify-between px-8 py-3 overflow-hidden whitespace-nowrap opacity-50">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 text-[10px] font-mono text-text-muted uppercase tracking-[0.5em] font-bold">
              <Activity className="w-3 h-3 text-brand-primary/30" />
              IMMUTABLE_LOG_SYNC
              <Lock className="w-3 h-3 text-brand-primary/30" />
              AES_256_ACTIVE
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

