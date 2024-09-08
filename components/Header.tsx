import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => (
  <header className="bg-white">
    <div className="container mx-auto py-4 flex justify-between items-center">
      <h1 className="text-lg font-extrabold text-gray-800 transition-colors duration-300 hover:text-black">
        Paper Trading
      </h1>
      <nav className="flex">
        <Link href="/" className="mx-4">
          <span className="text-lg font-bold text-gray-800 transition-colors duration-300 hover:text-blue-500 active:text-blue-700 focus:outline-none">
            Dashboard
          </span>
        </Link>
        <Link href="/buy" className="mx-4">
          <span className="text-lg font-bold text-gray-800 transition-colors duration-300 hover:text-blue-500 active:text-blue-700 focus:outline-none">
            Buy
          </span>
        </Link>
      </nav>
    </div>
  </header>
);

export default Header;
