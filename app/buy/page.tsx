"use client";
import { useState } from 'react';
import axios from 'axios';

interface StockInfo {
  symbol: string;
  price: number;
}

export default function BuyPage() {
  const [symbol, setSymbol] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStockInfo = async () => {
    try {
      const response = await axios.get(`/api/stock/${symbol}`);
      setStockInfo({ symbol, price: response.data.price });
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Stock symbol not found.');
    }
  };

  const handleBuy = () => {
    console.log(`Buying ${quantity} of ${symbol} at ${stockInfo?.price}`);
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Buy Stocks</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="symbol" className="block font-medium text-gray-600">NASDAQ Symbol</label>
          <input
            type="text"
            id="symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="border p-2 w-full mt-2 rounded-lg"
            placeholder="Enter stock symbol"
          />
          <button
            onClick={fetchStockInfo}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4 w-full"
          >
            Fetch Price
          </button>
        </div>

        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        {stockInfo && (
          <div>
            <p className="text-gray-600">Price per share: <span className="text-black">${stockInfo.price}</span></p>
            <div className="mb-4">
              <label htmlFor="quantity" className="block font-medium text-gray-600">Quantity</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border p-2 w-full mt-2 rounded-lg"
              />
            </div>
            <p className="text-gray-600">Total Price: <span className="text-black">${(quantity * stockInfo.price).toFixed(2)}</span></p>
            <button
              onClick={handleBuy}
              className="bg-green-500 text-white px-4 py-2 rounded mt-4 w-full"
            >
              Buy Shares
            </button>
          </div>
        )}
      </div>
    </div>
  );
}