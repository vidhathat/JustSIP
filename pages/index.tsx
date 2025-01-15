import { useLogin, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import { useApi } from "../hooks/useApi";
import { useState } from "react";
import { createWallet } from "../services/api";
import Footer from "../components/Footer";
import DotBackground from '../components/DotBackground';

interface Balance {
  wallet_id: string;
  eth_balance: number;
  cbbtc_balance: number;
  usd_balance: number;
  updated_at: string;
}

interface User {
  id: number;
  wallet_address: string;
  mpc_wallet_address: string;
  wallet_id: string;
  name: string;
  image_url: string;
  created_at: string;
}

interface WalletResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    balance: Balance;
  };
}

export default function LandingPage() {
  const router = useRouter();
  const { logout } = usePrivy()
  const [walletError, setWalletError] = useState<string | null>(null);

  const { loading, execute: createWalletFn } = useApi<WalletResponse>(createWallet);

  const { login } = useLogin({
    onComplete: async (user) => {
      try {
        const result = await createWalletFn(user.wallet?.address);
        if (result && result.success) {
          router.push("/dca");
        } else {
          setWalletError(result?.message || "Failed to initialize wallet. Please try again.");
          logout()
        }
      } catch (err) {
        console.error('Wallet creation error:', err);
        setWalletError(err instanceof Error ? err.message : "An error occurred while connecting your wallet.");
        logout()
      }
    },
  });

  const handleConnect = () => {
    setWalletError(null);
    login();
  };

  return (
    <>
      <Head>
        <title>Only DCA - Automated DCA on Base</title>
        <meta name="description" content="Simple, automated dollar-cost averaging on Base. Start your crypto investment journey with Only DCA." />
      </Head>

      <main className="min-h-screen relative">
        <DotBackground />

        <div className="relative z-10">
          {/* Navigation */}
          <nav className="px-6 py-4 sm:px-20 border-b border-gray-800/50 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image 
                  src="/images/baselogo.png" 
                  alt="Base Logo" 
                  width={32} 
                  height={32}
                />
                <div className="text-2xl font-bold text-[#FF8A00]">Only DCA</div>
              </div>
              <div className="flex flex-col items-end">
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className={`bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-black px-6 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⚡</span>
                      Connecting...
                    </>
                  ) : (
                    'Connect Wallet'
                  )}
                </button>
                {walletError && (
                  <p className="text-red-500 text-sm mt-2">{walletError}</p>
                )}
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="px-6 sm:px-20 py-20 text-center">
            <div className="relative">
              <h1 className="text-4xl sm:text-7xl font-bold mb-6 text-white">
                Start your <span className="text-[#FF8A00]">SIP</span> <br /> 
                into crypto on <span className="text-[#FF8A00]">Base</span>
              </h1>
              <p className="text-xl mb-12 max-w-2xl mx-auto text-gray-400">
                Automate your crypto investments with dollar-cost averaging.
                Built on Base for maximum efficiency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className={`px-8 py-4 bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-black rounded-lg text-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⚡</span>
                      Connecting...
                    </>
                  ) : (
                    'Start Investing'
                  )}
                </button>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 border-2 border-[#FF8A00] text-[#FF8A00] hover:bg-[#FF8A00] hover:text-black rounded-lg text-lg font-medium transition-all"
                >
                  Learn More
                </a>
              </div>
              {walletError && (
                <p className="text-red-500 mt-4">{walletError}</p>
              )}
            </div>
          </section>

          {/* Features */}
          <section className="px-6 sm:px-20 py-20 ">
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="bg-black p-8 rounded-xl border border-gray-800">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-3 text-white">Automated Investing</h3>
                <p className="text-gray-400">
                  Set up recurring investments and let Only DCA handle the rest. No more timing the market.
                </p>
              </div>
              <div className="bg-black p-8 rounded-xl border border-gray-800">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-3 text-white">Built on Base</h3>
                <p className="text-gray-400">
                  Lightning-fast transactions with minimal fees on Base L2.
                </p>
              </div>
              <div className="bg-black p-8 rounded-xl border border-gray-800">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold mb-3 text-white">Non-Custodial</h3>
                <p className="text-gray-400">
                  Your funds remain in your control. Always secure, always accessible.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className="px-6 sm:px-20 py-20">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              How Only DCA Works
            </h2>
            <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-[#FF8A00] text-black w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white">Connect Wallet</h3>
                    <p className="text-gray-400">
                      Link your wallet securely using Privy authentication.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-[#FF8A00] text-black w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white">Choose Your Plan</h3>
                    <p className="text-gray-400">
                      Select your investment amount, frequency, and preferred tokens.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-[#FF8A00] text-black w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white">Start Investing</h3>
                    <p className="text-gray-400">
                      Sit back and watch your portfolio grow through automated investments.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
                <div>
                  <h3 className="text-[#FF8A00] font-bold mb-4">Why DCA?</h3>
                  <p className="mb-4 text-gray-300">
                    Dollar-Cost Averaging (DCA) reduces the impact of volatility by spreading investments over time.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-400">
                    <li>Lower risk of buying at market peaks</li>
                    <li>Emotional-free investing</li>
                    <li>Build wealth consistently</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Footer with dark theme */}
          <footer className="w-full px-6 sm:px-20 py-8 border-t border-gray-800/50 backdrop-blur-sm mt-auto">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image 
                  src="/images/baselogo.png" 
                  alt="Base Logo" 
                  width={24} 
                  height={24}
                />
                <span className="font-medium text-gray-400">Built on Base</span>
              </div>
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} Only DCA. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
