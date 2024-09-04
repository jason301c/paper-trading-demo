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
    // Call an API to save the purchase (in real application)
    console.log(`Buying ${quantity} of ${symbol} at ${stockInfo?.price}`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Buy Stocks</h1>
      <div className="mb-4">
        <label htmlFor="symbol" className="block font-medium">NASDAQ Symbol</label>
        <input
          type="text"
          id="symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          className="border p-2 w-full"
        />
        <button
          onClick={fetchStockInfo}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Fetch Price
        </button>
      </div>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {stockInfo && (
        <div>
          <p>Price per share: ${stockInfo.price}</p>
          <div className="mb-4">
            <label htmlFor="quantity" className="block font-medium">Quantity</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border p-2 w-full"
            />
          </div>
          <p>Total Price: ${(quantity * stockInfo.price).toFixed(2)}</p>
          <button
            onClick={handleBuy}
            className="bg-green-500 text-white px-4 py-2 rounded mt-4"
          >
            Buy Shares
          </button>
        </div>
      )}
    </div>
  );
}
