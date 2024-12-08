import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import Image from "next/image";
import { getSipsForWallet, getWalletByAddress, updateSip, deleteSip } from "../services/api";
import Loader from "../components/Loader";
import moment from "moment";
import { getTokenName, TOKEN_MAP } from "../constants/utils";
import ActionButton from "../components/ActionButton";
import ActionModal from "../components/ActionModal";
import Navigation from "../components/Navigation";

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

export default function Dashboard() {
  const [sips, setSips] = useState<Sip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();
  const [editId, setEditId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("");
  const [editFrequency, setEditFrequency] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sipToDelete, setSipToDelete] = useState<number | null>(null);

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
      setError(null);
      const walletData = await getWalletByAddress(walletAddress);
      const walletId = walletData.data.user.wallet_id;
      await fetchSips(walletId);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      setError("Failed to fetch wallet data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSips = async (walletId: string) => {
    try {
      const response = await getSipsForWallet(walletId);
      if (response.success) {
        setSips(response.data.sips);
      } else {
        setError("Failed to fetch SIPs. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching SIPs:", error);
      setError("Failed to fetch SIPs. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      paused: "bg-yellow-100 text-yellow-800",
      completed: "bg-orange-100 text-orange-800",
      insufficient_funds: "bg-red-100 text-red-800",
    };
    return <span className={`px-2 py-1 text-sm font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  const handleEdit = (sip: Sip) => {
    if (editId === sip.id) {
      setIsEditModalOpen(true);
    } else {
      setEditId(sip.id);
      setEditAmount(sip.amount.toString());
      setEditStatus(sip.status);
      setEditFrequency(sip.frequency);
    }
  };

  const handleDelete = (sip: Sip) => {
    setSipToDelete(sip.id);
    setIsDeleteModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!user?.wallet?.address) return;
    
    try {
      setActionLoading(true);
      setError(null);
      const walletData = await getWalletByAddress(user.wallet.address);
      const walletId = walletData.data.user.wallet_id;
      
      const response = await updateSip(
        walletId,
        editId!.toString(),
        {
          amount: parseFloat(editAmount),
          frequency: editFrequency,
          status: editStatus as any
        }
      );

      if (response.success) {
        await fetchSips(walletId);
        setIsEditModalOpen(false);
        setEditId(null);
      } else {
        setError("Failed to update SIP. Please try again.");
      }
    } catch (error) {
      console.error("Error updating SIP:", error);
      setError("Failed to update SIP. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (sipToDelete === null || !user?.wallet?.address) return;

    try {
      setActionLoading(true);
      setError(null);
      const walletData = await getWalletByAddress(user.wallet.address);
      const walletId = walletData.data.user.wallet_id;
      
      const response = await deleteSip(walletId, sipToDelete.toString());
      
      if (response.success) {
        await fetchSips(walletId);
        setIsDeleteModalOpen(false);
        setSipToDelete(null);
      } else {
        setError("Failed to delete SIP. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting SIP:", error);
      setError("Failed to delete SIP. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => user?.wallet?.address && fetchWalletData(user.wallet.address)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - JustSIP</title>
      </Head>

      <main className="min-h-screen bg-white">
        {ready && authenticated ? (
          <>
            <Navigation />

            <div className="px-6 sm:px-12 py-12">
              <div className="max-w-8xl mx-auto">
                {actionLoading && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg">
                      <Loader />
                      <p className="text-center mt-2">Processing...</p>
                    </div>
                  </div>
                )}

                <h1 className="text-3xl font-bold mb-8 text-gray-900">My SIPs</h1>
                
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Token</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Token</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Execution</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sips.map((sip) => (
                        <tr key={sip.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{sip.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getTokenName(sip.from_token)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getTokenName(sip.to_token)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editId === sip.id ? (
                              <input
                                type="text"
                                pattern="[0-9]*[.]?[0-9]*"
                                value={editAmount}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Allow empty string, numbers, and one decimal point
                                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    setEditAmount(value);
                                  }
                                }}
                                className="border rounded px-2 py-1 w-32"
                              />
                            ) : (
                              parseFloat(sip.amount.toString()).toFixed(6)
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editId === sip.id ? (
                              <select
                                value={editFrequency}
                                onChange={(e) => setEditFrequency(e.target.value)}
                                className="border rounded px-2 py-1"
                              >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                              </select>
                            ) : (
                              sip.frequency
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{moment(sip.next_execution).format("DD MMM YY")}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editId === sip.id ? (
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="border rounded px-2 py-1"
                              >
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="completed">Completed</option>
                                <option value="insufficient_funds">Insufficient Funds</option>
                              </select>
                            ) : (
                              getStatusBadge(sip.status)
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                            <ActionButton 
                              type="edit" 
                              onClick={() => handleEdit(sip)} 
                              isEditing={editId === sip.id} 
                            />
                            <ActionButton type="delete" onClick={() => handleDelete(sip)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <ActionModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setEditId(null);
                setError(null);
              }}
              onConfirm={handleSaveChanges}
              type="edit"
              title="Confirm Changes"
              message="Please review your SIP changes before saving."
              data={{
                amount: `$${parseFloat(editAmount || "0").toFixed(6)}`,
                frequency: editFrequency,
                status: editStatus
              }}
            />

            <ActionModal
              isOpen={isDeleteModalOpen}
              onClose={() => {
                setIsDeleteModalOpen(false);
                setSipToDelete(null);
                setError(null);
              }}
              onConfirm={handleConfirmDelete}
              type="delete"
              title="Delete SIP"
              message="Are you sure you want to delete this SIP? This action cannot be undone and all scheduled investments will be cancelled."
            />

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
