
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t mt-32 py-12 px-6 md:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Muahib Solutions</h3>
            <p className="text-gray-600 text-sm max-w-xs">
              We create beautiful, functional websites that help businesses grow and succeed online.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="tel:09125242686" 
                  className="text-gray-600 text-sm hover:text-black transition-colors"
                >
                  Phone: 09125242686
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/09125242686" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 text-sm hover:text-black transition-colors"
                >
                  WhatsApp: 09125242686
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/" 
                  className="text-gray-600 text-sm hover:text-black transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="/login" 
                  className="text-gray-600 text-sm hover:text-black transition-colors"
                >
                  Admin
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t text-center text-sm text-gray-600">
          <p>&copy; {currentYear} Muahib Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
