import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";

/**
 * Derives a deterministic "Stealth Keypair" from a user's wallet signature.
 * 
 * Logic: 
 * 1. User signs a message ("Sign to access Nudge...").
 * 2. We take the first 32 bytes of that signature as a Seed.
 * 3. We generate a valid Solana Keypair from that seed.
 * 
 * @param signature - The Uint8Array signature from the wallet
 * @returns Object containing the Stealth Public Key and Secret Key
 */
export async function deriveStealthKey(
    signature: Uint8Array
): Promise<{ publicKey: PublicKey; secretKey: Uint8Array }> {
    // 1. Use the signature as a raw seed. 
    // In production, you would run this through a SHA256 hash first for uniformity.
    const seed = signature.slice(0, 32);

    // 2. Generate keypair using TweetNaCl (Solana standard)
    const keypair = nacl.sign.keyPair.fromSeed(seed);

    return {
        publicKey: new PublicKey(keypair.publicKey),
        secretKey: keypair.secretKey
    };
}

/**
 * Helper to shorten addresses for the UI (e.g., "Abc1...Xyz9")
 */
export function truncateAddress(address: string) {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}