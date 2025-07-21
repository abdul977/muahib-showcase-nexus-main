import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, Clock, TrendingUp } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { useSites } from '@/context/SiteContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SearchBarProps {
  onResultSelect?: (siteId: string) => void;
  placeholder?: string;
  showFilters?: boolean;
  compact?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onResultSelect,
  placeholder = "Search websites, services, or descriptions...",
  showFilters = true,
  compact = false
}) => {
  const { sites } = useSites();
  const {
    searchQuery,
    searchResults,
    isSearching,
    searchHistory,
    setSearchQuery,
    performSearch,
    clearSearch,
    updateFilters,
    searchFilters
  } = useSearch();

  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle input changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery, sites);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, sites, performSearch]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleResultClick = (siteId: string) => {
    setShowSuggestions(false);
    setIsOpen(false);
    onResultSelect?.(siteId);
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    inputRef.current?.focus();
  };

  const handleClearSearch = () => {
    clearSearch();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const popularSearches = [
    'website development',
    'mobile app',
    'AI integration',
    'chatbot',
    'graphics design'
  ];

  return (
    <div ref={searchRef} className={`relative ${compact ? 'w-full max-w-md' : 'w-full max-w-2xl'}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          className={`pl-10 pr-12 ${compact ? 'h-10' : 'h-12'} bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500`}
        />
        
        {/* Clear button */}
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border-gray-200">
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            {/* Search Results */}
            {searchQuery.trim() && searchResults.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Search Results</span>
                  <Badge variant="secondary" className="text-xs">
                    {searchResults.length}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {searchResults.slice(0, 5).map((site) => (
                    <div
                      key={site.id}
                      onClick={() => handleResultClick(site.id)}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                        <img
                          src={site.image}
                          alt={site.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {site.name}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {site.description}
                        </p>
                        <span className="text-xs text-blue-600 mt-1 block">
                          {site.url}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
                <p className="text-xs text-gray-400 mt-1">Try different keywords or browse our portfolio</p>
              </div>
            )}

            {/* Search History */}
            {!searchQuery.trim() && searchHistory.length > 0 && (
              <>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                  </div>
                  
                  <div className="space-y-1">
                    {searchHistory.slice(0, 5).map((query, index) => (
                      <div
                        key={index}
                        onClick={() => handleHistoryClick(query)}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{query}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Popular Searches */}
            {!searchQuery.trim() && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Popular Searches</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleHistoryClick(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
