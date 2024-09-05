import React from 'react';

interface TotalValueCardProps {
  totalValue: number;
}

const TotalValueCard: React.FC<TotalValueCardProps> = ({ totalValue }) => {
  const formattedValue = totalValue.toLocaleString();

  return (
    <div className="bg-white shadow-md rounded-lg p-5 flex flex-col justify-between items- border border-gray-300 h-24">
        <div className="text-lg text-gray-400">
        Total Value
      </div>
      <p className="text-lg text-black mt-0">${formattedValue} USD</p>
    </div>
  );
};

export default TotalValueCard;