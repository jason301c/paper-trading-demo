import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  useEffect(() => {
    // Automatically hide the notification after 3 seconds
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      className="fixed top-5 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 w-full max-w-sm"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      style={{
        backgroundColor: '#38b67c', // Modern green color
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow for a modern look
      }}
    >
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="font-semibold text-lg">{message}</span>
      </div>
    </motion.div>
  );
};

export default Notification;
