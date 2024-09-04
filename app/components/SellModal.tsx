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

  // Function to handle the input value and make sure it accepts numbers and clears correctly
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow the input to be empty temporarily and still display it
    setSellShares(value === ' ' ? 0 : Number(value));
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Sell {stock.symbol}</h2>
        <p className="text-gray-600 mb-4">Current Shares: <span className="font-bold text-black">{stock.totalShares}</span></p>
        <input
          type="number"
          value={sellShares === 0 ? '' : sellShares}
          onChange={handleInputChange}
          className="border-2 border-gray-300 rounded-lg p-2 w-full mb-4"
          min="0"
          placeholder="Enter number of shares"
        />
        <button
          onClick={sellStock}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full transition-colors"
        >
          Sell Shares
        </button>
        <button
          onClick={closeModal}
          className="text-gray-600 mt-4 block text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SellModal;
