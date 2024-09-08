// components/Loader.tsx
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-50">
      <div className="loader"></div>

      {/* Loading spinner */}
      <style jsx>{`
        .loader {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #000;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
