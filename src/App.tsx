import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SearchHeader } from './components/SearchHeader';
import { ResultCard } from './components/ResultCard';
import { DatasetModal } from './components/DatasetModal';
import { AddRecordModal } from './components/AddRecordModal';
import { EmptyState } from './components/EmptyState';
import { useDataset } from './hooks/useDataset';
import { searchRecords } from './utils/search';
import { SearchFieldFilter, MatchTypeFilter, SortOption } from './types';

const RECENT_SEARCHES_KEY = 'sender_search_recent_v1';
const DARK_MODE_KEY = 'sender_search_theme_v1';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(DARK_MODE_KEY);
      if (stored !== null) return stored === 'true';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply dark mode class to HTML element
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(DARK_MODE_KEY, 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(DARK_MODE_KEY, 'false');
      }
    } catch {
      // Ignore storage errors
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  // Dataset management hook
  const {
    rawDataset,
    records,
    stats,
    replaceDataset,
    appendDataset,
    resetToDefault,
    addSingleRecord,
  } = useDataset();

  // Search parameters
  const [query, setQuery] = useState('');
  const [fieldFilter, setFieldFilter] = useState<SearchFieldFilter>('all');
  const [matchFilter, setMatchFilter] = useState<MatchTypeFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('relevance');

  // Modals state
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Recent searches history
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.slice(0, 8);
      }
    } catch {
      // Ignore
    }
    return ['fac', 'QclXXXX', '447873077777', 'inDrive'];
  });

  // Record a search term in recent history on blur or debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;

    const timer = setTimeout(() => {
      setRecentSearches((prev) => {
        const filtered = prev.filter(t => t.toLowerCase() !== trimmed.toLowerCase());
        const updated = [trimmed, ...filtered].slice(0, 8);
        try {
          localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  }, []);

  // Calculate search results based on query and filters
  const searchResults = useMemo(() => {
    return searchRecords(records, query, fieldFilter, matchFilter, sortOption);
  }, [records, query, fieldFilter, matchFilter, sortOption]);

  // Compute breakdown counts across match types for current query
  const countsByType = useMemo(() => {
    if (!query.trim()) {
      return {
        exact: records.length,
        partial: 0,
        possible: 0,
      };
    }

    // Run unfiltered by matchType to count
    const allMatches = searchRecords(records, query, fieldFilter, 'all', sortOption);
    let exact = 0;
    let partial = 0;
    let possible = 0;

    for (const m of allMatches) {
      if (m.matchType === 'exact') exact++;
      else if (m.matchType === 'partial') partial++;
      else if (m.matchType === 'possible') possible++;
    }

    return { exact, partial, possible };
  }, [records, query, fieldFilter, sortOption]);

  const handleClear = useCallback(() => {
    setQuery('');
    setFieldFilter('all');
    setMatchFilter('all');
    setSortOption('relevance');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* 3-zone Header */}
      <Navbar
        stats={stats}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenDatasetModal={() => setIsDatasetModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Sticky Search Header with Filters & Controls */}
      <SearchHeader
        query={query}
        onQueryChange={setQuery}
        onClear={handleClear}
        fieldFilter={fieldFilter}
        onFieldFilterChange={setFieldFilter}
        matchFilter={matchFilter}
        onMatchFilterChange={setMatchFilter}
        sortOption={sortOption}
        onSortOptionChange={setSortOption}
        recentSearches={recentSearches}
        onSelectRecentSearch={(term) => setQuery(term)}
        onClearRecentSearches={handleClearRecentSearches}
        resultCount={searchResults.length}
        totalRecordsCount={records.length}
        countsByType={countsByType}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {searchResults.map((match) => (
              <ResultCard
                key={match.record.id}
                matchResult={match}
                searchQuery={query}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            query={query}
            hasFilters={fieldFilter !== 'all' || matchFilter !== 'all'}
            onClear={handleClear}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}
      </main>

      {/* Quiet, Clean Footer */}
      <footer className="w-full border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-6 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Sender Search</span>
            <span aria-hidden="true">·</span>
            <span>Local in-memory search engine</span>
            <span aria-hidden="true">·</span>
            <span>Zero external API lookups</span>
          </div>
          <div className="text-neutral-400 dark:text-neutral-500">
            Client-side data indexing · Original spelling preserved
          </div>
        </div>
      </footer>

      {/* Dataset Management Modal */}
      <DatasetModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
        currentRawDataset={rawDataset}
        onReplaceDataset={replaceDataset}
        onAppendDataset={appendDataset}
        onResetToDefault={resetToDefault}
      />

      {/* Quick Add Single Record Modal */}
      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRecord={addSingleRecord}
      />
    </div>
  );
}
