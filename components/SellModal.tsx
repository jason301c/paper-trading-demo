import React, { useState } from 'react';
import Loader from '@/components/Loader'; // Import the loader component
import { motion } from 'framer-motion';
import { Tables } from '@/lib/database.types';
import Notification from '@/components/Notification'; // Import the notification component

/*
Properties of the Sell Modal
*/
interface SellModalProps {
  stock: Tables<'portfolio'>;
  sellShares: number;
  setSellShares: (shares: number) => void;
  sellStock: () => Promise<void>; // Modified to support async function for loader
  closeModal: () => void;
  setNotificationMessage: (message: string) => void; // New prop to set notification message
}

/*
Sell Modal component, which handles selling of stocks
*/
const SellModal: React.FC<SellModalProps> = ({ stock, sellShares, setSellShares, sellStock, closeModal, setNotificationMessage }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false); // Manage loading state

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSellShares(value === ' ' ? 0 : Number(value));
  };

  const handleSellStock = async () => {
    try {
      setIsLoading(true); // Set loading to true when selling stock
      await sellStock(); // Execute the stock selling operation
      setNotificationMessage(`Sold ${sellShares} stocks for ${sellShares * stock.averagePrice}$`); // Set notification message
      closeModal(); // Close the modal after successful sell
    } catch (error) {
      console.error('Error selling stock:', error);
    } finally {
      setIsLoading(false); // Set loading to false after operation
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm">
      {isLoading && <Loader />} {/* Display loader when loading */}

      <motion.div
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative"
        initial={{ opacity: 0, scale: 0.8 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.8 }} 
        transition={{ duration: 0.1, ease: 'easeInOut' }} 
      >
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
            onClick={handleSellStock} // Call the handler to sell the stock
            className="bg-black hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Sell Shares
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SellModal;