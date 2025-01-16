import { useRouter } from "next/router";
import { useState } from "react";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";

export default function Navigation() {
  const router = useRouter();
  const { logout } = usePrivy();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Create SIP", path: "/dca" },
    { label: "Trades", path: "/trades" },
    { label: "Top Up", path: "/topup" },
  ];

  return (
    <nav className="px-4 sm:px-20 py-4 border-b border-gray-100">
      <div className="flex justify-between items-center">
        {/* Logo - always visible */}
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
          <div className="text-2xl font-bold text-[#0052FF]">Only DCA</div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`px-4 py-2 transition-colors ${
                router.pathname === item.path 
                  ? 'text-white font-medium' 
                  : 'text-gray-600 hover:text-[#0052FF]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => logout()}
            className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white px-6 py-2 rounded-full transition-all font-medium"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="sm:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {!isMenuOpen ? (
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 sm:hidden">
            <div className="absolute inset-0 bg-black/20" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg animate-slideIn">
              <div className="p-4 space-y-4">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      router.push(item.path);
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 transition-colors ${
                      router.pathname === item.path 
                        ? 'text-white font-medium' 
                        : 'text-gray-600 hover:text-[#0052FF]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <hr className="my-4" />
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-[#0052FF] hover:bg-[#0052FF]/90 text-white px-6 py-2 rounded-full transition-all font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 