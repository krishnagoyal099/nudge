"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
    {
        number: "01",
        title: "Connect & Sign",
        description: "Connect your wallet and sign a message. This derives your unique stealth identity — unlinkable to your main address.",
    },
    {
        number: "02", 
        title: "Get Your Blink",
        description: "Instantly receive a shareable payment link. Customize your slug and share it anywhere — X, Discord, your website.",
    },
    {
        number: "03",
        title: "Receive Privately",
        description: "When someone pays, funds are ZK-compressed instantly. They arrive shielded in your stealth account.",
    },
    {
        number: "04",
        title: "Withdraw Anytime",
        description: "Move funds to your main wallet with one click. No connection to original senders, complete privacy preserved.",
    },
];

export function HowItWorks() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    return (
        <section className="relative overflow-hidden" id="how-it-works">
            {/* Background */}
            

            <div className="relative z-10 max-w-7xl mx-auto px-6" ref={sectionRef}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-6xl font-display text-white mb-6">
                        How It Works<span className="text-neon-yellow">.</span>
                    </h2>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Four simple steps to financial privacy. No complexity, no compromises.
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-neon-pink via-neon-yellow to-cyan-500 opacity-20 hidden md:block" />

                    <div className="space-y-12 md:space-y-24">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                transition={{ duration: 0.8, delay: index * 0.2 }}
                                className={`flex flex-col md:flex-row items-center gap-8 ${
                                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                                }`}
                            >
                                {/* Number Circle */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-pink to-neon-orange flex items-center justify-center">
                                        <span className="text-xl font-display text-white">{step.number}</span>
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-pink to-neon-orange blur-lg opacity-30" />
                                </div>

                                {/* Content Card */}
                                <div className={`flex-1 max-w-lg ${index % 2 === 1 ? "md:text-right" : ""}`}>
                                    <div className="p-8 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-colors duration-300">
                                        <h3 className="text-2xl font-display text-white mb-4">{step.title}</h3>
                                        <p className="text-zinc-400 leading-relaxed">{step.description}</p>
                                    </div>
                                </div>

                                {/* Spacer for alternating layout */}
                                <div className="flex-1 hidden md:block" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="mt-24 text-center"
                >
                    <div className="inline-flex flex-col sm:flex-row items-center gap-6">
                        <div className="flex items-center gap-2 text-zinc-500">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm">No KYC required</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
