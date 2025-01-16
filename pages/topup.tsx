import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Head from "next/head";
import { parseUnits } from "ethers";
import { createWalletClient, custom } from "viem";
import { base } from "viem/chains";
import { getTokenBalancesForWallet, getWalletByAddress } from "../services/api";
import { USDC_ABI, USDC_CONTRACT_ADDRESS } from "../constants/usdc";
import Loader from "../components/Loader";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { useWallet } from "../contexts/WalletContext";
import Footer from "../components/Footer";
import DotBackground from "../components/DotBackground";

type TransactionResult = {
  success: boolean;
  transactionHash?: string;
  error?: string;
};

export default function TopupPage() {
  const { 
    usdBalance, 
    mpcWalletAddress, 
    walletData,
    refreshBalance 
  } = useWallet();
  const [topUpAmount, setTopUpAmount] = useState<number>(0);
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
  const router = useRouter();
  const { ready, authenticated, logout } = usePrivy();
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const initializeWallet = async () => {
    if (!wallets || wallets.length === 0) {
      throw new Error("No wallets connected");
    }

    const wallet = wallets[0];

    try {
      await wallet?.switchChain(8453);
      const provider = await wallet?.getEthereumProvider();
      if (!provider) {
        throw new Error("Could not get Ethereum provider");
      }

      return createWalletClient({
        chain: base,
        transport: custom(provider),
      });
    } catch (error) {
      console.error("Wallet initialization error:", error);
      throw error;
    }
  };

  const handleTopUpUSDC = async () => {
    try {
      setLoading(true);
      const walletClient = await initializeWallet();
      const [address] = await walletClient.getAddresses();
      if (!address) {
        throw new Error("No address found");
      }

      const usdcDecimals = 6;
      const topUpAmountInUSDC = parseUnits(topUpAmount.toString(), usdcDecimals);

      const hash = await walletClient.writeContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [mpcWalletAddress, topUpAmountInUSDC],
        account: address,
        chain: base
      });

      setTransactionResult({
        success: true,
        transactionHash: hash,
      });
    } catch (error: any) {
      console.error("USDC Top-up transaction error:", error);
      setTransactionResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Only DCA - Dashboard</title>
        <meta name="description" content="Manage your investments and wallet on Only DCA." />
      </Head>

      <main className="min-h-screen relative">
        <DotBackground />
        
        <div className="relative z-10">
          {ready && authenticated ? (
            <>
              <Navigation />

              <div className="px-6 sm:px-20 py-12">
                <div className="max-w-3xl mx-auto">
                  <h1 className="text-3xl font-bold mb-8 text-white">Your Wallet</h1>
                  
                  {loading ? (
                    <Loader />
                  ) : (
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-sm">
                      {usdBalance !== null && usdBalance < 5 ? (
                        <div className="flex flex-col items-center w-full">
                          <p className="text-red-400">
                            Your USD balance is low: ${usdBalance.toFixed(2)}
                          </p>
                          <p className="text-gray-400">
                            Please send some ETH as well for gas - ({usdBalance})
                          </p>
                          <p className="text-gray-400">we are working on a gasless solution</p>
                          <input
                            type="number"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(Number(e.target.value))}
                            className="mt-2 p-2 bg-black/30 border border-gray-800 rounded text-white"
                            placeholder="Enter amount to top-up"
                          />
                          <button
                            onClick={handleTopUpUSDC}
                            className="mt-2 bg-[#FF8A00] text-black px-4 py-2 rounded hover:bg-[#FF8A00]/90 transition-all"
                          >
                            Top Up
                          </button>
                        </div>
                      ) : (
                        <p className="text-white">Your USD balance is: ${usdBalance?.toFixed(2)}</p>
                      )}
                    </div>
                  )}

                  {transactionResult && (
                    <details className="w-full mt-4">
                      <summary className="mt-6 font-bold uppercase text-sm text-gray-400">
                        Transaction Result
                      </summary>
                      <pre className="max-w-4xl bg-black/30 text-gray-300 font-mono p-4 text-xs sm:text-sm rounded-md mt-2 border border-gray-800">
                        {JSON.stringify(transactionResult, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
              <Footer />
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}
