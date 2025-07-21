
import React, { useEffect } from 'react';
import { useSites } from '@/context/SiteContext';
import SiteCard from '@/components/SiteCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Index = () => {
  const { sites, isLoading } = useSites();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 md:px-8">
        <div className="container mx-auto max-w-screen-xl">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 rounded-full mb-4 inline-block">
              Portfolio Showcase
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-balance">
              We build digital experiences that inspire
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 text-balance">
              Muahib Solutions creates stunning websites that transform your online presence and drive business growth.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <a href="tel:09125242686">
                <button className="px-6 py-3 text-white bg-black rounded-full hover:bg-black/90 transition-all duration-300 text-sm font-medium">
                  Call Us
                </button>
              </a>
              <a href="https://wa.me/09125242686" target="_blank" rel="noopener noreferrer">
                <button className="px-6 py-3 text-black bg-white border border-gray-300 rounded-full hover:border-gray-400 transition-all duration-300 text-sm font-medium">
                  WhatsApp
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Portfolio Section */}
      <section className="py-16 px-6 md:px-8">
        <div className="container mx-auto max-w-screen-xl">
          <div className="max-w-4xl mx-auto mb-12 text-center animate-slide-up">
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 rounded-full mb-4 inline-block">
              Our Work
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-balance">
              Featured Projects
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-balance">
              Explore our collection of beautifully crafted websites that have helped businesses succeed online.
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl aspect-video mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {sites.map((site, index) => (
                <div 
                  key={site.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <SiteCard site={site} index={index} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="py-20 px-6 md:px-8">
        <div className="container mx-auto max-w-screen-xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <span className="px-3 py-1 text-xs font-medium bg-gray-100 rounded-full mb-4 inline-block">
                Get In Touch
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-balance">
                Ready to elevate your online presence?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 text-balance">
                Contact us today to discuss your website needs and discover how we can help you achieve your digital goals.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a href="tel:09125242686">
                  <button className="px-8 py-4 text-white bg-black rounded-full hover:bg-black/90 transition-all duration-300 text-sm font-medium">
                    Call: 09125242686
                  </button>
                </a>
                <a href="https://wa.me/09125242686" target="_blank" rel="noopener noreferrer">
                  <button className="px-8 py-4 text-black bg-white border border-gray-300 rounded-full hover:border-gray-400 transition-all duration-300 text-sm font-medium">
                    WhatsApp: 09125242686
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
