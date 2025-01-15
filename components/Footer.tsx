import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full px-6 sm:px-20 py-8 border-t border-gray-100 mt-auto">
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
          © {currentYear} JustSIP. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 