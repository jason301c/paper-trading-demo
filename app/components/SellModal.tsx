import React from 'react';
import { Stock } from '../types/Stock';

interface SellModalProps {
  stock: Stock;
  sellShares: number;
  setSellShares: (shares: number) => void;
  sellStock: () => void;
  closeModal: () => void;
}

const SellModal: React.FC<SellModalProps> = ({ stock, sellShares, setSellShares, sellStock, closeModal }) => {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSellShares(value === ' ' ? 0 : Number(value));
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
        <button
          onClick={closeModal}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-left text-gray-800">Sell {stock.symbol}</h2>
        <p className="text-gray-600 text-xs mb-4">How many units would you like to sell?</p>
        <input
          type="number"
          value={sellShares === 0 ? '' : sellShares}
          onChange={handleInputChange}
          className="border-2 border-gray-300 rounded-lg p-2 w-full mb-2"
          min="0"
          placeholder="Enter number of shares"
        />
        <p className="text-gray-600 text-sm mb-2"> You bought {stock.totalShares} units at {stock.averagePrice} USD</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={closeModal}
            className="bg-white font-bold py-2 px-4 rounded border border-gray-300 hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={sellStock}
            className="bg-black hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Sell Shares
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellModal;
