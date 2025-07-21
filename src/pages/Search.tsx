import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '@/context/SearchContext';
import { useSites } from '@/context/SiteContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';

const Search = () => {
  const [searchParams] = useSearchParams();
  const { sites } = useSites();
  const { setSearchQuery, performSearch } = useSearch();
  
  const queryParam = searchParams.get('q') || '';

  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
      performSearch(queryParam, sites);
    }
  }, [queryParam, sites, setSearchQuery, performSearch]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Search Header */}
      <section className="pt-32 pb-12 px-6 md:px-8 bg-gray-50">
        <div className="container mx-auto max-w-screen-xl">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
              Search Our Portfolio
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Find the perfect project inspiration from our collection of websites
            </p>
            
            {/* Main Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchBar 
                placeholder="Search projects, technologies, or descriptions..."
                showFilters={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      <section className="flex-1 py-12 px-6 md:px-8">
        <div className="container mx-auto max-w-screen-xl">
          <SearchResults 
            showFilters={true}
            itemsPerPage={12}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Search;
