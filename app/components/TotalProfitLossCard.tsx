import React from 'react';

interface TotalProfitLossCardProps {
  profitLoss: number;
}

const TotalProfitLossCard: React.FC<TotalProfitLossCardProps> = ({ profitLoss }) => {
  const formattedProfitLoss = profitLoss.toLocaleString();

return (
    <div className="bg-white shadow-md rounded-lg p-5 flex flex-col justify-between items- border border-gray-300 h-24">
        <div className="text-lg text-gray-400">
            Total Profit/Loss
        </div>
        <p className={`text-lg ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {profitLoss >= 0 ? '+' : '-'}${Math.abs(parseFloat(formattedProfitLoss))} USD
        </p>
    </div>
);
};

export default TotalProfitLossCard;