import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => (
  <header className="bg-white ml-25 mr-25">
    <div className="container mx-auto py-4 flex justify-between items-center">
      <h1 className="text-lg font-extrabold text-gray-800">
        Paper Trading
      </h1>
      <nav className="flex">
        <Link href="/" className="text-lg font-bold text-gray-800 mx-4">
          <span className="h-full flex items-center">Dashboard</span>
        </Link>
        <Link href="/buy" className="text-lg font-bold text-gray-800">
          <span className="h-full flex items-center">Buy</span>
        </Link>
      </nav>
    </div>
  </header>
);

export default Header;