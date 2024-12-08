import axios from 'axios';

const BASE_URL = 'https://basedwrapped.xyz';

export const SIP_STATUS = {
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  INSUFFICIENT_FUNDS: "insufficient_funds",
} as const;

type SipStatus = typeof SIP_STATUS[keyof typeof SIP_STATUS];

interface CreateSipRequest {
  wallet_id: string;
  from_token: string;
  to_token: string;
  amount: number;
  frequency: string;
}


// Create a new wallet
export const createWallet = async (wallet_address: string) => {
  const response = await axios.post(`${BASE_URL}/create-wallet`, {
    wallet_address,
  });
  return response.data;
};

// Get wallet by address
export const getWalletByAddress = async (address: string) => {
  const response = await axios.get(`${BASE_URL}/wallet/address/${address}`);
  return response.data;
};

// Create a new SIP
export const createSip = async (data: CreateSipRequest) => {
  const response = await axios.post(`${BASE_URL}/sip`, data);
  return response.data;
};

// Get all SIPs for a wallet
export const getSipsForWallet = async (walletId: string) => {
  const response = await axios.get(`${BASE_URL}/sip/${walletId}`);
  return response.data;
};

// Get all trades for a wallet
export const getTradesForWallet = async (walletId: string) => {
  const response = await axios.get(`${BASE_URL}/trades/${walletId}`);
  return response.data;
};

// Update SIP status
export const updateSipStatus = async (walletId: string, sipId: string, status: SipStatus) => {
  const response = await axios.put(
    `${BASE_URL}/sip/${walletId}/${sipId}/status`,
    { status }
  );
  return response.data;
};

// Delete a SIP
export const deleteSip = async (walletId: string, sipId: string) => {
  const response = await axios.delete(`${BASE_URL}/sip/${walletId}/${sipId}`);
  return response.data;
}; 

// Get token balances for a wallet
export const getTokenBalancesForWallet = async (walletAddress: string) => {
  const response = await axios.get(`${BASE_URL}/wallet/balances/${walletAddress}`);
  return response.data;
};

// Update SIP
export const updateSip = async (walletId: string, sipId: string, data: { amount: number | undefined, frequency: string | undefined, status: SipStatus | undefined }) => {
  const response = await axios.put(`${BASE_URL}/sip/${walletId}/${sipId}`, data);
  return response.data;
};