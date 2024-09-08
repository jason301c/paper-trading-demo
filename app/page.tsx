"use client";
import { useState, useEffect } from "react";
import StockCard from "../components/StockCard";
import SellModal from "../components/SellModal";
import Loader from '@/components/Loader';
import { Stock } from "../lib/Stock";
import TotalValueCard from "../components/TotalValueCard";
import TotalProfitLossCard from "../components/TotalProfitLossCard";
import { TablesUpdate } from "@/lib/database.types"; // Import Supabase's Database type
import { motion } from "framer-motion"; // Import framer-motion

const Dashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [sellShares, setSellShares] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch portfolio data from API
  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      // Now fetch the fresh portfolio data in the background
      const response = await fetch("/api/portfolio");
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data); // Update state with fresh portfolio from API
      } else {
        console.error("Failed to fetch portfolio");
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
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

      const requestBody: TablesUpdate<"portfolio"> = {
        symbol: updatedStock.symbol,
        totalShares: -sellShares, // Negative change for selling
        averagePrice: updatedStock.averagePrice, // Use average price as the selling price
      };

      try {
        // Send the PATCH request to the API to update the portfolio
        const response = await fetch("/api/portfolio", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const updatedPortfolio = portfolio.map((stock) =>
            stock.symbol === selectedStock.symbol
              ? { ...stock, totalShares: stock.totalShares - sellShares }
              : stock
          );
          setPortfolio(updatedPortfolio); // Update state with the new portfolio
          window.location.reload();
          closeSellModal();
        } else {
          console.error("Failed to sell stock");
        }
      } catch (error) {
        console.error("Error selling stock:", error);
      }
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <motion.div
        className="p-8 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
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
            {portfolio.map((stock) => (
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
      </motion.div>
    </>
  );
};

export default Dashboard;
