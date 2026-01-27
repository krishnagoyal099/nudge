# 🛡️ Nudge - Private Payments on Solana

> **ZK-Shielded Payments via Shareable Blink URLs**

Nudge is a privacy-first payment wrapper that turns any Solana address into a secure, shareable "Blink" URL. When someone pays via your link, funds are routed through a **real ZK-compressed pool** using [Light Protocol](https://lightprotocol.com/) and deposited into a fresh, unlinked stealth address. Your main wallet identity is **never revealed on-chain**.

![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana)
![Light Protocol](https://img.shields.io/badge/Light_Protocol-ZK_Compression-10B981?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)

---

## 🎯 What Makes Nudge Special

| Feature | Description |
|---------|-------------|
| **Real ZK Proofs** | Uses Light Protocol's actual prover service - not simulated |
| **Stealth Addresses** | Deterministic keypair derived from wallet signature |
| **Blink Compatible** | Works on Twitter/X, Discord, and dial.to |
| **Non-Custodial** | You always control your funds |
| **Compliance Ready** | Export viewing key for tax/audit purposes |

---

## 🔐 How It Works

### The Privacy Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NUDGE PRIVACY FLOW                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. RECIPIENT                    2. SENDER                          │
│  ┌──────────────┐                ┌──────────────┐                  │
│  │ Main Wallet  │                │ Main Wallet  │                  │
│  │ (Hidden)     │                │ (Visible)    │                  │
│  └──────┬───────┘                └──────┬───────┘                  │
│         │                               │                          │
│         │ Signs Message                 │ Clicks Blink URL         │
│         ▼                               ▼                          │
│  ┌──────────────┐                ┌──────────────┐                  │
│  │ Stealth Key  │◄───────────────│ ZK Compress  │                  │
│  │ Derived      │   Funds go to  │ Transaction  │                  │
│  └──────┬───────┘   stealth addr └──────────────┘                  │
│         │                                                          │
│         │ Withdraw (Decompress)                                    │
│         ▼                                                          │
│  ┌──────────────┐                                                  │
│  │ Main Wallet  │ ← Funds appear without link to sender            │
│  │ (Receives)   │                                                  │
│  └──────────────┘                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Technical Steps

1. **Generate Stealth Identity**: Sign a message → derive deterministic keypair
2. **Create Blink URL**: Shareable link containing stealth public key
3. **Sender Pays**: Clicks link → wallet builds ZK compress transaction
4. **Funds Shielded**: SOL is compressed into Light Protocol Merkle tree
5. **Recipient Withdraws**: Real ZK proof generated → funds decompressed to main wallet

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A Solana wallet (Phantom, Solflare, or Backpack)
- Helius API key (free tier works)

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
```

> **Note**: You need a Helius API key because it includes the Light Protocol prover service. Get one free at [helius.dev](https://helius.dev).

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing on Devnet

### 1. Get Devnet SOL

```bash
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```

Or use [solfaucet.com](https://solfaucet.com).

### 2. Create Your Stealth Identity

1. Connect your wallet
2. Click "Create Identity"
3. Sign the message in your wallet
4. Copy your Blink URL

### 3. Test with dial.to

Once deployed, test your Blink:

```
https://dial.to/?action=solana-action:https://your-app.vercel.app/api/actions/nudge?id=YOUR_STEALTH_ID
```

### 4. Receive & Withdraw

1. Send SOL via the Blink (from a different wallet)
2. Refresh balance in the app
3. Click "Unshield & Withdraw"
4. Funds appear in your main wallet!

---

## 🏗️ Project Structure

```
nudge/
├── app/
│   ├── api/
│   │   └── actions/
│   │       └── nudge/
│   │           └── route.ts     # Solana Actions API (Blink handler)
│   ├── page.tsx                 # Main UI
│   ├── layout.tsx               # Root layout with providers
│   └── providers.tsx            # Wallet adapter setup
├── lib/
│   ├── light.ts                 # Light Protocol integration (ZK proofs)
│   └── stealth.ts               # Stealth key derivation
├── public/
│   └── nudge-logo.png           # Your logo for Blinks
└── .env.local                   # Environment variables
```

---

## 🔧 Core Technologies

| Technology | Purpose |
|------------|---------|
| **Light Protocol** | ZK Compression - real zero-knowledge proofs |
| **Solana Actions** | Blink URL standard for shareable transactions |
| **Next.js 15** | React framework with API routes |
| **Wallet Adapter** | Multi-wallet support (Phantom, Solflare, etc.) |

---

## 📊 Real ZK Proofs - Not Simulated

This project uses **real** Light Protocol ZK compression:

```typescript
// lib/light.ts - Real ZK proof generation

// 1. Fetch compressed accounts from Merkle tree
const accounts = await connection.getCompressedAccountsByOwner(stealthKey);

// 2. Request REAL validity proof from prover service
const { compressedProof, rootIndices } = await connection.getValidityProof(
    accountHashes,
    [] // No new addresses
);

// 3. Build decompress instruction with proof
const ix = await LightSystemProgram.decompress({
    payer: signer.publicKey,
    inputCompressedAccounts: accounts,
    toAddress: recipient,
    lamports: totalLamports,
    recentInputStateRootIndices: rootIndices,
    recentValidityProof: compressedProof,  // ← Real ZK proof!
});
```

The prover service is hosted by Helius and generates cryptographic proofs that verify:
- The compressed accounts exist in the Merkle tree
- The accounts are owned by the stealth key
- The state roots are valid and recent

---

## 🎖️ Compliance & Viewing Keys

For tax/auditing purposes, Nudge allows you to export a compliance report:

```json
{
  "app": "Nudge | Privacy Payments on Solana",
  "version": "1.0.0",
  "network": "devnet",
  "stealth_public_key": "ABC123...",
  "current_balance_sol": 1.5,
  "timestamp": "2024-01-27T12:00:00Z",
  "disclaimer": "This export proves ownership of the stealth address for tax/compliance purposes."
}
```

This proves you own the stealth address without revealing your main wallet.

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables for Production

```env
NEXT_PUBLIC_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_HOST_URL=https://your-app.vercel.app
```

---

## ⚠️ Known Limitations

| Limitation | Details |
|------------|---------|
| **Proof Generation Time** | ZK proofs can take 5-30 seconds |
| **Devnet Only** | Currently configured for Solana Devnet |
| **SOL Only** | SPL token support coming soon |
| **Blink Wallets** | Requires Phantom, Solflare, or Backpack |

---

## 🛣️ Roadmap

- [ ] SPL Token support (USDC, etc.)
- [ ] Mainnet deployment
- [ ] Multi-recipient splits
- [ ] Recurring private payments
- [ ] Mobile app

---

## 📄 License

MIT License - feel free to fork and build!

---

## 🙏 Acknowledgments

- [Light Protocol](https://lightprotocol.com/) - ZK Compression infrastructure
- [Helius](https://helius.dev/) - RPC + Prover service
- [Solana Actions](https://docs.dialect.to/) - Blink standard

---

<div align="center">

**Built with 🛡️ for privacy on Solana**

</div>
