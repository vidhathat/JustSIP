import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import Navigation from "../components/Navigation";
import { getTradesForWallet, getWalletByAddress } from "../services/api";
import moment from "moment";
import { getTokenName } from "../constants/utils";
import DotBackground from "../components/DotBackground";

interface Trade {
  id: number;
  wallet_id: string;
  from_token: string;
  to_token: string;
  amount: number;
  status: string | null;
  trade_id: string;
  transaction_hash: string;
  network: string;
  created_at: string;
}

export default function TradesPage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);

  const fetchTrades = useCallback(async (isInitialLoad = false) => {
    if (!user?.wallet?.address) return;
    
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      setError(null);

      // Get wallet_id if we don't have it yet
      let currentWalletId = walletId;
      if (!currentWalletId) {
        const walletResponse = await getWalletByAddress(user.wallet.address);
        if (!walletResponse.success || !walletResponse.data.user.wallet_id) {
          throw new Error("Failed to get wallet details");
        }
        currentWalletId = walletResponse.data.user.wallet_id;
        setWalletId(currentWalletId);
      }

      // Get trades using the wallet_id
      const tradesResponse = await getTradesForWallet(currentWalletId!);
      if (!tradesResponse.success) {
        throw new Error("Failed to fetch trades");
      }

      // Check if there are any new trades
      const newTrades = tradesResponse.data.trades;
      if (JSON.stringify(newTrades) !== JSON.stringify(trades)) {
        setTrades(newTrades);
      }
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trades');
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  }, [user?.wallet?.address, walletId, trades]);

  // Initial load effect
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }

    if (ready && authenticated && user?.wallet?.address) {
      fetchTrades(true);
    }
  }, [ready, authenticated, user, fetchTrades]);

  // Polling effect
  useEffect(() => {
    if (!ready || !authenticated || !user?.wallet?.address) return;

    const intervalId = setInterval(() => {
      fetchTrades(false);
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [ready, authenticated, user, fetchTrades]);

  return (
    <>
      <Head>
        <title>Trade History - Only DCA</title>
      </Head>

      <main className="min-h-screen relative">
        <DotBackground />
        
        <div className="relative z-10">
          {ready && authenticated ? (
            <>
              <Navigation />

              <div className="px-6 sm:px-20 py-12">
                <div className="max-w-7xl mx-auto">
                  <h1 className="text-3xl font-bold text-white mb-8">Trade History</h1>

                  {loading ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8A00]"></div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-400">
                      {error}
                    </div>
                  ) : trades.length === 0 ? (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center backdrop-blur-sm">
                      <p className="text-gray-400">No trades found</p>
                    </div>
                  ) : (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-800">
                          <thead className="bg-black/50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                From
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                To
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Transaction
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {trades.map((trade) => (
                              <tr key={trade.id} className="hover:bg-black/30">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                  {moment(trade.created_at).format('MMM D, YYYY h:mm A')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                  {getTokenName(trade.from_token)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                  {getTokenName(trade.to_token)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                  {trade.amount} {getTokenName(trade.to_token)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <a
                                    href={`https://basescan.org/tx/${trade.transaction_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#FF8A00] hover:text-[#FF8A00]/80"
                                  >
                                    View Transaction ↗
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </>
  );
} 