import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import Image from "next/image";
import ActionModal from "../components/ActionModal";
import { createSip, getWalletByAddress, getTokenBalancesForWallet } from "../services/api";
import Navigation from "../components/Navigation";
import { useWallet } from '../contexts/WalletContext';
import Link from "next/link";
import Footer from "../components/Footer";
import DotBackground from "../components/DotBackground";

interface DCAConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  duration: number; // in months
  amountPerInvestment: number;
  token: 'eth' | 'cbbtc';
}

export default function DCAPage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCreatingSip, setIsCreatingSip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dcaConfig, setDcaConfig] = useState<DCAConfig>({
    frequency: 'monthly',
    duration: 12, // default 12 months
    amountPerInvestment: 100,
    token: 'eth'
  });
  const { usdBalance, isLoadingBalance } = useWallet();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const calculateTotalInvestment = () => {
    // For daily: duration is in days
    // For weekly: duration is in weeks
    // For monthly: duration is in months
    const totalInvestments = dcaConfig.duration;
    const totalAmount = dcaConfig.duration * dcaConfig.amountPerInvestment;
    
    return {
      totalAmount,
      totalInvestments
    };
  };

  const { totalAmount } = calculateTotalInvestment();

  const isBalanceSufficient = usdBalance >= totalAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowConfirmModal(true);
  };


  console.log('balance', usdBalance)
  const handleConfirmDCA = async () => {
    try {
      setError(null);
      setIsCreatingSip(true);

      if (!user?.wallet?.address) {
        throw new Error("Wallet address not found");
      }

      // First get the wallet details
      const walletResponse = await getWalletByAddress(user.wallet.address);
      if (!walletResponse.success || !walletResponse.data.user.wallet_id) {
        throw new Error("Failed to get wallet details");
      }

      // Create SIP with the wallet_id from the response
      await createSip({
        wallet_id: walletResponse.data.user.wallet_id,
        from_token: "usdc",
        to_token: dcaConfig.token,
        amount: dcaConfig.amountPerInvestment,
        frequency: dcaConfig.frequency,
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating SIP:', error);
      setError(error instanceof Error ? error.message : 'Failed to create SIP. Please try again.');
      setIsCreatingSip(false);
    }
  };

  return (
    <>
      <Head>
        <title>Setup DCA - Only DCA</title>
      </Head>

      <main className="min-h-screen relative">
        <DotBackground />
        
        <div className="relative z-10">
          {ready && authenticated ? (
            <>
              <Navigation />

              <div className="px-6 sm:px-20 py-12">
                <div className="max-w-2xl mx-auto">
                  <h1 className="text-3xl font-bold mb-8 text-white">Setup Periodic Investment</h1>
                  
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="mb-6 p-4 bg-black/30 rounded-xl border border-gray-800">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Available Balance:</span>
                          <span className="text-lg font-semibold text-white">
                            {isLoadingBalance ? (
                              <span className="animate-pulse">Loading...</span>
                            ) : (
                              `$${usdBalance.toFixed(2)}`
                            )}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Select Token
                        </label>
                        <select
                          value={dcaConfig.token}
                          onChange={(e) => setDcaConfig({...dcaConfig, token: e.target.value as DCAConfig['token']})}
                          className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent"
                        >
                          <option value="eth">Ethereum (ETH)</option>
                          <option value="cbbtc">Coinbase BTC (cbBTC)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Investment Frequency
                        </label>
                        <select
                          value={dcaConfig.frequency}
                          onChange={(e) => setDcaConfig({...dcaConfig, frequency: e.target.value as DCAConfig['frequency']})}
                          className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="weekly">Weekly</option>
                          <option value="daily">Daily</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Investment Duration ({dcaConfig.frequency === 'daily' ? 'days' : dcaConfig.frequency === 'weekly' ? 'weeks' : 'months'})
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={dcaConfig.duration}
                          onChange={(e) => setDcaConfig({...dcaConfig, duration: Number(e.target.value)})}
                          className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Amount per Investment (USD)
                        </label>
                        <input
                          type="number"
                          pattern="[0-9]*[.]?[0-9]*"
                          value={dcaConfig.amountPerInvestment}
                          onChange={(e) => setDcaConfig({...dcaConfig, amountPerInvestment: Number(e.target.value)})}
                          className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent"
                        />
                      </div>

                      <div className="bg-[#FF8A00]/5 p-6 rounded-xl border border-[#FF8A00]/20">
                        <h3 className="font-medium mb-3 text-[#FF8A00]">Investment Summary</h3>
                        <div className="space-y-2">
                          <p className="text-gray-300">
                            You will invest <span className="font-semibold text-white">${dcaConfig.amountPerInvestment}</span> in {dcaConfig.token} for
                             <span className="font-semibold text-white"> {dcaConfig.duration } {dcaConfig.frequency === 'daily' ? 'days' : dcaConfig.frequency === 'weekly' ? 'weeks' : 'months'}</span>
                          </p>
                          <p className="text-gray-300 font-medium">
                            Total investment amount: <span className="text-[#FF8A00] font-bold">${totalAmount}</span>
                          </p>
                          {!isBalanceSufficient && (
                            <div className="mt-4 p-4 bg-red-900/30 border border-red-500/30 rounded-xl">
                              <p className="text-red-400">
                                Insufficient balance. You need ${totalAmount - usdBalance} more USDC.
                              </p>
                              <Link 
                                href="/topup"
                                className="text-[#FF8A00] hover:underline mt-2 inline-block"
                              >
                                Top up your wallet →
                              </Link>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 text-sm text-gray-400">
                          <p>• Transactions will be executed automatically</p>
                          <p>• Gas fees will be deducted from your wallet</p>
                          <p>• You can cancel anytime</p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!isBalanceSufficient}
                        className={`w-full bg-[#FF8A00] text-black font-medium py-4 px-6 rounded-xl transition-all ${
                          !isBalanceSufficient 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-[#FF8A00]/90'
                        }`}
                      >
                        {isBalanceSufficient ? 'Start DCA Investment' : 'Insufficient Balance'}
                      </button>
                    </form>
                  </div>
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