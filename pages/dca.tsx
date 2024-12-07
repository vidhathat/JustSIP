import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import Image from "next/image";

interface DCAConfig {
  token: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  network: string;
}

export default function DCAPage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const [dcaConfig, setDcaConfig] = useState<DCAConfig>({
    token: 'ETH',
    amount: 100,
    frequency: 'monthly',
    network: 'Base'
  });

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('DCA Configuration:', dcaConfig);
  };

  return (
    <>
      <Head>
        <title>Setup DCA - JustSIP</title>
      </Head>

      <main className="min-h-screen bg-white">
        {ready && authenticated ? (
          <>
            <nav className="px-6 py-4 sm:px-20 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Image 
                    src="/base-logo.svg" 
                    alt="Base Logo" 
                    width={32} 
                    height={32}
                  />
                  <div className="text-2xl font-bold text-[#0052FF]">JustSIP</div>
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white px-6 py-2 rounded-full transition-all font-medium"
                >
                  Dashboard
                </button>
              </div>
            </nav>

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
                        onChange={(e) => setDcaConfig({...dcaConfig, token: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
                      >
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="USDC">USD Coin (USDC)</option>
                        <option value="cbETH">Coinbase ETH (cbETH)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Investment Amount (USD)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={dcaConfig.amount}
                        onChange={(e) => setDcaConfig({...dcaConfig, amount: Number(e.target.value)})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
                      />
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
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div className="bg-[#0052FF]/5 p-6 rounded-xl border border-[#0052FF]/10">
                      <h3 className="font-medium mb-3 text-[#0052FF]">Investment Summary</h3>
                      <p className="text-gray-700">
                        You will invest ${dcaConfig.amount} in {dcaConfig.token} {dcaConfig.frequency} on Base network
                      </p>
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
                      Confirm DCA Setup
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <footer className="px-6 sm:px-20 py-8 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Image 
                    src="/base-logo.svg" 
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