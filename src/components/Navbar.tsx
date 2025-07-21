
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-8 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0"
          >
            <span className="font-semibold text-xl tracking-tight">
              Muahib Solutions
            </span>
          </Link>

          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <SearchBar compact placeholder="Search projects..." />
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-black ${
                location.pathname === '/' ? 'text-black' : 'text-gray-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/login" 
              className={`text-sm font-medium transition-colors hover:text-black ${
                location.pathname === '/login' ? 'text-black' : 'text-gray-600'
              }`}
            >
              Admin
            </Link>
            <a
              href="tel:09125242686"
              className="text-sm font-medium transition-colors hover:text-black text-gray-600"
            >
              Call: 09125242686
            </a>
            <a
              href="https://wa.me/09125242686"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium transition-colors hover:text-black text-gray-600"
            >
              WhatsApp
            </a>
          </nav>
          
          <div className="md:hidden flex items-center">
            <a
              href="tel:09125242686"
              className="text-sm font-medium transition-colors hover:text-black text-gray-600 mr-4"
            >
              Call
            </a>
            <a
              href="https://wa.me/09125242686"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium transition-colors hover:text-black text-gray-600"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
