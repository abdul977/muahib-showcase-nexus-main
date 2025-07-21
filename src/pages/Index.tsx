
import React, { useEffect } from 'react';
import { useSites } from '@/context/SiteContext';
import { useSearch } from '@/context/SearchContext';
import { usePagination } from '@/hooks/usePagination';
import SiteCard from '@/components/SiteCard';
import Pagination from '@/components/Pagination';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';

const Index = () => {
  const { sites, isLoading } = useSites();
  const { searchQuery, searchResults } = useSearch();

  // Determine which data to paginate (search results or all sites)
  const displayData = searchQuery ? searchResults : sites;

  // Pagination setup - 7 sites per page
  const {
    currentData: paginatedSites,
    currentPage,
    totalPages,
    goToPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
    totalItems
  } = usePagination({
    data: displayData,
    itemsPerPage: 7,
    initialPage: 1
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

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

            {/* Mobile Search Bar */}
            <div className="lg:hidden max-w-md mx-auto mb-8">
              <SearchBar placeholder="Search our portfolio..." />
            </div>

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
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Projects'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-balance">
              {searchQuery
                ? `Found ${totalItems} project${totalItems !== 1 ? 's' : ''} matching your search`
                : 'Explore our collection of beautifully crafted websites that have helped businesses succeed online.'
              }
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl aspect-video mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : displayData.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery ? (
                <div>
                  <p className="text-gray-500 text-lg mb-2">No projects found for "{searchQuery}"</p>
                  <p className="text-gray-400 text-sm">Try different keywords or browse all projects</p>
                </div>
              ) : (
                <p className="text-gray-500 text-lg">No projects found.</p>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {paginatedSites.map((site, index) => (
                  <div
                    key={site.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                  >
                    <SiteCard site={site} index={index} />
                  </div>
                ))}
              </div>

              {/* Pagination Component */}
              {totalPages > 1 && (
                <div className="mt-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    canGoPrevious={canGoPrevious}
                    canGoNext={canGoNext}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalItems={totalItems}
                    className="justify-center"
                  />
                </div>
              )}
            </>
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
