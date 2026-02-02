import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-6 md:px-12 flex items-center justify-between bg-transparent pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="w-10 h-10 md:w-12 md:h-12 relative rounded-lg overflow-hidden">
          <Image
            src="/nudge-symbol.png"
            alt="Nudge Protocol Logo"
            fill
            className="object-cover"
          />
        </div>
        <span className="text-2xl tracking-[0.1em] uppercase text-white/80 hidden sm:block font-display">
          NUDGE
        </span>
      </div>

      <div className="flex items-center gap-8 pointer-events-auto">
        <Link
          href="https://chameleon-anchor.vercel.app"
          target="_blank"
          className="text-white/80 text-md md:text-lg font-medium tracking-[0.2em] hover:text-cyan-400 transition-colors uppercase font-display"
        >
          DOCS
        </Link>
        <Link
          href="/dashboard"
          className="text-white/80 text-md md:text-lg font-medium tracking-[0.2em] hover:text-neon-pink transition-colors uppercase font-display"
        >
          APP
        </Link>
      </div>
    </nav>
  );
}
