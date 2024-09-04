// components/SellModal.tsx
import React from 'react';
import { Stock } from '../types/Stock';

interface SellModalProps {
  stock: Stock;
  sellShares: number;
  setSellShares: (shares: number) => void;
  sellStock: () => void;
  closeModal: () => void;
}

const SellModal: React.FC<SellModalProps> = ({ stock, sellShares, setSellShares, sellStock, closeModal }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-8 rounded shadow-lg max-w-sm w-full">
      <h2 className="text-xl font-bold mb-4">Sell {stock.symbol}</h2>
      <p>Current Shares: {stock.totalShares}</p>
      <input
        type="number"
        value={sellShares}
        onChange={(e) => setSellShares(Number(e.target.value))}
        className="border p-2 w-full mt-4 mb-4"
      />
      <button
        onClick={sellStock}
        className="bg-red-500 text-white px-4 py-2 rounded w-full"
      >
        Sell Shares
      </button>
      <button
        onClick={closeModal}
        className="text-gray-600 mt-2 block text-center"
      >
        Close
      </button>
    </div>
  </div>
);

export default SellModal;