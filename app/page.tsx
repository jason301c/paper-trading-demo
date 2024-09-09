"use client";
import { useState, useEffect } from "react";
import Loader from '@/components/Loader';
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence for notification animation
import axios from "axios";

/* Custom Imports */
import StockCard from "../components/StockCard";
import SellModal from "../components/SellModal";
import TotalValueCard from "../components/TotalValueCard";
import TotalProfitLossCard from "../components/TotalProfitLossCard";
import Notification from "../components/Notification"; // Import the Notification component
import { Tables, TablesUpdate } from "@/lib/database.types"; // Import Supabase's Database type

const Dashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Tables<'portfolio'>[]>([]);
  const [selectedStock, setSelectedStock] = useState<Tables<'portfolio'> | null>(null);
  const [sellShares, setSellShares] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState<number>(0);
  const [isPortfolioLoaded, setIsPortfolioLoaded] = useState<boolean>(false);
  const [isDashboardLoaded, setIsDashboardLoaded] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null); // For displaying notification

  /* Fetch portfolio and current price from API */
  const fetchPortfolio = async () => {
    try {
      setIsLoading(true); // Loading
      const response = await axios.get("/api/portfolio");
      if (response.status === 200) {
        const portfolioData = response.data;
        setPortfolio(portfolioData);
      } else {
        console.error("Failed to fetch portfolio");
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setIsLoading(false);
    }
    setIsPortfolioLoaded(true);
  };

  /* Calculate total value and profit/loss */
  useEffect(() => {
    let valueSum = 0;
    let pnlSum = 0;

    portfolio.forEach((stock) => {
      const stockValue = stock.totalShares * stock.lastKnownPrice;
      const stockPnL = stock.totalShares * (stock.lastKnownPrice - stock.averagePrice);
      valueSum += stockValue;
      pnlSum += stockPnL;
    });

    setTotalValue(valueSum);
    setTotalProfitLoss(pnlSum);
    setIsDashboardLoaded(true);
  }, [portfolio, isPortfolioLoaded]);

  /* Fetch portfolio on mount */
  useEffect(() => {
    fetchPortfolio();
  }, []);

  /* Open the sell modal */
  const openSellModal = (stock: Tables<'portfolio'>) => {
    setSelectedStock(stock);
    setSellShares(0);
  };

  /* Close the sell modal */
  const closeSellModal = () => {
    setSelectedStock(null);
  };

  /* Handling the selling of stocks */
  const sellStock = async () => {
    if (selectedStock && sellShares > 0 && sellShares <= selectedStock.totalShares) {
      setIsLoading(true);
      const updatedStock = {
        ...selectedStock,
        totalShares: selectedStock.totalShares - sellShares,
      };

      const requestBody: TablesUpdate<"portfolio"> = {
        symbol: updatedStock.symbol,
        totalShares: -sellShares, // Negative change for selling
        averagePrice: updatedStock.averagePrice,
      };

      try {
        const response = await axios.patch("/api/portfolio", requestBody);

        if (response.status === 200) {
          // Update the portfolio in the state without reloading
          const updatedPortfolio = portfolio.map((stock) =>
            stock.symbol === selectedStock.symbol
              ? { ...stock, totalShares: stock.totalShares - sellShares }
              : stock
          ).filter(stock => stock.totalShares > 0); // Remove stock if no shares are left

          setPortfolio(updatedPortfolio); // Update the portfolio state

          closeSellModal();

          // Show notification
          setNotificationMessage(`Sold ${sellShares} shares of ${selectedStock.symbol} for $${(sellShares * selectedStock.lastKnownPrice).toFixed(2)}`);
        } else {
          console.error("Failed to sell stock");
        }
      } catch (error) {
        console.error("Error selling stock:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      {/* Loader */}
      {isLoading && <Loader />}

      {/* Notification */}
      <AnimatePresence>
        {notificationMessage && (
          <Notification
            message={notificationMessage}
            onClose={() => setNotificationMessage(null)}
          />
        )}
      </AnimatePresence>

      {/* Dashboard Animation */}
      <motion.div
        className="p-8 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Total Value and Profit/Loss */}
        <div className="grid grid-cols-2 gap-10 h-24 mb-5">
          {isDashboardLoaded ? (
            <>
              <TotalValueCard totalValue={totalValue} />
              <TotalProfitLossCard profitLoss={totalProfitLoss} />
            </>
          ) : (
            <p>Loading portfolio data...</p>
          )}
        </div>

        {/* Portfolio */}
        <h1 className="text-3xl font-bold text-gray-800 mt-10">Portfolio</h1>
        <p className="text-base text-gray-500 mb-5 mt-1">Click on a stock to sell it!</p>

        <div className="grid grid-cols-1 gap-4">
          {portfolio.map((stock) => (
            <StockCard stock={stock} onClick={() => openSellModal(stock)} />
          ))}
        </div>

        {/* Sell Modal */}
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
