import { Tables } from '@/lib/database.types';
import React from 'react';

interface StockCardProps {
  stock: Tables<'portfolio'>;
  onClick: () => void;
}
const StockCard: React.FC<StockCardProps> = ({ stock, onClick }) => {

  const profitLoss = stock.lastKnownPrice !== null ? ((stock.lastKnownPrice - stock.averagePrice) * stock.totalShares) : 0;

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
        <p className="text-lg text-gray-800">{(stock.lastKnownPrice || 0)} USD</p>
        <p className={`text-sm ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'} font-semibold`}>
          {profitLoss >= 0 ? '+$' : '-$'}
          {Math.abs(profitLoss).toFixed(2)} ({stock.totalShares} shares)
        </p>
      </div>
    </div>
  );
};

export default StockCard;