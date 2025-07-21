import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Fuse from 'fuse.js';
import { Site } from '@/lib/sites';

export interface SearchFilters {
  category?: string;
  sortBy?: 'name' | 'relevance' | 'date';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult extends Site {
  score?: number;
  matches?: Fuse.FuseResultMatch[];
}

interface SearchContextType {
  // Search state
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  searchFilters: SearchFilters;
  
  // Search actions
  setSearchQuery: (query: string) => void;
  performSearch: (query: string, sites: Site[]) => void;
  clearSearch: () => void;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  
  // Search history
  searchHistory: string[];
  addToHistory: (query: string) => void;
  clearHistory: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Fuse.js configuration for fuzzy search
const fuseOptions: Fuse.IFuseOptions<Site> = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'description', weight: 0.3 },
    { name: 'url', weight: 0.2 },
  ],
  threshold: 0.4, // Lower = more strict matching
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchQuery, setSearchQueryState] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    sortOrder: 'desc',
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const performSearch = useCallback((query: string, sites: Site[]) => {
    setIsSearching(true);
    
    try {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      const fuse = new Fuse(sites, fuseOptions);
      const fuseResults = fuse.search(query);
      
      // Convert Fuse results to SearchResult format
      let results: SearchResult[] = fuseResults.map(result => ({
        ...result.item,
        score: result.score,
        matches: result.matches,
      }));

      // Apply additional filtering and sorting
      results = applySorting(results, searchFilters);
      
      setSearchResults(results);
      
      // Add to search history if it's a meaningful query
      if (query.trim().length >= 2) {
        addToHistory(query.trim());
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchFilters]);

  const applySorting = (results: SearchResult[], filters: SearchFilters): SearchResult[] => {
    const { sortBy, sortOrder } = filters;
    
    return [...results].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'relevance':
          comparison = (a.score || 0) - (b.score || 0);
          break;
        case 'date':
          // For now, we'll use the ID as a proxy for creation date
          comparison = a.id.localeCompare(b.id);
          break;
        default:
          comparison = (a.score || 0) - (b.score || 0);
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  };

  const clearSearch = useCallback(() => {
    setSearchQueryState('');
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  const updateFilters = useCallback((filters: Partial<SearchFilters>) => {
    setSearchFilters(prev => ({ ...prev, ...filters }));
  }, []);

  const addToHistory = useCallback((query: string) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== query);
      return [query, ...filtered].slice(0, 10); // Keep only last 10 searches
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  const value: SearchContextType = {
    searchQuery,
    searchResults,
    isSearching,
    searchFilters,
    setSearchQuery,
    performSearch,
    clearSearch,
    updateFilters,
    searchHistory,
    addToHistory,
    clearHistory,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
