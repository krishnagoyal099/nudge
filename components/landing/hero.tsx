"use client";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const smoothScroll = useSpring(scrollYProgress, {
        damping: 15,
        stiffness: 100,
    });

    // Modified Parallax: The whole text block moves slightly slower than scroll for depth,
    // but individual layers are LOCKED together (no relative movement).
    const yBlock = useTransform(smoothScroll, [0, 1], [0, 100]);

    return (
        <section
            ref={containerRef}
            className="relative h-[120vh] flex flex-col items-center justify-start pt-[20vh] overflow-hidden bg-background"
        >
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-neon-pink/5 to-transparent opacity-30" />
                <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-neon-orange/10 rounded-full blur-[150px] translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Typography Container */}
            <motion.div
                style={{ y: yBlock }}
                className="relative z-10 w-full max-w-full mx-auto h-[60vh] flex items-center justify-center isolate"
            >
                {/* Layer 3: Main Image Fill - CENTER */}
                <div className="relative z-20 flex items-center justify-center">
                    <h1
                        className="text-[25vw] leading-none font-display font-black tracking-[0.05em] text-transparent bg-clip-text bg-cover bg-center select-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                    >
                        <span className="bg-clip-text text-transparent bg-white bg-fixed bg-cover bg-center">
                            NUDGE
                        </span>
                    </h1>
                </div>
            </motion.div>

            {/* Readability Improved Subtext */}
            <motion.div
                style={{ y: yBlock }}
                className="relative z-40 text-center max-w-3xl px-6 -mt-10 md:-mt-20"
            >
                <h2 className="text-3xl md:text-5xl font-display text-white py-10 tracking-[0.2em] uppercase mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
                    Privacy <span className="text-neon-pink">Reimagined</span>
                </h2>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-10 z-40 mix-blend-difference"
            >
                <ArrowDown className="w-10 h-10 text-white" />
            </motion.div>
        </section>
    );
}
