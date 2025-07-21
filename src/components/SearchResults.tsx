import React, { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, SortDesc, Grid, List, ExternalLink } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { usePagination } from '@/hooks/usePagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Pagination from '@/components/Pagination';
import SiteCard from '@/components/SiteCard';

interface SearchResultsProps {
  className?: string;
  showFilters?: boolean;
  itemsPerPage?: number;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  className = '',
  showFilters = true,
  itemsPerPage = 9
}) => {
  const {
    searchQuery,
    searchResults,
    isSearching,
    searchFilters,
    updateFilters
  } = useSearch();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Pagination for search results
  const {
    currentData: paginatedResults,
    currentPage,
    totalPages,
    goToPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
    totalItems
  } = usePagination({
    data: searchResults,
    itemsPerPage,
    initialPage: 1
  });

  // Reset to first page when search results change
  useEffect(() => {
    goToPage(1);
  }, [searchResults, goToPage]);

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [string, 'asc' | 'desc'];
    updateFilters({ sortBy: sortBy as any, sortOrder });
  };

  const handleCategoryChange = (category: string) => {
    updateFilters({ category: category === 'all' ? undefined : category });
  };

  const getSortValue = () => {
    return `${searchFilters.sortBy || 'relevance'}-${searchFilters.sortOrder || 'desc'}`;
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Technology' },
    { value: 'education', label: 'Education' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'portfolio', label: 'Portfolio' }
  ];

  const sortOptions = [
    { value: 'relevance-desc', label: 'Most Relevant' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' }
  ];

  if (!searchQuery && searchResults.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
        <p className="text-gray-500">Use the search bar above to find websites and projects</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Projects'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isSearching ? (
              'Searching...'
            ) : (
              `Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems} results`
            )}
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && showFilterPanel && (
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Category
                </label>
                <Select
                  value={searchFilters.category || 'all'}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Sort By
                </label>
                <Select value={getSortValue()} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Active Filters
                </label>
                <div className="flex flex-wrap gap-2">
                  {searchFilters.category && searchFilters.category !== 'all' && (
                    <Badge variant="secondary" className="gap-1">
                      {categories.find(c => c.value === searchFilters.category)?.label}
                      <button
                        onClick={() => handleCategoryChange('all')}
                        className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {searchFilters.sortBy !== 'relevance' && (
                    <Badge variant="secondary">
                      {sortOptions.find(s => s.value === getSortValue())?.label}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Searching...</span>
        </div>
      )}

      {/* No Results */}
      {!isSearching && searchResults.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500 mb-4">
            No projects match your search for "{searchQuery}"
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Try:</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Using different keywords</li>
              <li>• Checking your spelling</li>
              <li>• Using more general terms</li>
              <li>• Browsing all projects</li>
            </ul>
          </div>
        </div>
      )}

      {/* Results Grid/List */}
      {!isSearching && paginatedResults.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedResults.map((site, index) => (
                <div
                  key={site.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <SiteCard site={site} index={index} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedResults.map((site, index) => (
                <Card
                  key={site.id}
                  className="hover:shadow-md transition-shadow animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
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
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">
                              {site.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {site.description}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{site.url}</span>
                              {site.score && (
                                <Badge variant="outline" className="text-xs">
                                  {Math.round((1 - site.score) * 100)}% match
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="flex-shrink-0"
                          >
                            <a
                              href={site.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Visit
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                canGoNext={canGoNext}
                canGoPrevious={canGoPrevious}
                showPageNumbers={true}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
