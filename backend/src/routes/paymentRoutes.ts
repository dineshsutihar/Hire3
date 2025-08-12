import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const router = Router();

const RPC_URL = process.env.SOLANA_RPC || "https://api.devnet.solana.com";
const ADMIN_WALLET = process.env.SOLANA_ADMIN as string | undefined;
const PLATFORM_FEE_SOL = parseFloat(
  process.env.SOLANA_PLATFORM_FEE_SOL || "0.01"
);
export const getRequiredLamports = () =>
  Math.round(PLATFORM_FEE_SOL * LAMPORTS_PER_SOL);

// POST /payments/verify
// Body: { signature: string, expectedLamports?: number } // expectedLamports ignored; server computes requirement
router.post("/payments/verify", authMiddleware, async (req, res, next) => {
  try {
    const { signature } = req.body as { signature?: string };
    if (!signature)
      return res.status(400).json({ message: "Missing signature" });
    if (!ADMIN_WALLET)
      return res.status(500).json({ message: "Missing SOLANA_ADMIN env" });

    // Check if we've already recorded this signature
    const existing = await (prisma as any).payment.findUnique({
      where: { signature },
    });
    if (existing) return res.json(existing);

    const conn = new Connection(RPC_URL, "confirmed");
    const tx = await conn.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
    if (!tx || !tx.meta) {
      return res
        .status(400)
        .json({ message: "Transaction not found or not confirmed" });
    }

    const adminKey = new PublicKey(ADMIN_WALLET);
    const preBalances = tx.meta.preBalances;
    const postBalances = tx.meta.postBalances;
    const accountKeys = tx.transaction.message.getAccountKeys();

    // Find admin account index
    const adminIndex = accountKeys.staticAccountKeys.findIndex((k: PublicKey) =>
      k.equals(adminKey)
    );
    if (adminIndex === -1) {
      return res
        .status(400)
        .json({ message: "Admin wallet not in transaction" });
    }

    const delta = postBalances[adminIndex] - preBalances[adminIndex];
    const required = getRequiredLamports();
    if (delta < required) {
      return res
        .status(400)
        .json({
          message: "Insufficient lamports received",
          requiredLamports: required,
          receivedLamports: delta,
        });
    }

    const senderIndex = 0;
    const fromAddress =
      accountKeys.staticAccountKeys[senderIndex]?.toBase58() || "unknown";

    const payment = await (prisma as any).payment.create({
      data: {
        userId: req.user!.sub,
        signature,
        amountLamports: delta,
        fromAddress,
        toAddress: adminKey.toBase58(),
        status: "confirmed",
      },
    });

    res.json(payment);
  } catch (e) {
    next(e);
  }
});

export default router;

// List current user's payments
router.get("/my-payments", authMiddleware, async (req, res, next) => {
  try {
    const payments = await (prisma as any).payment.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({ payments });
  } catch (e) {
    next(e);
  }
});

// Public: get platform fee and admin address
router.get("/payments/required", async (_req, res) => {
  res.json({
    requiredLamports: getRequiredLamports(),
    admin: ADMIN_WALLET,
    rpc: RPC_URL,
  });
});
