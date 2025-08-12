import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const RPC_URL =
  import.meta.env.VITE_SOLANA_RPC || "https://api.devnet.solana.com";
const ADMIN_WALLET = import.meta.env.VITE_SOLANA_ADMIN as string | undefined;

export function getConnection() {
  return new Connection(RPC_URL, "confirmed");
}

export function getProvider(): any | undefined {
  // Phantom injects window.solana
  const anyWindow = window as any;
  const provider = anyWindow?.solana;
  if (provider && provider.isPhantom) return provider;
  return undefined;
}

export async function connectWallet(): Promise<string> {
  const provider = getProvider();
  if (!provider)
    throw new Error("Phantom Wallet not found. Please install Phantom.");
  const res = await provider.connect();
  return res.publicKey?.toString?.() ?? provider.publicKey?.toString?.();
}

export async function payPlatformFee(lamports: number): Promise<string> {
  if (!ADMIN_WALLET) throw new Error("Missing VITE_SOLANA_ADMIN env");
  const provider = getProvider();
  if (!provider) throw new Error("Phantom Wallet not found.");

  const connection = getConnection();
  // Ensure connected and get public key
  const pubkey = provider.publicKey || (await provider.connect()).publicKey;
  if (!pubkey) throw new Error("Wallet not connected");

  const toPubkey = new PublicKey(ADMIN_WALLET);

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  const tx = new Transaction({
    feePayer: pubkey,
    blockhash,
    lastValidBlockHeight,
  });
  tx.add(SystemProgram.transfer({ fromPubkey: pubkey, toPubkey, lamports }));

  const signed = await provider.signAndSendTransaction(tx);
  const signature: string = signed.signature || signed;

  // Confirm
  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );
  return signature;
}

export async function ensurePlatformFeePaid(
  lamports: number
): Promise<{ signature: string }> {
  // Connect and pay in one helper
  await connectWallet();
  const signature = await payPlatformFee(lamports);
  return { signature };
}
