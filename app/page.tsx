"use client";
import { useState, useEffect } from "react";
import Loader from '@/components/Loader';
import { motion } from "framer-motion";
import axios from "axios";

/* Custom Imports */
import StockCard from "../components/StockCard";
import SellModal from "../components/SellModal";
import TotalValueCard from "../components/TotalValueCard";
import TotalProfitLossCard from "../components/TotalProfitLossCard";
import { Tables, TablesUpdate } from "@/lib/database.types"; // Import Supabase's Database type

const Dashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Tables<'portfolio'>[]>([]);
  const [selectedStock, setSelectedStock] = useState<Tables<'portfolio'> | null>(null);
  const [sellShares, setSellShares] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState<number>(0);
  const [isPortfolioLoaded, setIsPortfolioLoaded] = useState<boolean>(false);

  /* Fetch portfolio and currnet price from API */
  const fetchPortfolio = async () => {
    try {
      setIsLoading(true); // Loading
      // Fetching
      const response = await axios.get("/api/portfolio");
      // Response handling
      if (response.status === 200) {
        const portfolioData = response.data; // Fetch portfolio data
        // Set the updated portfolio
        setPortfolio(portfolioData);
      } else {
        console.error("Failed to fetch portfolio");
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setIsLoading(false); // Hide loader
    }

    // Calculate dashboard information
    let valueSum = 0;
    let pnlSum = 0;

    portfolio.forEach(stock => {
      const stockValue = stock.totalShares * stock.lastKnownPrice; // Calculate total value of each stock
      const stockPnL = stock.totalShares * (stock.lastKnownPrice - stock.averagePrice); // Calculate PnL for each stock
      valueSum += stockValue;
      pnlSum += stockPnL;
    });

    setTotalValue(valueSum);
    setTotalProfitLoss(pnlSum);

    setIsPortfolioLoaded(true); // Portfolio is fully loaded
  };

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
  /* Called when the user presses the sell button */
  const sellStock = async () => {
    if (selectedStock && sellShares > 0 && sellShares <= selectedStock.totalShares) {
      // Loading
      setIsLoading(true);
      // Stock with totalShares updated
      const updatedStock = {
        ...selectedStock,
        totalShares: selectedStock.totalShares - sellShares,
      };

      // Construct request body for request
      const requestBody: TablesUpdate<"portfolio"> = {
        symbol: updatedStock.symbol,
        totalShares: -sellShares, // Negative change for selling
        averagePrice: updatedStock.averagePrice, // Use average price as the selling price
      };

      try {
        // Send the PATCH request to the API to update the portfolio
        const response = await axios.patch("/api/portfolio", requestBody);

        // Response handling
        if (response.status === 200) {
          const updatedPortfolio = portfolio.map((stock) =>
            stock.symbol === selectedStock.symbol
              ? { ...stock, totalShares: stock.totalShares - sellShares }
              : stock
          );
          setPortfolio(updatedPortfolio); // Update state with the new portfolio
          closeSellModal();
          window.location.reload();
        } else {
          console.error("Failed to sell stock");
        }
      } catch (error) {
        console.error("Error selling stock:", error);
      } finally {
        setIsLoading(false); // Hide loader
      }
    }
  };

  return (
    <>
      {/* Loader */}
      {isLoading && <Loader />}

      {/* Dashboard Animation */}
      <motion.div
        className="p-8 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >

        {/* Conditionally render the value and PnL cards */}
        <div className="grid grid-cols-2 gap-10 h-24 mb-5">
          {isPortfolioLoaded ? (
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
            <StockCard stock = {stock} onClick={() => openSellModal(stock)} />
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
