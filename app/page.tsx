"use client";
import { useState, useEffect } from "react";
import Loader from '@/components/Loader';
import { motion } from "framer-motion";
import axios from "axios";

/* Custom Imports */
import StockCard from "../components/StockCard";
import SellModal from "../components/SellModal";
import { Stock } from "../lib/Stock";
import TotalValueCard from "../components/TotalValueCard";
import TotalProfitLossCard from "../components/TotalProfitLossCard";
import { TablesUpdate } from "@/lib/database.types"; // Import Supabase's Database type

const Dashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [sellShares, setSellShares] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState<number>(0);
  const [isPortfolioLoaded, setIsPortfolioLoaded] = useState<boolean>(false);
  const [isDashboardLoaded, setIsDashboardLoaded] = useState<boolean>(false);


  /* Fetch the current stock price from the market API */
  const fetchCurrentValue = async (symbol: string) => {
    try {
      const response = await axios.get(`/api/market/${symbol}`); // Fetching from API

      if (response.status === 200) {
        return response.data.stockPrice;
      }

    } catch (error) {
      console.error("Stock symbol not found.");
    };
  };

  /* Fetch portfolio and currnet price from API */
  const fetchPortfolio = async () => {
    try {
      setIsLoading(true); // Loading
      // Fetching
      const response = await axios.get("/api/portfolio");
      // Response handling
      if (response.status === 200) {
        const portfolioData = response.data; // Fetch portfolio data
        // Add currentvalue to each stock object
        const updatedPortfolio = await Promise.all(
          portfolioData.map(async (stock: Stock) => {
            const currentPrice = await fetchCurrentValue(stock.symbol);
            return { ...stock, currentPrice }; // Add current price to each stock object
          })
        );
        // Set the updated portfolio
        setPortfolio(updatedPortfolio);
        setIsPortfolioLoaded(true); // Portfolio is fully loaded
      } else {
        console.error("Failed to fetch portfolio");
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setIsLoading(false); // Hide loader
      setIsPortfolioLoaded(true); // Portfolio is fully loaded
    }
  };

  /* Fetch portfolio on mount */
  useEffect(() => {
    fetchPortfolio();
  }, []);

  /* Calculate total value and PnL */
  const calculatePortfolioSummary = (portfolio: Stock[]) => {
    let valueSum = 0;
    let pnlSum = 0;

    portfolio.forEach(stock => {
      const stockValue = stock.totalShares * stock.currentPrice; // Calculate total value of each stock
      const stockPnL = stock.totalShares * (stock.currentPrice - stock.averagePrice); // Calculate PnL for each stock
      valueSum += stockValue;
      pnlSum += stockPnL;
    });

    setTotalValue(valueSum);
    setTotalProfitLoss(pnlSum);
    setIsDashboardLoaded(true);
  };

  /* Calculate total value and PnL */
  useEffect(() => {
    if (isPortfolioLoaded) {
      calculatePortfolioSummary(portfolio);
    }
  }, [isPortfolioLoaded, portfolio]);

  /* Open the sell modal */
  const openSellModal = (stock: Stock) => {
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
            <StockCard key={stock.symbol} stock={stock} onClick={() => openSellModal(stock)} />
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
