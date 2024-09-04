"use client";
import { useState } from 'react';
import StockCard from './components/StockCard';
import SellModal from './components/SellModal';
import Header from './components/Header';
import { Stock } from './types/Stock';
import TotalValueCard from './components/TotalValueCard';
import TotalProfitLossCard from './components/TotalProfitLossCard';

const mockPortfolio: Stock[] = [
  { symbol: 'AAPL', totalShares: 10, currentValue: 150.66, profitLoss: 200.22},
  { symbol: 'GOOGL', totalShares: 5, currentValue: 2800.66, profitLoss: 500.22},
  // Add more stocks as needed
];

const Dashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Stock[]>(mockPortfolio);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [sellShares, setSellShares] = useState<number>(0);

  const openSellModal = (stock: Stock) => {
    setSelectedStock(stock);
    setSellShares(0);
  };

  const closeSellModal = () => {
    setSelectedStock(null);
  };

  const sellStock = () => {
    if (selectedStock && sellShares > 0 && sellShares <= selectedStock.totalShares) {
      const updatedPortfolio = portfolio.map(stock =>
        stock.symbol === selectedStock.symbol
          ? { ...stock, totalShares: stock.totalShares - sellShares }
          : stock
      );
      setPortfolio(updatedPortfolio);
      closeSellModal();
    }
  };

  return (
    <>
      <Header/>
      <div className="container mx-auto p-8 min-h-screen max-w-screen-sm">

        <h1 className="text-3xl font-bold text-gray-800 mb-5">Dashboard</h1>
        <div className="grid grid-cols-2 gap-10 h-24 mb-5">
          <TotalValueCard totalValue={10000} />
          <TotalProfitLossCard profitLoss={500} />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mt-10">Portfolio</h1>
        <p className="text-base text-gray-500 mb-5 mt-1">Click on a stock to sell it!</p>
        <div className="grid grid-cols-1 gap-4">
          {portfolio.map(stock => (
            <StockCard key={stock.symbol} stock={stock} onClick={() => openSellModal(stock)} />
          ))}
        </div>
        {selectedStock && (
          <SellModal
            stock={selectedStock}
            sellShares={sellShares}
            setSellShares={setSellShares}
            sellStock={sellStock}
            closeModal={closeSellModal}
          />
        )}
      </div>
    </>
  );
};

export default Dashboard;