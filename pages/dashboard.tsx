import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import { getSipsForWallet, getWalletByAddress } from "../services/api";
import Loader from "../components/Loader";

type Sip = {
  id: number;
  wallet_id: string;
  from_token: string;
  to_token: string;
  amount: number;
  frequency: string;
  next_execution: string;
  status: string;
  total_executions: number;
  last_execution: string | null;
  created_at: string;
  updated_at: string;
};

export default function DashboardPage() {
  const [sips, setSips] = useState<Sip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();

  useEffect(() => {
    if (ready && authenticated && user && user.wallet && user.wallet.address) {
      fetchWalletData(user.wallet.address);
    } else if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, user, router]);

  const fetchWalletData = async (walletAddress: string) => {
    try {
      setLoading(true);
      const walletData = await getWalletByAddress(walletAddress);
      const walletId = walletData.data.user.wallet_id;
      fetchSips(walletId);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSips = async (walletId: string) => {
    try {
      setLoading(true);
      const response = await getSipsForWallet(walletId);
      if (response.success) {
        setSips(response.data.sips);
      }
    } catch (error) {
      console.error("Error fetching SIPs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      active: "bg-green-500",
      paused: "bg-yellow-500",
      completed: "bg-orange-500",
      insufficient_funds: "bg-red-500",
    };
    return <span className={`px-2 py-1 text-white rounded ${statusClasses[status] || 'bg-gray-500'}`}>{status}</span>;
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
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">My SIPs</h1>
                
                {loading ? (
                  <Loader />
                ) : (
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b">ID</th>
                        <th className="px-4 py-2 border-b">From Token</th>
                        <th className="px-4 py-2 border-b">To Token</th>
                        <th className="px-4 py-2 border-b">Amount</th>
                        <th className="px-4 py-2 border-b">Frequency</th>
                        <th className="px-4 py-2 border-b">Next Execution</th>
                        <th className="px-4 py-2 border-b">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sips.map((sip) => (
                        <tr key={sip.id}>
                          <td className="px-4 py-2 border-b">{sip.id}</td>
                          <td className="px-4 py-2 border-b">{sip.from_token}</td>
                          <td className="px-4 py-2 border-b">{sip.to_token}</td>
                          <td className="px-4 py-2 border-b">{sip.amount}</td>
                          <td className="px-4 py-2 border-b">{sip.frequency}</td>
                          <td className="px-4 py-2 border-b">{new Date(sip.next_execution).toLocaleString()}</td>
                          <td className="px-4 py-2 border-b">{getStatusBadge(sip.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
