"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";

/* Custom imports */
import Loader from "@/components/Loader";
import type { TablesUpdate } from "@/lib/database.types";

/* Interface for information needed */
interface StockInfo {
  symbol: string;
  price: number;
}

/*
  This page allows users to buy stocks by entering a stock ticker and quantity.
  The stock price is fetched from the market API and displayed to the user.
  When the user clicks the "Buy Shares" button, a request is sent to the portfolio API to add the stock to the user's portfolio.
 */
export default function BuyPage() {
  const [symbol, setSymbol] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  /* Handles stock market fetching */
  const fetchStockInfo = async (symbol: string) => {
    setIsLoading(true); // Loading

    try {
      const response = await axios.get(`/api/market/${symbol}`); // Fetching from API

      if (response.status === 200) {
        setStockInfo({ symbol, price: response.data.stockPrice });
        setErrorMessage(null);
      }
    } catch (error) {
      setErrorMessage("Stock symbol not found.");
      setStockInfo(null);
    } finally {
      setIsLoading(false); // Loading
    }
  };

  /* Handle symbol input change and listen for "Enter" key */
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && symbol.length > 0) {
      fetchStockInfo(symbol);
    }
  };

  /* Handle buy button click */
  const handleBuy = async () => {
    if (stockInfo && quantity > 0) {
      // Construct a request body to perform the buy
      const requestBody: TablesUpdate<"portfolio"> = {
        symbol: stockInfo.symbol,
        averagePrice: stockInfo.price,
        totalShares: quantity,
      };
      try {
        setIsLoading(true); // Loading

        // Send the request
        const response = await axios.patch("/api/portfolio", requestBody);

        // Response handling
        if (response.status === 200) {
          console.log(`Successfully bought ${quantity} shares of ${symbol}`);
          router.push("/"); // Redirect to main page
        } else {
          console.error("Error adding stock to portfolio");
        }
      } catch (error) {
        console.error("Error buying stock:", error);
      } finally {
        setIsLoading(false); // Hide loader
      }
    } else {
      setErrorMessage("Invalid quantity or stock information.");
    }
  };

  return (
    <>
      {/* Loader */}
      {isLoading && <Loader />}

      {/* Opening animation */}
      <motion.div
        className="p-8 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="bg-white rounded-lg p-6 space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">Buy Stocks</h1>

          {/* Ticker Input */}
          <div className="flex flex-col">
            <label htmlFor="symbol" className="block font-medium text-gray-800">
              NASDAQ Code
            </label>
            <input
              type="text"
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyDown={handleKeyPress} // Add event listener for Enter key
              className="border p-2 w-full mt-2 rounded-lg"
              placeholder="e.g. MSFT"
            />
            <label className="block font-light text-sm text-gray-400 mt-1">
              Enter code and press "Enter" to fetch the stock price.
            </label>
          </div>

          {/* Quantity Input and Stock Price */}
          <div className="grid grid-cols-2 gap-10">
            <div>
              <label className="block font-medium text-gray-600">Quantity</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border p-2 w-full rounded-lg"
                min="1"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-600">Price</label>
              <input
                type="text"
                value={stockInfo ? (quantity * stockInfo.price).toFixed(2) + " USD" : "N/A"}
                className="border p-2 w-full rounded-lg bg-gray-100"
                readOnly
              />
            </div>
          </div>

          {/* Buy Button */}
          <div>
            <button
              onClick={handleBuy}
              className="bg-black text-white font-medium px-4 py-2 rounded w-full mt-2"
              disabled={!stockInfo || quantity <= 0} // Disable button if no stock info or invalid quantity
            >
              Buy Shares
            </button>
            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
          </div>
        </div>
      </motion.div>
    </>
  );
}
