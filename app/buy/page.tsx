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
  // Auto-fetch stock price when symbol changes with a small delay
  useEffect(() => {
    let cancelTokenSource = axios.CancelToken.source();

    if (symbol.length > 0) {
      const fetchStockInfo = async () => {
        try {
          // Add a small delay before making the API request
          await new Promise((resolve) => setTimeout(resolve, 250));
          const response = await axios.get(`/api/stock/${symbol}`, {
            cancelToken: cancelTokenSource.token
          });
          setStockInfo({ symbol, price: response.data.price });
          setErrorMessage(null);
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

  const handleBuy = () => {
    console.log(`Buying ${quantity} of ${symbol} at ${stockInfo?.price}`);
  };

  return (
    <>
      <Header />
      <div className="p-8 max-w-lg mx-auto">
        <div className="bg-white rounded-lg p-6 space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">Buy Stocks</h1>
          {/* Row 1: Ticker input */}
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

          {/* Row 2: Quantity input and stock price */}
          <div className="grid grid-cols-2 gap-10">
            <div className="">
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
            <div className="">
              <label className="block font-medium text-gray-600">Price</label>
              <input
                type="text"
                value={stockInfo ? (quantity * parseFloat(stockInfo.price.toFixed(2)) + " USD") : "N/A"}
                className="border p-2 w-full rounded-lg bg-gray-100"
                min="1"
                readOnly={true}
              />
              </div>
            </div>

            {/* Row 3: Buy button */}
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
