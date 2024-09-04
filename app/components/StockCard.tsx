import React from 'react';
import { Stock } from '../types/Stock';

interface StockCardProps {
  stock: Stock;
  onClick: () => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onClick }) => {
  // Round every value to 2 decimal points
  const currentValue = parseFloat(stock.currentValue.toFixed(2));
  const profitLoss = parseFloat(stock.profitLoss.toFixed(2));

  return (
    <div
      className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-transform duration-300 transform flex justify-between items-center border border-gray-300"
      onClick={onClick}
    >
      {/* Left: Stock ticker */}
      <div className="text-2xl font-bold text-gray-800 flex items-center h-full">
        {stock.symbol}
      </div>

      {/* Right: Current price and PnL */}
      <div className="text-right">
        <p className="text-lg text-gray-800">{currentValue} USD</p>
        <p className={`text-sm ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'} font-semibold`}>
          {profitLoss >= 0 ? '+$' : '-$'}
          {Math.abs(profitLoss)} ({stock.totalShares} shares)
        </p>
      </div>
    </div>
  );
};

export default StockCard;