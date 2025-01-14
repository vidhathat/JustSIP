import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { getTokenBalancesForWallet, getWalletByAddress } from '../services/api';

interface WalletContextType {
  usdBalance: number;
  isLoadingBalance: boolean;
  refreshBalance: () => Promise<void>;
  walletAddress: string | null;
  mpcWalletAddress: string | null;
  walletData: any | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = usePrivy();
  const [usdBalance, setUsdBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [mpcWalletAddress, setMpcWalletAddress] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<any | null>(null);

  const fetchBalances = async () => {
    if (!user?.wallet?.address) return;
    
    try {
      setIsLoadingBalance(true);
      const walletResponse = await getWalletByAddress(user.wallet.address);
    //   console.log('walletResponse in context', walletResponse)
      if (walletResponse.success) {
        setWalletData(walletResponse.data);
        setWalletAddress(user.wallet.address);
        setMpcWalletAddress(walletResponse.data.user.mpc_wallet_address);
        
        const response = await getTokenBalancesForWallet(walletResponse.data.user.mpc_wallet_address);
        // console.log('response in context', response)
        if (response.success) {
          setUsdBalance(response.data.balances.usd_balance);
        }
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

//   console.log('usdBalance in context', usdBalance)
//   console.log('walletData in context', walletAddress)
  useEffect(() => {
    fetchBalances();
  }, [user?.wallet?.address]);

  return (
    <WalletContext.Provider value={{ 
      usdBalance, 
      isLoadingBalance, 
      refreshBalance: fetchBalances,
      walletAddress,
      mpcWalletAddress,
      walletData
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 