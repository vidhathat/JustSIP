import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import Navigation from "../components/Navigation";
import { getTradesForWallet, getWalletByAddress } from "../services/api";
import moment from "moment";
import { getTokenName } from "../constants/utils";

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
        <title>Trade History - JustSIP</title>
      </Head>

      <main className="min-h-screen bg-white">
        {ready && authenticated ? (
          <>
            <Navigation />

            <div className="px-6 sm:px-20 py-12">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Trade History</h1>

                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052FF]"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
                    {error}
                  </div>
                ) : trades.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center">
                    <p className="text-gray-600">No trades found</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              From
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              To
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Transaction
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {trades.map((trade) => (
                            <tr key={trade.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {moment(trade.created_at).format('MMM D, YYYY h:mm A')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                {getTokenName(trade.from_token)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                {getTokenName(trade.to_token)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {trade.amount} {getTokenName(trade.to_token)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <a
                                  href={`https://basescan.org/tx/${trade.transaction_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#0052FF] hover:text-[#0052FF]/80"
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
      </main>
    </>
  );
} 