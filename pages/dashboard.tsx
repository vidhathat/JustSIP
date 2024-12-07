import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import { createPublicClient, createWalletClient, custom, parseEther } from 'viem';
import { base } from 'viem/chains';

export default function DashboardPage() {
  const [transactionResult, setTransactionResult] = useState(null);
  const router = useRouter();
  const { authenticated, user, wallet } = usePrivy();

  const handleSendTransaction = async () => {
    try {
      // Ensure wallet is connected
      if (!wallet) {
        alert("Please connect a wallet first");
        return;
      }

      // Create wallet client using the connected wallet
      const walletClient = createWalletClient({
        chain: base,
        transport: custom(wallet.walletClient)
      });

      // Create public client for network interactions
      const publicClient = createPublicClient({
        chain: base,
        transport: custom(wallet.walletClient)
      });

      // Transaction parameters
      const transaction = {
        to: '0x2c682afd9f8aafa8d9caa50fedfdd89ebcf9c3d8', // Target address
        value: parseEther('0.00001'), // Converts ETH to Wei properly
        data: "0x",
        chainId: 8453
      };

      // Send transaction
      const transactionHash = await walletClient.sendTransaction({
        account: wallet.address,
        ...transaction
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: transactionHash 
      });

      setTransactionResult({
        success: true,
        transactionHash: transactionHash,
        receipt: receipt
      });
    } catch (error) {
      console.error("Transaction error:", error);
      setTransactionResult({
        success: false,
        error: error.message
      });
    }
  };

  // Redirect if not authenticated
  if (!authenticated) {
    router.push("/");
    return null;
  }

  return (
    <main className="flex flex-col min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button 
          onClick={handleSendTransaction}
          disabled={!wallet}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          Send Transaction
        </button>
      </div>

      {/* Transaction Result Display */}
      {transactionResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Transaction Result</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(transactionResult, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}