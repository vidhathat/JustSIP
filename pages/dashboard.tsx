import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Head from "next/head";
import { parseEther } from "ethers";
import { createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';

// ... (keep other existing imports and functions)
type TransactionResult = {
  success: boolean;
  transactionHash?: string;
  error?: string;
};
export default function DashboardPage() {
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
  const router = useRouter();
  const {
    ready,
    authenticated,
    logout,
  } = usePrivy();

  // Important: Use useWallets hook to get connected wallets
  const { wallets } = useWallets();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  // Improved wallet initialization function
  const initializeWallet = async () => {
    // Ensure we have a wallet
    if (!wallets || wallets.length === 0) {
      throw new Error("No wallets connected");
    }

    // Take the first wallet
    const wallet = wallets[0];

    try {
      // Switch to Base chain
      await wallet?.switchChain(8453);

      // Get Ethereum provider
      const provider = await wallet?.getEthereumProvider();
      if (!provider) {
        throw new Error("Could not get Ethereum provider");
      }

      // Create wallet client
      return createWalletClient({
        chain: base,
        transport: custom(provider),
      });
    } catch (error) {
      console.error("Wallet initialization error:", error);
      throw error;
    }
  };

  // Improved transaction handling
  const handleSendTransaction = async () => {
    console.log("Sending transaction...");
    try {
      // Initialize wallet
      const walletClient = await initializeWallet();
      console.log("Wallet client initialized");

      // Get the first wallet's address
      const [address] = await walletClient.getAddresses();
      if (!address) {
        throw new Error("No address found");
      }
      console.log("Address found:", address);
      // Send transaction
      const hash = await walletClient.sendTransaction({
        account: address,
        to: '0x2c682afd9f8aafa8d9caa50fedfdd89ebcf9c3d8',
        value: parseEther('0.00001'),
        chain: base
      });
      console.log("Transaction sent with hash:", hash);
      setTransactionResult({
        success: true,
        transactionHash: hash
      });
    } catch (error: any) {
      console.error("Transaction error:", error);
      setTransactionResult({
        success: false,
        error: error.message
      });
    }
  };

  return (
    <>
      <Head>
        <title>Privy Auth Demo</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated ? (
          <>
            {/* ... existing code ... */}
            <div className="mt-12 flex gap-4 flex-wrap">
              {/* Send Transaction Button */}
              <button
                onClick={handleSendTransaction}
                disabled={!wallets || wallets.length === 0}
                className="text-sm bg-green-600 hover:bg-green-700 py-2 px-4 rounded-md text-white disabled:bg-gray-400"
              >
                Send Transaction
              </button>
              <button onClick={logout}>Logout</button>
              {/* ... other buttons ... */}
            </div>

            {/* Transaction Result Display */}
            {transactionResult && (
              <details className="w-full mt-4">
                <summary className="mt-6 font-bold uppercase text-sm text-gray-600">
                  Transaction Result
                </summary>
                <pre className="max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2">
                  {JSON.stringify(transactionResult, null, 2)}
                </pre>
              </details>
            )}
          </>
        ) : null}
      </main>
    </>
  );
}