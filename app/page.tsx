
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/landing/hero";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <Hero />

      {/* Features Section - Placeholder for now */}
      <section id="features" className="py-20 px-6 md:px-20 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-display mb-12 text-white">
            FEATURES <span className="text-neon-pink">UNLOCKED</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-white/10 bg-black/40 hover:border-neon-pink transition-colors group">
              <h3 className="text-2xl font-display mb-4 text-white group-hover:text-neon-pink">Stealth Mode</h3>
              <p className="font-body text-zinc-400">Generate deterministic stealth addresses that hide your identity on-chain.</p>
            </div>
            <div className="p-8 border border-white/10 bg-black/40 hover:border-neon-orange transition-colors group">
              <h3 className="text-2xl font-display mb-4 text-white group-hover:text-neon-orange">ZK Compression</h3>
              <p className="font-body text-zinc-400">Powered by Light Protocol for real zero-knowledge privacy and low fees.</p>
            </div>
            <div className="p-8 border border-white/10 bg-black/40 hover:border-neon-yellow transition-colors group">
              <h3 className="text-2xl font-display mb-4 text-white group-hover:text-neon-yellow">Blink Ready</h3>
              <p className="font-body text-zinc-400">Shareable links that work directly on Twitter, Discord, and pure web.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
