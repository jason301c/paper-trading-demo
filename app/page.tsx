
"use client";
import { useState } from 'react';
import Link from 'next/link';

interface Stock {
  symbol: string;
  totalShares: number;
  currentValue: number;
  profitLoss: number;
}

const mockPortfolio: Stock[] = [
  { symbol: 'AAPL', totalShares: 10, currentValue: 150, profitLoss: 50 },
  { symbol: 'TSLA', totalShares: 5, currentValue: 200, profitLoss: 100 },
];

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState<Stock[]>(mockPortfolio);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [sellShares, setSellShares] = useState<number>(0);

  const openSellModal = (stock: Stock) => {
    setSelectedStock(stock);
  };

  const sellStock = () => {
    if (!selectedStock) return;

    const updatedPortfolio = portfolio
      .map((stock) => {
        if (stock.symbol === selectedStock.symbol) {
          const newShares = stock.totalShares - sellShares;
          return newShares > 0
            ? { ...stock, totalShares: newShares }
            : null;
        }
        return stock;
      })
      .filter(Boolean) as Stock[];

    setPortfolio(updatedPortfolio);
    setSelectedStock(null);
    setSellShares(0);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Portfolio</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolio.map((stock) => (
          <div
            key={stock.symbol}
            className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => openSellModal(stock)}
          >
            <h2 className="text-xl font-semibold mb-2">{stock.symbol}</h2>
            <p className="text-gray-500">Current Value: <span className="text-black">${stock.currentValue}</span></p>
            <p className="text-gray-500">Total Shares: <span className="text-black">{stock.totalShares}</span></p>
            <p className={`text-sm ${stock.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              Profit/Loss: ${stock.profitLoss}
            </p>
          </div>
        ))}
      </div>

      {selectedStock && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Sell {selectedStock.symbol}</h2>
            <p>Current Shares: {selectedStock.totalShares}</p>
            <input
              type="number"
              value={sellShares}
              onChange={(e) => setSellShares(Number(e.target.value))}
              className="border p-2 w-full mt-4 mb-4"
            />
            <button
              onClick={sellStock}
              className="bg-red-500 text-white px-4 py-2 rounded w-full"
            >
              Sell Shares
            </button>
            <button
              onClick={() => setSelectedStock(null)}
              className="text-gray-600 mt-2 block text-center"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Use Link without <a> */}
      <div className="mt-8 text-center">
        <Link href="/buy" className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition duration-300">
          Buy Stocks
        </Link>
      </div>
    </div>
  );
}
