import Fuse from 'fuse.js';
import { Site } from '@/lib/sites';
import { SearchResult, SearchFilters } from '@/context/SearchContext';

// Enhanced search configuration
export const searchConfig = {
  // Fuse.js options for fuzzy search
  fuseOptions: {
    keys: [
      { name: 'name', weight: 0.4 },
      { name: 'description', weight: 0.3 },
      { name: 'url', weight: 0.2 },
      { name: 'tags', weight: 0.1 }, // For future use
    ],
    threshold: 0.4, // Lower = more strict matching (0.0 = perfect match, 1.0 = match anything)
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    ignoreLocation: true,
    useExtendedSearch: true, // Enables advanced search patterns
    findAllMatches: true,
  },
  
  // Search categories for filtering
  categories: [
    'all',
    'business',
    'technology',
    'education',
    'ecommerce',
    'portfolio',
    'corporate'
  ],
  
  // Popular search terms
  popularSearches: [
    'website development',
    'mobile app',
    'AI integration',
    'chatbot',
    'graphics design',
    'business website',
    'ecommerce',
    'portfolio'
  ]
};

export class SearchEngine {
  private fuse: Fuse<Site>;
  private sites: Site[];

  constructor(sites: Site[]) {
    this.sites = sites;
    this.fuse = new Fuse(sites, searchConfig.fuseOptions);
  }

  // Update sites data
  updateSites(sites: Site[]) {
    this.sites = sites;
    this.fuse = new Fuse(sites, searchConfig.fuseOptions);
  }

  // Main search function
  search(query: string, filters?: SearchFilters): SearchResult[] {
    if (!query.trim()) {
      return this.getAllSites(filters);
    }

    // Perform fuzzy search
    const fuseResults = this.fuse.search(this.preprocessQuery(query));
    
    // Convert to SearchResult format
    let results: SearchResult[] = fuseResults.map(result => ({
      ...result.item,
      score: result.score,
      matches: result.matches,
    }));

    // Apply additional filtering
    results = this.applyFilters(results, filters);
    
    // Apply sorting
    results = this.applySorting(results, filters);

    return results;
  }

  // Get all sites with optional filtering
  private getAllSites(filters?: SearchFilters): SearchResult[] {
    let results: SearchResult[] = this.sites.map(site => ({
      ...site,
      score: 0,
    }));

    results = this.applyFilters(results, filters);
    results = this.applySorting(results, filters);

    return results;
  }

  // Preprocess search query for better results
  private preprocessQuery(query: string): string {
    // Remove special characters and normalize
    let processed = query.trim().toLowerCase();
    
    // Handle common synonyms and variations
    const synonyms: Record<string, string> = {
      'web': 'website',
      'site': 'website',
      'app': 'application',
      'mobile': 'mobile app',
      'ai': 'artificial intelligence',
      'bot': 'chatbot',
      'design': 'graphics design',
      'shop': 'ecommerce',
      'store': 'ecommerce',
      'business': 'corporate',
      'company': 'corporate'
    };

    // Replace synonyms
    Object.entries(synonyms).forEach(([key, value]) => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      processed = processed.replace(regex, value);
    });

    return processed;
  }

  // Apply additional filters beyond fuzzy search
  private applyFilters(results: SearchResult[], filters?: SearchFilters): SearchResult[] {
    if (!filters) return results;

    let filtered = [...results];

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(site => 
        this.categorizeWebsite(site).includes(filters.category!)
      );
    }

    return filtered;
  }

  // Categorize websites based on content
  private categorizeWebsite(site: Site): string[] {
    const categories: string[] = ['all'];
    const content = `${site.name} ${site.description} ${site.url}`.toLowerCase();

    // Business/Corporate
    if (content.includes('business') || content.includes('corporate') || 
        content.includes('consulting') || content.includes('services')) {
      categories.push('business');
    }

    // Technology
    if (content.includes('tech') || content.includes('software') || 
        content.includes('digital') || content.includes('innovation')) {
      categories.push('technology');
    }

    // Education
    if (content.includes('university') || content.includes('education') || 
        content.includes('learning') || content.includes('course')) {
      categories.push('education');
    }

    // E-commerce
    if (content.includes('shop') || content.includes('marketplace') || 
        content.includes('store') || content.includes('ecommerce')) {
      categories.push('ecommerce');
    }

    // Portfolio
    if (content.includes('portfolio') || content.includes('showcase') || 
        content.includes('gallery')) {
      categories.push('portfolio');
    }

    return categories;
  }

  // Apply sorting to results
  private applySorting(results: SearchResult[], filters?: SearchFilters): SearchResult[] {
    if (!filters) return results;

    const { sortBy = 'relevance', sortOrder = 'desc' } = filters;

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
          // Use ID as proxy for creation date
          comparison = a.id.localeCompare(b.id);
          break;
        default:
          comparison = (a.score || 0) - (b.score || 0);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // Get search suggestions based on partial input
  getSuggestions(partialQuery: string, limit: number = 5): string[] {
    if (!partialQuery.trim()) {
      return searchConfig.popularSearches.slice(0, limit);
    }

    const query = partialQuery.toLowerCase();
    const suggestions: Set<string> = new Set();

    // Add matching popular searches
    searchConfig.popularSearches.forEach(search => {
      if (search.toLowerCase().includes(query)) {
        suggestions.add(search);
      }
    });

    // Add matching site names and descriptions
    this.sites.forEach(site => {
      const name = site.name.toLowerCase();
      const description = site.description.toLowerCase();
      
      if (name.includes(query)) {
        suggestions.add(site.name);
      }
      
      // Extract relevant words from description
      const words = description.split(' ').filter(word => 
        word.length > 3 && word.includes(query)
      );
      words.forEach(word => suggestions.add(word));
    });

    return Array.from(suggestions).slice(0, limit);
  }

  // Get related search terms
  getRelatedSearches(query: string, limit: number = 3): string[] {
    const related: string[] = [];
    const queryLower = query.toLowerCase();

    // Technology-related terms
    if (queryLower.includes('web') || queryLower.includes('site')) {
      related.push('mobile app development', 'AI integration', 'responsive design');
    } else if (queryLower.includes('mobile') || queryLower.includes('app')) {
      related.push('iOS development', 'Android development', 'cross-platform');
    } else if (queryLower.includes('ai') || queryLower.includes('artificial')) {
      related.push('chatbot development', 'automation', 'machine learning');
    } else if (queryLower.includes('design') || queryLower.includes('graphics')) {
      related.push('UI/UX design', 'branding', 'logo design');
    } else {
      // Default related searches
      related.push('website development', 'mobile apps', 'AI integration');
    }

    return related.slice(0, limit);
  }

  // Highlight search matches in text
  highlightMatches(text: string, matches?: Fuse.FuseResultMatch[]): string {
    if (!matches || matches.length === 0) return text;

    let highlightedText = text;
    
    // Sort matches by position (descending) to avoid index shifting
    const sortedMatches = matches
      .flatMap(match => match.indices)
      .sort((a, b) => b[0] - a[0]);

    sortedMatches.forEach(([start, end]) => {
      const before = highlightedText.substring(0, start);
      const match = highlightedText.substring(start, end + 1);
      const after = highlightedText.substring(end + 1);
      
      highlightedText = `${before}<mark class="bg-yellow-200 px-1 rounded">${match}</mark>${after}`;
    });

    return highlightedText;
  }
}

// Utility functions for search analytics
export const searchAnalytics = {
  // Track search queries
  trackSearch: (query: string, resultsCount: number) => {
    const searchData = {
      query,
      resultsCount,
      timestamp: new Date().toISOString(),
    };
    
    // Store in localStorage for now (could be sent to analytics service)
    const searches = JSON.parse(localStorage.getItem('searchAnalytics') || '[]');
    searches.push(searchData);
    
    // Keep only last 100 searches
    if (searches.length > 100) {
      searches.splice(0, searches.length - 100);
    }
    
    localStorage.setItem('searchAnalytics', JSON.stringify(searches));
  },

  // Get popular searches
  getPopularSearches: (limit: number = 10): Array<{ query: string; count: number }> => {
    const searches = JSON.parse(localStorage.getItem('searchAnalytics') || '[]');
    const queryCount: Record<string, number> = {};
    
    searches.forEach((search: any) => {
      queryCount[search.query] = (queryCount[search.query] || 0) + 1;
    });
    
    return Object.entries(queryCount)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  // Clear analytics data
  clearAnalytics: () => {
    localStorage.removeItem('searchAnalytics');
  }
};
