
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../UI/ThemeToggle';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';

const Navbar: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const navLinks = (
    <>
      <Link to="/" className="hover:text-indigo-400 transition-colors duration-200">Home</Link>
      <Link to="/report" className="hover:text-indigo-400 transition-colors duration-200">Report Item</Link>
      {currentUser && <Link to="/dashboard" className="hover:text-indigo-400 transition-colors duration-200">Dashboard</Link>}
      {currentUser?.isAdmin && <Link to="/admin" className="hover:text-indigo-400 transition-colors duration-200">Admin</Link>}
    </>
  );

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            Lost&Found
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            {navLinks}
            <ThemeToggle />
            {currentUser ? (
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200">
                Logout
              </button>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">Login</Link>
                <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200">Sign Up</Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} className="ml-4">
              {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
            {navLinks}
            {currentUser ? (
              <button onClick={handleLogout} className="w-full text-left bg-red-500 text-white px-3 py-2 rounded-md text-base font-medium mt-2">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="w-full text-left block px-3 py-2 rounded-md text-base font-medium">Login</Link>
                <Link to="/signup" className="w-full text-left block bg-indigo-600 text-white px-3 py-2 rounded-md text-base font-medium">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
   