# 🛡️ Nudge - Private Payments on Solana

> **ZK-Shielded Payments via Shareable Blink URLs — Powered by Noir & Light Protocol**

Nudge is a privacy-first payment platform that turns any Solana wallet into a secure, shareable "Blink" URL. When someone pays via your link, funds are routed through **dual ZK systems** — Noir proofs for identity verification and Light Protocol for on-chain compression — depositing into a fresh, unlinked stealth address. Your main wallet identity is **never revealed on-chain**.

![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana)
![Noir](https://img.shields.io/badge/Noir-ZK_Proofs-FF6B35?style=for-the-badge)
![Light Protocol](https://img.shields.io/badge/Light_Protocol-Compression-10B981?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Helius](https://img.shields.io/badge/Helius-RPC-E84D3D?style=for-the-badge)

---

## 🏆 Hackathon Tracks

This project is built for multiple hackathon tracks:

| Track | Implementation |
|-------|----------------|
| **Noir ZK Proofs** | Client-side proof generation for stealth identity verification |
| **Helius DevTools** | RPC infrastructure with ZK compression prover service |
| **Solana Actions/Blinks** | Shareable payment links with embedded transactions |
| **Privacy Infrastructure** | End-to-end private payments on Solana |

---

## 🎯 What Makes Nudge Special

| Feature | Description |
|---------|-------------|
| **Dual ZK System** | Noir for identity proofs + Light Protocol for on-chain compression |
| **Stealth Addresses** | Deterministic keypair derived from wallet signature |
| **Custom Blink Slugs** | Nameable links like `dial.to/...nudge?id=coffee-tips` |
| **Premium Dashboard** | Awwwards-quality UI with real-time analytics |
| **Link Management** | Create, edit, delete up to 15 links (unlimited for Pro) |
| **Non-Custodial** | You always control your funds |
| **Compliance Ready** | Export viewing keys for tax/audit purposes |

---

## 🔐 How It Works

### The Privacy Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NUDGE PRIVACY FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. RECIPIENT                         2. SENDER                             │
│  ┌──────────────┐                     ┌──────────────┐                     │
│  │ Main Wallet  │                     │ Main Wallet  │                     │
│  │ (Hidden)     │                     │ (Visible)    │                     │
│  └──────┬───────┘                     └──────┬───────┘                     │
│         │                                    │                             │
│         │ Signs Message                      │ Clicks Blink URL            │
│         ▼                                    ▼                             │
│  ┌──────────────┐                     ┌──────────────┐                     │
│  │ Noir ZK      │                     │ Light        │                     │
│  │ Proof Gen    │                     │ Protocol     │                     │
│  └──────┬───────┘                     │ Compress     │                     │
│         │                             └──────┬───────┘                     │
│         ▼                                    │                             │
│  ┌──────────────┐◄───────────────────────────┘                             │
│  │ Stealth Key  │   Funds shielded to stealth addr                         │
│  │ Derived      │                                                          │
│  └──────┬───────┘                                                          │
│         │                                                                  │
│         │ Withdraw (Decompress + ZK Proof)                                 │
│         ▼                                                                  │
│  ┌──────────────┐                                                          │
│  │ Main Wallet  │ ← Funds appear without link to sender                    │
│  │ (Receives)   │                                                          │
│  └──────────────┘                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technical Implementation

1. **Noir ZK Proof**: When you unlock your identity, a Noir circuit generates a proof of ownership without revealing your wallet
2. **Stealth Key Derivation**: TweetNaCl derives a keypair from your signature — deterministic & reproducible
3. **Light Protocol Compression**: Incoming SOL is compressed into the Merkle tree, assigned to your stealth address
4. **Helius RPC**: Powers the prover service for real ZK validity proofs

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A Solana wallet (Phantom, Solflare, or Backpack)
- Helius API key (free tier works)
- Supabase project (for database)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nudge.git
cd nudge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Configuration

Edit `.env.local`:

```env
# Helius RPC URL with ZK Compression support
NEXT_PUBLIC_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY

# Your deployed URL (for Blink metadata)
NEXT_PUBLIC_HOST_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run the schema in your Supabase SQL editor:

```bash
# Located at /supabase/schema.sql
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Project Structure

```
nudge/
├── app/
│   ├── api/
│   │   ├── actions/nudge/    # Solana Blinks API
│   │   └── links/            # Link management API
│   ├── dashboard/            # Protected dashboard routes
│   │   ├── page.tsx          # Main dashboard with stats
│   │   ├── links/            # Link management
│   │   ├── pricing/          # Subscription plans
│   │   └── settings/         # User settings
│   └── page.tsx              # Landing page
├── components/
│   ├── dashboard/
│   │   ├── link-manager.tsx  # CRUD for blinks
│   │   └── stats-overview.tsx # Analytics charts
│   ├── landing/
│   │   ├── hero.tsx          # Premium hero section
│   │   ├── features.tsx      # Feature showcase
│   │   ├── how-it-works.tsx  # Process explanation
│   │   └── cta.tsx           # Call to action
│   ├── layout/
│   │   ├── navbar.tsx        # Navigation
│   │   └── sidebar.tsx       # Dashboard sidebar
│   └── ui/                   # Reusable components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── progress.tsx
│       ├── tabs.tsx
│       └── tooltip.tsx
├── lib/
│   ├── light.ts              # Light Protocol integration
│   ├── noir.ts               # Noir ZK proof generation
│   ├── stealth.ts            # Stealth key derivation
│   ├── supabase.ts           # Database client
│   └── utils.ts              # Utilities
├── contexts/
│   └── user-context.tsx      # User state management
└── supabase/
    └── schema.sql            # Database schema
```

---

## 🔧 Core Technologies

| Technology | Purpose |
|------------|---------|
| **Noir** | ZK circuit language for identity proofs |
| **Light Protocol** | On-chain ZK compression |
| **Helius** | RPC + Prover service infrastructure |
| **Solana Actions** | Blink URL standard |
| **Next.js 16** | React framework with App Router |
| **Supabase** | PostgreSQL database + Auth |
| **Recharts** | Analytics visualization |
| **Framer Motion** | Premium animations |
| **Radix UI** | Accessible components |

---

## 📊 Dashboard Features

### Link Management
- **Create** up to 15 blinks (Free) / 50 (Pro) / 200 (Enterprise)
- **Custom Slugs** — name your links (e.g., `/coffee-tips`)
- **Edit** labels and slugs anytime
- **Delete** with failsafe (warns about pending balance)

### Analytics
- **Total Received** — sum of all payments
- **Click Tracking** — see link engagement
- **Conversion Rate** — clicks to payments ratio
- **Per-Link Stats** — detailed breakdown
- **Visual Charts** — beautiful data visualization

### Compliance
- **Export Reports** — JSON with stealth key ownership proof
- **Viewing Keys** — prove ownership for tax purposes
- **Privacy Preserved** — main wallet never exposed

---

## 🔐 Noir ZK Integration

```typescript
// lib/noir.ts - Privacy proof generation

import { generateOwnershipProof, generateTransferProof } from "./noir";

// Generate proof of stealth address ownership
const proof = await generateOwnershipProof(
    stealthSecretKey,
    stealthPublicKey,
    "Nudge Identity Verification"
);

// Generate privacy proof for transfers
const transferProof = await generateTransferProof(
    senderSecret,
    recipientStealth,
    amountLamports,
    nonce
);
```

The Noir integration provides:
- **Identity Proofs**: Prove you own a stealth address without revealing your main wallet
- **Transfer Proofs**: Verify payment validity without exposing sender information
- **Nullifiers**: Prevent double-spending with deterministic nullifier generation

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Environment Variables

```env
NEXT_PUBLIC_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_HOST_URL=https://your-app.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

---

## ⚠️ Known Limitations

| Limitation | Details |
|------------|---------|
| **Proof Time** | ZK proofs can take 5-30 seconds |
| **Devnet Only** | Currently configured for Solana Devnet |
| **SOL Only** | SPL token support coming soon |
| **Blink Wallets** | Requires Phantom, Solflare, or Backpack |

---

## 🛣️ Roadmap

- [x] Noir ZK proof integration
- [x] Premium dashboard UI
- [x] Link management with custom slugs
- [x] Analytics visualization
- [ ] SPL Token support (USDC, etc.)
- [ ] Mainnet deployment
- [ ] Mobile app
- [ ] Recurring payments
- [ ] Multi-recipient splits

---

## 📄 License

MIT License - feel free to fork and build!

---

## 🙏 Acknowledgments

- [Noir Language](https://noir-lang.org/) - ZK circuit DSL
- [Light Protocol](https://lightprotocol.com/) - ZK Compression infrastructure
- [Helius](https://helius.dev/) - RPC + Prover service
- [Solana Actions](https://docs.dialect.to/) - Blink standard

---

<div align="center">

**Built with 🛡️ for privacy on Solana**

*Noir ZK • Light Protocol • Helius • Solana Actions*

</div>
