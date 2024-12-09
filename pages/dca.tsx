import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import Image from "next/image";
import ActionModal from "../components/ActionModal";
import { createSip, getWalletByAddress } from "../services/api";
import Navigation from "../components/Navigation";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowConfirmModal(true);
  };

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
        <title>Setup DCA - JustSIP</title>
      </Head>

      <main className="min-h-screen bg-white">
        {ready && authenticated ? (
          <>
            <Navigation />

            <div className="px-6 sm:px-20 py-12">
              <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Setup Periodic Investment</h1>
                
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Select Token
                      </label>
                      <select
                        value={dcaConfig.token}
                        onChange={(e) => setDcaConfig({...dcaConfig, token: e.target.value as DCAConfig['token']})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
                      >
                        <option value="eth">Ethereum (ETH)</option>
                        <option value="cbbtc">Coinbase BTC (cbBTC)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Investment Frequency
                      </label>
                      <select
                        value={dcaConfig.frequency}
                        onChange={(e) => setDcaConfig({...dcaConfig, frequency: e.target.value as DCAConfig['frequency']})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="daily">Daily</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Investment Duration ({dcaConfig.frequency === 'daily' ? 'days' : dcaConfig.frequency === 'weekly' ? 'weeks' : 'months'})
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={dcaConfig.duration}
                        onChange={(e) => setDcaConfig({...dcaConfig, duration: Number(e.target.value)})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Amount per Investment (USD)
                      </label>
                      <input
                        type="number"
                        pattern="[0-9]*[.]?[0-9]*"
                        value={dcaConfig.amountPerInvestment}
                        onChange={(e) => setDcaConfig({...dcaConfig, amountPerInvestment: Number(e.target.value)})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 ntext-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
                      />
                    </div>

                    <div className="bg-[#0052FF]/5 p-6 rounded-xl border border-[#0052FF]/10">
                      <h3 className="font-medium mb-3 text-[#0052FF]">Investment Summary</h3>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          You will invest <span className="font-semibold">${dcaConfig.amountPerInvestment}</span> in {dcaConfig.token} for
                           <span className="font-semibold"> {dcaConfig.duration } {dcaConfig.frequency === 'daily' ? 'days' : dcaConfig.frequency === 'weekly' ? 'weeks' : 'months'}</span>
                        </p>
                        <p className="text-gray-700 font-medium">
                          Total investment amount: <span className="text-[#0052FF] font-bold">${totalAmount}</span>
                        </p>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        <p>• Transactions will be executed automatically</p>
                        <p>• Gas fees will be deducted from your wallet</p>
                        <p>• You can cancel anytime</p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-medium py-4 px-6 rounded-xl transition-all"
                    >
                      Start DCA Investment
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <ActionModal
              isOpen={showConfirmModal}
              onClose={() => {
                setShowConfirmModal(false);
                setError(null);
                setIsCreatingSip(false);
              }}
              onConfirm={handleConfirmDCA}
              type="edit"
              title="Confirm DCA Investment"
              data={
                !isCreatingSip && !error ? {
                  Token: dcaConfig.token.toUpperCase(),
                  Frequency: dcaConfig.frequency,
                  "Amount per Investment": `$${dcaConfig.amountPerInvestment}`,
                  Duration: `${dcaConfig.duration} ${dcaConfig.frequency === 'daily' ? 'days' : dcaConfig.frequency === 'weekly' ? 'weeks' : 'months'}`,
                  "Total Investment": `$${totalAmount}`,
                } : undefined
              }
            />

            <footer className="px-6 sm:px-20 py-8 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Image 
                    src="/images/baselogo.png" 
                    alt="Base Logo" 
                    width={24} 
                    height={24}
                  />
                  <span className="font-medium text-gray-600">Built on Base</span>
                </div>
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