import React from 'react';
import { Stock } from '../types/Stock';

interface StockCardProps {
  stock: Stock;
  onClick: () => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onClick }) => (
  <div
    className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-transform duration-300 transform"
    onClick={onClick}
  >
    <h2 className="text-2xl font-semibold mb-4 text-gray-800">{stock.symbol}</h2>
    <p className="text-gray-500">Current Value: <span className="text-black font-bold">${stock.currentValue}</span></p>
    <p className="text-gray-500">Total Shares: <span className="text-black font-bold">{stock.totalShares}</span></p>
    <p className={`text-sm ${stock.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'} font-semibold`}>
      Profit/Loss: ${stock.profitLoss}
    </p>
  </div>

);

export default StockCard;