import { useLogin } from "@privy-io/react-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();
  const { login } = useLogin({
    onComplete: () => router.push("/dca"),
  });


  return (
    <>
      <Head>
        <title>JustSIP - Automated DCA on Base</title>
        <meta name="description" content="Simple, automated dollar-cost averaging on Base. Start your crypto investment journey with JustSIP." />
      </Head>

      <main className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="px-6 py-4 sm:px-20 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image 
                src="/images/baselogo.png" 
                alt="Base Logo" 
                width={32} 
                height={32}
              />
              <div className="text-2xl font-bold text-[#0052FF]">JustSIP</div>
            </div>
            <button
              onClick={login}
              className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white px-6 py-2 rounded-full transition-all font-medium"
            >
              Connect Wallet
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-6 sm:px-20 py-20 text-center relative">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
          <div className="relative">
            <h1 className="text-4xl sm:text-7xl font-bold mb-6 text-gray-900">
              Start your <span className="text-[#0052FF]">SIP</span> <br /> into crypto on <span className="text-[#0052FF]">Base</span>
            </h1>
            <p className="text-xl mb-12 max-w-2xl mx-auto text-gray-600">
              Automate your crypto investments with dollar-cost averaging.
              Built on Base for maximum efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={login}
                className="px-8 py-4 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white rounded-full text-lg font-medium transition-all"
              >
                Start Investing
              </button>
              <a
                href="#how-it-works"
                className="px-8 py-4 border-2 border-[#0052FF] text-[#0052FF] hover:bg-[#0052FF] hover:text-white rounded-full text-lg font-medium transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 sm:px-20 py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Automated Investing</h3>
              <p className="text-gray-600">
                Set up recurring investments and let JustSIP handle the rest. No more timing the market.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Built on Base</h3>
              <p className="text-gray-600">
                Lightning-fast transactions with minimal fees on Base L2.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Non-Custodial</h3>
              <p className="text-gray-600">
                Your funds remain in your control. Always secure, always accessible.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-6 sm:px-20 py-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How JustSIP Works
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-[#0052FF] text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-gray-900">Connect Wallet</h3>
                  <p className="text-gray-600">
                    Link your wallet securely using Privy authentication.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[#0052FF] text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-gray-900">Choose Your Plan</h3>
                  <p className="text-gray-600">
                    Select your investment amount, frequency, and preferred tokens.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[#0052FF] text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-gray-900">Start Investing</h3>
                  <p className="text-gray-600">
                    Sit back and watch your portfolio grow through automated investments.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#0052FF]/5 rounded-2xl p-8 border border-[#0052FF]/10">
              <div>
                <h3 className="text-[#0052FF] font-bold mb-4">Why DCA?</h3>
                <p className="mb-4 text-gray-700">
                  Dollar-Cost Averaging (DCA) reduces the impact of volatility by spreading investments over time.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Lower risk of buying at market peaks</li>
                  <li>Emotional-free investing</li>
                  <li>Build wealth consistently</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 sm:px-20 py-20 bg-gray-50">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-center">
            Join thousands of investors who trust JustSIP for their crypto investments on Base.
          </p>
          <div className="text-center">
            <button
              onClick={login}
              className="px-8 py-4 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white rounded-full text-lg font-medium transition-all"
            >
              Get Started Now
            </button>
          </div>
        </section>

        {/* Footer */}
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
      </main>
    </>
  );
}
