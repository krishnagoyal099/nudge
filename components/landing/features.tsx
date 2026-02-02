"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Link2, Lock, Eye, CheckCircle2 } from "lucide-react";

export function Features() {
    return (
        <section className="relative py-32 px-6 md:px-12 bg-background overflow-hidden" id="features">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-20 flex flex-col md:flex-row items-end justify-between gap-8 border-b border-white/10 pb-12">
                <div>
                    <h2 className="text-5xl md:text-7xl font-display text-white mb-4 leading-[0.9]">
                        PRIVACY<br />
                        <span className="text-zinc-500">REDEFINED</span>
                    </h2>
                </div>
                <div className="max-w-md">
                    <p className="text-xl text-zinc-400 font-body leading-relaxed">
                        Nudge isn't just a privacy tool; it's a lifestyle.
                        Experience the first high-fidelity privacy protocol on Solana.
                    </p>
                </div>
            </div>
        </section>
    );
}
