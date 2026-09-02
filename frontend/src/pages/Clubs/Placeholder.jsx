import React from 'react';
import { motion } from 'framer-motion';

export default function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl max-w-md w-full"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg">
          <span className="text-2xl">🚧</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400">
          This feature is currently under development. Please check back later!
        </p>
      </motion.div>
    </div>
  );
}
