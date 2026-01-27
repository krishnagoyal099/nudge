
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background relative selection:bg-neon-pink selection:text-white">
            <Sidebar />
            <main className="md:pl-64 min-h-screen pb-20">
                {/* Mobile Header Placeholder */}
                <div className="md:hidden p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30">
                    <span className="text-xl font-display text-white">Nudge<span className="text-neon-pink">.</span></span>
                    {/* Mobile Menu Toggle would go here */}
                </div>

                <div className="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
