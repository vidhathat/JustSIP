import { useRouter } from "next/router";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";

const Navigation = () => {
  const router = useRouter();
  const { logout } = usePrivy();

  return (
    <nav className="px-6 py-4 sm:px-20 border-b border-gray-100">
      <div className="flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => router.push('/dashboard')}
        >
          <Image 
            src="/images/baselogo.png" 
            alt="Base Logo" 
            width={32} 
            height={32}
          />
          <div className="text-2xl font-bold text-[#0052FF]">JustSIP</div>
        </div>
        <div className="flex items-center gap-4">
          {router.pathname !== '/dashboard' ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-[#0052FF] px-4 py-2 rounded-full transition-all font-medium"
            >
              Dashboard
            </button>
          ) : (
            <button
              className="bg-[#0052FF] text-white px-4 py-2 rounded-full transition-all font-medium"
            >
              Dashboard
            </button>
          )}
          {router.pathname !== '/dca' ? (
            <button
              onClick={() => router.push('/dca')}
              className={`${router.pathname === '/dashboard' ? 'bg-[#0052FF] text-white' : 'text-gray-600 hover:text-[#0052FF]'} px-4 py-2 rounded-full transition-all font-medium`}
            >
              Invest Now
            </button>
          ) : (
            <button
              className="bg-[#0052FF] text-white px-4 py-2 rounded-full transition-all font-medium"
            >
              Invest Now
            </button>
          )}
          {router.pathname !== '/topup' && (
            <button
              onClick={() => router.push('/topup')}
              className="text-gray-600 hover:text-[#0052FF] px-4 py-2 rounded-full transition-all font-medium"
            >
              Top Up
            </button>
          )}
          {router.pathname !== '/trades' && (
            <button
              onClick={() => router.push('/trades')}
              className="text-gray-600 hover:text-[#0052FF] px-4 py-2 rounded-full transition-all font-medium"
            >
              Trades
            </button>
          )}
          <button
            onClick={() => logout()}
            className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-full transition-all font-medium border border-gray-200 hover:border-gray-300"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 