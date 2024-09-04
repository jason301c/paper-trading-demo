"use client";
import { useState } from 'react';

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

    const updatedPortfolio = portfolio.map((stock) => {
      if (stock.symbol === selectedStock.symbol) {
        const newShares = stock.totalShares - sellShares;
        return newShares > 0
          ? { ...stock, totalShares: newShares }
          : null;
      }
      return stock;
    }).filter(Boolean) as Stock[];

    setPortfolio(updatedPortfolio);
    setSelectedStock(null);
    setSellShares(0);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        {portfolio.map((stock) => (
          <div
            key={stock.symbol}
            className="p-4 border rounded shadow cursor-pointer"
            onClick={() => openSellModal(stock)}
          >
            <h2 className="text-lg font-semibold">{stock.symbol}</h2>
            <p>Current Value: ${stock.currentValue}</p>
            <p>Total Shares: {stock.totalShares}</p>
            <p>Profit/Loss: ${stock.profitLoss}</p>
          </div>
        ))}
      </div>

      {selectedStock && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded">
            <h2 className="text-xl font-bold mb-4">Sell {selectedStock.symbol}</h2>
            <p>Current Shares: {selectedStock.totalShares}</p>
            <input
              type="number"
              value={sellShares}
              onChange={(e) => setSellShares(Number(e.target.value))}
              className="border p-2"
            />
            <button
              onClick={sellStock}
              className="bg-red-500 text-white px-4 py-2 rounded mt-4"
            >
              Sell Shares
            </button>
            <button
              onClick={() => setSelectedStock(null)}
              className="text-gray-600 mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
