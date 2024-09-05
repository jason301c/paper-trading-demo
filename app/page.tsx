"use client";
import { useState, useEffect } from 'react';
import StockCard from '../components/StockCard';
import SellModal from '../components/SellModal';
import Header from '../components/Header';
import { Stock } from '../lib/Stock';
import TotalValueCard from '../components/TotalValueCard';
import TotalProfitLossCard from '../components/TotalProfitLossCard';

const Dashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [sellShares, setSellShares] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true); // For showing a loader if needed

  // Fetch portfolio data from API
  const fetchPortfolio = async (useCache = true) => {
    try {
      // If cached data exists, use it to populate the portfolio first
      const cachedPortfolio = localStorage.getItem('portfolio');
      if (useCache && cachedPortfolio) {
        setPortfolio(JSON.parse(cachedPortfolio)); // Populate from cache
        setIsLoading(false); // We don't want to show loader anymore since data is available
      }

      // Now fetch the fresh portfolio data in the background
      const response = await fetch('/api/portfolio');
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data); // Update state with fresh portfolio from API
        localStorage.setItem('portfolio', JSON.stringify(data)); // Update the cache
      } else {
        console.error('Failed to fetch portfolio');
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch portfolio on mount
  useEffect(() => {
    fetchPortfolio();
  }, []);

  const openSellModal = (stock: Stock) => {
    setSelectedStock(stock);
    setSellShares(0);
  };

  const closeSellModal = () => {
    setSelectedStock(null);
  };

  // Sell stock and update the portfolio in the backend and localStorage
  const sellStock = async () => {
    if (selectedStock && sellShares > 0 && sellShares <= selectedStock.totalShares) {
      const updatedStock = {
        ...selectedStock,
        totalShares: selectedStock.totalShares - sellShares,
      };

      try {
        // Send the updated stock data to the API
        const response = await fetch('/api/portfolio', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stockTicker: updatedStock.symbol,
            totalShares: updatedStock.totalShares,
            averageBuyPrice: updatedStock.averagePrice,
          }),
        });

        if (response.ok) {
          const updatedPortfolio = portfolio.map(stock =>
            stock.symbol === selectedStock.symbol
              ? { ...stock, totalShares: stock.totalShares - sellShares }
              : stock
          );
          setPortfolio(updatedPortfolio); // Update state with the new portfolio
          localStorage.setItem('portfolio', JSON.stringify(updatedPortfolio)); // Update cache in localStorage
          closeSellModal();
        } else {
          console.error('Failed to sell stock');
        }
      } catch (error) {
        console.error('Error selling stock:', error);
      }
    }
  };

  return (
    <>
      <Header/>
      <div className="p-8 max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-5">Dashboard</h1>
        <div className="grid grid-cols-2 gap-10 h-24 mb-5">
          <TotalValueCard totalValue={10000} />
          <TotalProfitLossCard profitLoss={500} />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mt-10">Portfolio</h1>
        <p className="text-base text-gray-500 mb-5 mt-1">Click on a stock to sell it!</p>

        {isLoading ? (
          <p>Loading portfolio...</p> // Show loading message
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {portfolio.map(stock => (
              <StockCard key={stock.symbol} stock={stock} onClick={() => openSellModal(stock)} />
            ))}
          </div>
        )}

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
