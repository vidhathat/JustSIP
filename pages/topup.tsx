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

type TransactionResult = {
  success: boolean;
  transactionHash?: string;
  error?: string;
};

export default function TopupPage() {
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
  const [usdBalance, setUsdBalance] = useState<number | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    } else if (authenticated && user) {
      if (user.wallet && user.wallet.address) {
        fetchWalletData(user.wallet.address);
      } else {
        console.error("User wallet address is undefined");
      }
    }
  }, [ready, authenticated, router, user]);

  const fetchWalletData = async (walletAddress: string) => {
    try {
      setLoading(true);
      const walletData = await getWalletByAddress(walletAddress);
      const mpcWalletAddress = walletData.data.user.mpc_wallet_address;
      await fetchBalances(mpcWalletAddress);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async (mpcWalletAddress: string) => {
    try {
      const response = await getTokenBalancesForWallet(mpcWalletAddress);
      if (response.success) {
        setUsdBalance(response.data.balances.usd_balance);
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

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

      const walletData = await getWalletByAddress(address);
      const mpcWalletAddress = walletData.data.user.mpc_wallet_address;

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
        <title>JustSIP - Dashboard</title>
        <meta name="description" content="Manage your investments and wallet on JustSIP." />
      </Head>

      <main className="min-h-screen bg-white">
        {ready && authenticated ? (
          <>
            <nav className="px-6 py-4 sm:px-20 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-[#0052FF]">JustSIP Dashboard</div>
                </div>
                <button
                  onClick={logout}
                  className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white px-6 py-2 rounded-full transition-all font-medium"
                >
                  Logout
                </button>
              </div>
            </nav>

            <div className="px-6 sm:px-20 py-12">
              <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Wallet</h1>
                
                {loading ? (
                  <Loader />
                ) : (
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                    {usdBalance !== null && usdBalance < 5 ? (
                      <div className="flex flex-col items-center">
                        <p className="text-red-500">
                          Your USD balance is low: ${usdBalance.toFixed(2)}
                        </p>
                        <input
                          type="number"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(Number(e.target.value))}
                          className="mt-2 p-2 border rounded"
                          placeholder="Enter amount to top-up"
                        />
                        <button
                          onClick={handleTopUpUSDC}
                          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                        >
                          Top Up
                        </button>
                      </div>
                    ) : (
                      <p>Your USD balance is: ${usdBalance?.toFixed(2)}</p>
                    )}
                  </div>
                )}

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
              </div>
            </div>

            <footer className="absolute bottom-0 w-full px-6 sm:px-20 py-8 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Built on Base</span>
                <div className="text-sm text-gray-500">
                  © 2024 JustSIP. All rights reserved.
                </div>
              </div>
            </footer>
          </>
        ) : null}
      </main>
    </>
  );
}
