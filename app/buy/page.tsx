"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';

interface StockInfo {
  symbol: string;
  price: number;
}

export default function BuyPage() {
  const [symbol, setSymbol] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch stock price from the market API
  useEffect(() => {
    let cancelTokenSource = axios.CancelToken.source();

    if (symbol.length > 0) {
      const fetchStockInfo = async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 250)); // Add small delay
          const response = await axios.get(`/api/market/${symbol}`, {
            cancelToken: cancelTokenSource.token,
          });

          if (response.status === 200) {
            setStockInfo({ symbol, price: response.data.stockPrice }); // Get price from market API
            setErrorMessage(null);
          }
        } catch (error) {
          if (!axios.isCancel(error)) {
            setErrorMessage('Stock symbol not found.');
            setStockInfo(null);
          }
        }
      };
      fetchStockInfo();
    }

    return () => {
      cancelTokenSource.cancel();
    };
  }, [symbol]);

  // Handle the buying action
  const handleBuy = async () => {
    if (stockInfo && quantity > 0) {
      try {
        // Send a request to the portfolio API to add/update the stock
        const response = await axios.post('/api/portfolio', {
          symbol: stockInfo.symbol,
          totalShares: quantity,
          averagePrice: stockInfo.price,
        });

        if (response.status === 200) {
          console.log(`Successfully bought ${quantity} shares of ${symbol}`);
        } else {
          console.error('Error adding stock to portfolio');
        }
      } catch (error) {
        console.error('Error buying stock:', error);
      }
    }
  };

  return (
    <>
      <Header />
      <div className="p-8 max-w-lg mx-auto">
        <div className="bg-white rounded-lg p-6 space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">Buy Stocks</h1>

          {/* Ticker Input */}
          <div className="flex flex-col">
            <label htmlFor="symbol" className="block font-medium text-gray-800">NASDAQ Code</label>
            <input
              type="text"
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="border p-2 w-full mt-2 rounded-lg"
              placeholder="e.g. MSFT"
            />
            <label className="block font-light text-sm text-gray-400 mt-1">Enter a symbol to get a quote.</label>
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
              disabled={!stockInfo} // Disable button if no stock info is available
            >
              Buy Shares
            </button>
            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
