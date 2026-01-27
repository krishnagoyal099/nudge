import {
    Connection,
    PublicKey,
    TransactionMessage,
    VersionedTransaction,
    Keypair,
} from "@solana/web3.js";
import {
    LightSystemProgram,
    createRpc,
    CompressedAccountWithMerkleContext,
    bn,
    selectMinCompressedSolAccountsForTransfer,
    buildAndSignTx,
    Rpc,
} from "@lightprotocol/stateless.js";
import BN from "bn.js";

// ============================================================================
// CUSTOM ERROR TYPES - For proper user-facing error messages
// ============================================================================

export class NudgeError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly userMessage: string
    ) {
        super(message);
        this.name = "NudgeError";
    }
}

export class RpcConnectionError extends NudgeError {
    constructor(originalError?: Error) {
        super(
            `RPC Connection Failed: ${originalError?.message || "Unknown"}`,
            "RPC_CONNECTION_FAILED",
            "Unable to connect to Solana network. Please check your internet connection and try again."
        );
    }
}

export class ProofGenerationError extends NudgeError {
    constructor(originalError?: Error) {
        super(
            `ZK Proof Generation Failed: ${originalError?.message || "Unknown"}`,
            "PROOF_GENERATION_FAILED",
            "Failed to generate ZK proof. The prover service may be busy. Please wait a moment and try again."
        );
    }
}

export class InsufficientBalanceError extends NudgeError {
    constructor(required: number, available: number) {
        super(
            `Insufficient balance: required ${required}, available ${available}`,
            "INSUFFICIENT_BALANCE",
            `Insufficient shielded balance. You need ${required} SOL but only have ${available} SOL.`
        );
    }
}

export class NoShieldedFundsError extends NudgeError {
    constructor() {
        super(
            "No shielded funds found",
            "NO_SHIELDED_FUNDS",
            "No shielded funds found in this stealth address. Share your Blink URL to receive private payments."
        );
    }
}

export class InvalidAddressError extends NudgeError {
    constructor(address: string) {
        super(
            `Invalid Solana address: ${address}`,
            "INVALID_ADDRESS",
            "The provided wallet address is invalid. Please check and try again."
        );
    }
}

export class TransactionBuildError extends NudgeError {
    constructor(originalError?: Error) {
        super(
            `Transaction build failed: ${originalError?.message || "Unknown"}`,
            "TRANSACTION_BUILD_FAILED",
            "Failed to build transaction. Please try again or contact support if the issue persists."
        );
    }
}

// ============================================================================
// CONNECTION HELPERS - With retry logic and proper error handling
// ============================================================================

const RPC_TIMEOUT_MS = 30000; // 30 seconds timeout for RPC calls
const PROOF_TIMEOUT_MS = 60000; // 60 seconds for proof generation (ZK proofs can be slow)

/**
 * Get the Light Protocol RPC connection with validation
 */
export const getLightConnection = (): Rpc => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

    if (!rpcUrl) {
        throw new NudgeError(
            "RPC URL not configured",
            "CONFIG_ERROR",
            "Application not configured correctly. Please contact the administrator."
        );
    }

    // createRpc expects: (rpcEndpoint, compressionApiEndpoint, proverEndpoint)
    // For Helius, all three use the same URL
    return createRpc(rpcUrl, rpcUrl, rpcUrl);
};

/**
 * Get standard Solana connection for non-compressed operations
 */
export const getStandardConnection = (): Connection => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

    if (!rpcUrl) {
        throw new NudgeError(
            "RPC URL not configured",
            "CONFIG_ERROR",
            "Application not configured correctly. Please contact the administrator."
        );
    }

    return new Connection(rpcUrl, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: RPC_TIMEOUT_MS,
    });
};

/**
 * Wrapper for async operations with timeout
 */
async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string
): Promise<T> {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new NudgeError(
                `Operation timed out after ${timeoutMs}ms`,
                "TIMEOUT",
                errorMessage
            ));
        }, timeoutMs);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId!);
        return result;
    } catch (error) {
        clearTimeout(timeoutId!);
        throw error;
    }
}

// ============================================================================
// CORE FUNCTIONS - Real ZK Proofs on Devnet
// ============================================================================

/**
 * Fetch the shielded (compressed) SOL balance for a stealth address.
 * 
 * This queries the Light Protocol state tree for all compressed accounts
 * owned by the given public key and sums their lamports.
 * 
 * @param stealthPublicKey - The stealth address to check balance for
 * @returns Balance in SOL (not lamports)
 */
export async function getShieldedBalance(
    stealthPublicKey: PublicKey
): Promise<number> {
    try {
        const connection = getLightConnection();

        // Fetch all compressed accounts owned by this stealth key
        const accounts = await withTimeout(
            connection.getCompressedAccountsByOwner(stealthPublicKey),
            RPC_TIMEOUT_MS,
            "Balance check timed out. Please try again."
        );

        // Sum up all lamports across all compressed accounts
        let totalLamports = new BN(0);
        for (const account of accounts) {
            if (account.lamports) {
                totalLamports = totalLamports.add(account.lamports);
            }
        }

        // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
        return parseFloat(totalLamports.toString()) / 1_000_000_000;

    } catch (error) {
        if (error instanceof NudgeError) {
            throw error;
        }
        console.error("Failed to fetch shielded balance:", error);
        throw new RpcConnectionError(error instanceof Error ? error : undefined);
    }
}

/**
 * Build a shielded transfer transaction (Deposit/Compress).
 * 
 * This creates a transaction that:
 * 1. Takes regular SOL from the sender's wallet
 * 2. Compresses it into the Light Protocol state tree
 * 3. Assigns ownership to the recipient's stealth address
 * 
 * The transaction uses REAL ZK compression - the Light Protocol SDK
 * handles the Merkle tree insertion and proof generation.
 * 
 * @param sender - The sender's public key (payer)
 * @param recipientStealthId - The recipient's stealth public key (base58)
 * @param amountSol - Amount to send in SOL
 * @returns Unsigned VersionedTransaction ready for wallet signing
 */
export async function buildShieldedTransferTx(
    sender: PublicKey,
    recipientStealthId: string,
    amountSol: number
): Promise<VersionedTransaction> {
    // Validate inputs
    if (amountSol <= 0) {
        throw new NudgeError(
            "Amount must be positive",
            "INVALID_AMOUNT",
            "Please enter a valid amount greater than 0."
        );
    }

    if (amountSol < 0.001) {
        throw new NudgeError(
            "Amount too small",
            "AMOUNT_TOO_SMALL",
            "Minimum transfer amount is 0.001 SOL."
        );
    }

    // Validate recipient address
    let recipientPubkey: PublicKey;
    try {
        recipientPubkey = new PublicKey(recipientStealthId);
    } catch {
        throw new InvalidAddressError(recipientStealthId);
    }

    try {
        const connection = getStandardConnection();
        const amountLamports = new BN(Math.floor(amountSol * 1_000_000_000));

        // Get recent blockhash for transaction
        const { blockhash } = await withTimeout(
            connection.getLatestBlockhash("confirmed"),
            RPC_TIMEOUT_MS,
            "Failed to get recent blockhash. Please try again."
        );

        // Build the REAL Light Protocol compress instruction
        // This instruction will:
        // - Debit `amountLamports` from `sender`
        // - Create a compressed account in the Merkle tree owned by `recipientPubkey`
        const compressInstruction = await LightSystemProgram.compress({
            payer: sender,
            toAddress: recipientPubkey,
            lamports: amountLamports,
            outputStateTree: undefined, // Use default public state tree
        });

        // Build versioned transaction
        const messageV0 = new TransactionMessage({
            payerKey: sender,
            recentBlockhash: blockhash,
            instructions: [compressInstruction],
        }).compileToV0Message();

        return new VersionedTransaction(messageV0);

    } catch (error) {
        if (error instanceof NudgeError) {
            throw error;
        }
        console.error("Failed to build shielded transfer:", error);
        throw new TransactionBuildError(error instanceof Error ? error : undefined);
    }
}

/**
 * Build an unshield (decompress/withdraw) transaction.
 * 
 * This creates a transaction that:
 * 1. Fetches all compressed accounts owned by the stealth key
 * 2. Requests a REAL ZK validity proof from the prover service
 * 3. Builds a decompress instruction that nullifies the compressed accounts
 * 4. Sends the decompressed SOL to the recipient's main wallet
 * 
 * The ZK proof is generated by the Light Protocol prover service (hosted by Helius
 * or other providers). This is NOT simulated - it's a real cryptographic proof.
 * 
 * @param stealthKeypair - The stealth keypair (has spending authority)
 * @param recipientMainWallet - Where to send the unshielded SOL
 * @returns Signed transaction ready for broadcast
 */
export async function buildUnshieldTx(
    stealthKeypair: { publicKey: PublicKey; secretKey: Uint8Array },
    recipientMainWallet: PublicKey
): Promise<{ transaction: VersionedTransaction }> {
    const lightConnection = getLightConnection();
    const signer = Keypair.fromSecretKey(stealthKeypair.secretKey);

    try {
        // =====================================================================
        // STEP 1: Fetch all compressed accounts owned by the stealth key
        // =====================================================================
        console.log("[Nudge] Fetching compressed accounts...");

        const allAccounts = await withTimeout(
            lightConnection.getCompressedAccountsByOwner(stealthKeypair.publicKey),
            RPC_TIMEOUT_MS,
            "Failed to fetch shielded accounts. Please check your connection."
        );

        if (allAccounts.length === 0) {
            throw new NoShieldedFundsError();
        }

        console.log(`[Nudge] Found ${allAccounts.length} compressed account(s)`);

        // =====================================================================
        // STEP 2: Calculate total balance and select accounts
        // =====================================================================
        let totalLamports = new BN(0);
        for (const account of allAccounts) {
            if (account.lamports) {
                totalLamports = totalLamports.add(account.lamports);
            }
        }

        if (totalLamports.isZero()) {
            throw new NoShieldedFundsError();
        }

        console.log(`[Nudge] Total balance: ${totalLamports.toString()} lamports`);

        // Select accounts for withdrawal (optimizes for minimum accounts needed)
        const [selectedAccounts, selectedTotal] = selectMinCompressedSolAccountsForTransfer(
            allAccounts,
            totalLamports
        );

        console.log(`[Nudge] Selected ${selectedAccounts.length} account(s) for withdrawal`);

        // =====================================================================
        // STEP 3: Request REAL ZK Validity Proof from Prover Service
        // =====================================================================
        // This is where the magic happens! The prover service generates a
        // zero-knowledge proof that:
        // - The compressed accounts exist in the Merkle tree
        // - The accounts are owned by our stealth key
        // - The state roots are valid and recent
        //
        // This proof is cryptographically verified on-chain by the Light Program.
        // =====================================================================
        console.log("[Nudge] Requesting ZK validity proof from prover service...");

        const accountHashes = selectedAccounts.map((acc) => bn(acc.hash));

        const proofResult = await withTimeout(
            lightConnection.getValidityProof(
                accountHashes,
                [] // No new addresses for decompression
            ),
            PROOF_TIMEOUT_MS,
            "ZK proof generation timed out. The prover service may be busy. Please try again in a moment."
        );

        const { compressedProof, rootIndices } = proofResult;

        console.log("[Nudge] ZK proof received successfully!");

        // =====================================================================
        // STEP 4: Build the Decompress Instruction
        // =====================================================================
        // This instruction will:
        // - Verify the ZK proof on-chain
        // - Nullify the compressed accounts in the Merkle tree
        // - Transfer the decompressed SOL to recipientMainWallet
        // =====================================================================
        console.log("[Nudge] Building decompress instruction...");

        const decompressInstruction = await LightSystemProgram.decompress({
            payer: signer.publicKey,
            inputCompressedAccounts: selectedAccounts,
            toAddress: recipientMainWallet,
            lamports: totalLamports,
            recentInputStateRootIndices: rootIndices,
            recentValidityProof: compressedProof,
            outputStateTree: undefined, // Use default state tree
        });

        // =====================================================================
        // STEP 5: Build and Sign Transaction
        // =====================================================================
        console.log("[Nudge] Building final transaction...");

        const { blockhash } = await withTimeout(
            lightConnection.getLatestBlockhash("confirmed"),
            RPC_TIMEOUT_MS,
            "Failed to get blockhash. Please try again."
        );

        // The transaction is signed by the stealth key (proving ownership)
        // The user's main wallet will also need to sign as fee payer
        const transaction = buildAndSignTx(
            [decompressInstruction],
            signer,
            blockhash,
            [] // Additional signers if needed
        );

        console.log("[Nudge] Transaction built successfully!");

        return { transaction };

    } catch (error) {
        if (error instanceof NudgeError) {
            throw error;
        }

        // Handle specific Light Protocol errors
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes("proof") || errorMessage.includes("prover")) {
            throw new ProofGenerationError(error instanceof Error ? error : undefined);
        }

        if (errorMessage.includes("connection") || errorMessage.includes("fetch")) {
            throw new RpcConnectionError(error instanceof Error ? error : undefined);
        }

        console.error("Unshield transaction failed:", error);
        throw new TransactionBuildError(error instanceof Error ? error : undefined);
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if the RPC connection is healthy
 */
export async function checkRpcHealth(): Promise<boolean> {
    try {
        const connection = getLightConnection();
        const slot = await withTimeout(
            connection.getSlot(),
            5000,
            "RPC health check timed out"
        );
        return slot > 0;
    } catch {
        return false;
    }
}

/**
 * Check if the Light Protocol indexer is healthy
 */
export async function checkIndexerHealth(): Promise<boolean> {
    try {
        const connection = getLightConnection();
        const health = await withTimeout(
            connection.getIndexerHealth(),
            5000,
            "Indexer health check timed out"
        );
        return health === "ok";
    } catch {
        return false;
    }
}