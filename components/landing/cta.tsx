"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="relative py-32 overflow-hidden" ref={ref}>
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-t from-neon-pink/5 via-background to-background" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-t from-neon-pink/10 to-transparent blur-3xl" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-pink/10 border border-neon-pink/20 mb-8">
                        <Sparkles className="w-4 h-4 text-neon-pink" />
                        <span className="text-sm text-neon-pink font-medium">Ready to go private?</span>
                    </div>

                    {/* Heading */}
                    <h2 className="text-5xl md:text-7xl font-display text-white mb-6 leading-tight">
                        Your Privacy<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-neon-orange to-neon-yellow">
                            Starts Now
                        </span>
                    </h2>

                    {/* Subtext */}
                    <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Join the privacy revolution. Create your first stealth payment link in under 30 seconds. 
                        No sign-up, no KYC, no compromises.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button onClick={() => window.location.href = "/dashboard"} variant="primary" size="lg" className="group min-w-[200px]">
                            Launch App
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button variant="outline" size="lg" className="min-w-[200px]">
                            View Documentation
                        </Button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-zinc-500">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Open Source</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Audited Contracts</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Non-Custodial</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
