export const TOKEN_MAP = {
  "eth": "ETH",
  "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf": "cbBTC",
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": "USDC",
};

export const getTokenName = (address) => {
  console.log("Address", address);
  const tokens = [
    {
      address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
      name: "cbBTC",
    },
    {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      name: "USDC",
    },
    {
      address: "eth",
      name: "ETH",
    },
  ]

  return tokens.find(token => token.address?.toLowerCase() === address?.toLowerCase())?.name || address;
}
