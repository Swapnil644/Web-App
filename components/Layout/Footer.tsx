
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Lost and Found Platform. All rights reserved.</p>
        <p className="text-sm mt-1">Built with React, Firebase, and Tailwind CSS.</p>
      </div>
    </footer>
  );
};

export default Footer;
   