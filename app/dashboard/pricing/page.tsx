
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display text-white mb-2">Plans & Pricing</h1>
                <p className="text-zinc-400 max-w-2xl">
                    Choose the level of privacy that suits you. Start exploring with our free beta tier.
                </p>

                <div className="mt-6 p-4 bg-neon-pink/10 border border-neon-pink/20 rounded-lg inline-block">
                    <p className="text-neon-pink text-sm font-bold flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-pink opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-pink"></span>
                        </span>
                        Currently Free During Beta
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
                {/* Free Tier */}
                <div className="relative p-8 rounded-2xl bg-zinc-900 border-2 border-neon-pink flex flex-col gap-6 shadow-[0_0_20px_rgba(247,39,152,0.1)]">
                    <div className="absolute top-0 right-0 bg-neon-pink text-black text-xs font-bold px-3 py-1 rounded-bl-lg font-mono uppercase tracking-wider">Current Plan</div>
                    <div>
                        <h3 className="text-2xl font-display text-white">Explorer</h3>
                        <div className="text-5xl font-display text-white mt-4">$0 <span className="text-xl text-zinc-500 font-sans font-normal">/mo</span></div>
                        <p className="text-zinc-400 text-sm mt-2">Perfect for trying out privacy.</p>
                    </div>
                    <div className="h-px bg-white/10" />
                    <ul className="space-y-4 flex-1">
                        <li className="flex gap-3 items-center text-sm text-zinc-300"><Check size={18} className="text-neon-pink" /> Standard ZK Proofs</li>
                        <li className="flex gap-3 items-center text-sm text-zinc-300"><Check size={18} className="text-neon-pink" /> 15 Links / Month</li>
                        <li className="flex gap-3 items-center text-sm text-zinc-300"><Check size={18} className="text-neon-pink" /> 30-Day Expiry</li>
                        <li className="flex gap-3 items-center text-sm text-zinc-300"><Check size={18} className="text-neon-pink" /> SOL & USDC Support</li>
                    </ul>
                    <Button variant="outline" disabled className="w-full opacity-50 cursor-not-allowed uppercase font-bold tracking-widest text-xs">Active</Button>
                </div>

                {/* Pro Tier */}
                <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col gap-6 opacity-60 hover:opacity-100 transition-all duration-300 hover:border-white/20">
                    <div>
                        <h3 className="text-2xl font-display text-white">Pro</h3>
                        <div className="text-5xl font-display text-white mt-4">$19 <span className="text-xl text-zinc-500 font-sans font-normal">/mo</span></div>
                        <p className="text-zinc-500 text-sm mt-2">For power users.</p>
                    </div>
                    <div className="h-px bg-white/5" />
                    <ul className="space-y-4 flex-1">
                        <li className="flex gap-3 items-center text-sm text-zinc-400"><Check size={18} className="text-zinc-600" /> Enhanced Privacy</li>
                        <li className="flex gap-3 items-center text-sm text-zinc-400"><Check size={18} className="text-zinc-600" /> 100 Links / Month</li>
                        <li className="flex gap-3 items-center text-sm text-zinc-400"><Check size={18} className="text-zinc-600" /> Permanent Links</li>
                        <li className="flex gap-3 items-center text-sm text-zinc-400"><Check size={18} className="text-zinc-600" /> Private Invoicing</li>
                    </ul>
                    <Button variant="outline" disabled className="w-full uppercase font-bold tracking-widest text-xs">Coming Soon</Button>
                </div>

                {/* Enterprise */}
                <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col gap-6 opacity-60 hover:opacity-100 transition-all duration-300 hover:border-white/20">
                    <div>
                        <h3 className="text-2xl font-display text-white">Enterprise</h3>
                        <div className="text-5xl font-display text-white mt-4">Custom</div>
                        <p className="text-zinc-500 text-sm mt-2">Scale with compliance.</p>
                    </div>
                    <div className="h-px bg-white/5" />
                    <ul className="space-y-4 flex-1">
                        <li className="flex gap-3 items-center text-sm text-zinc-400"><Check size={18} className="text-zinc-600" /> Custom Privacy Rails</li>
                        <li className="flex gap-3 items-center text-sm text-zinc-400"><Check size={18} className="text-zinc-600" /> Vanity Subdomains</li>
                        <li className="flex gap-3 items-center text-sm text-zinc-400"><Check size={18} className="text-zinc-600" /> API Access</li>
                        <li className="flex gap-3 items-center text-sm text-zinc-400"><Check size={18} className="text-zinc-600" /> Audit Logs</li>
                    </ul>
                    <Button variant="outline" disabled className="w-full uppercase font-bold tracking-widest text-xs">Contact Sales</Button>
                </div>
            </div>
        </div>
    )
}
