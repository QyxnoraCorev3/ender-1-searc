import React, { useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, History, Sparkles } from 'lucide-react';
import { SearchFieldFilter, MatchTypeFilter, SortOption } from '../types';

interface SearchHeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  onClear: () => void;
  fieldFilter: SearchFieldFilter;
  onFieldFilterChange: (f: SearchFieldFilter) => void;
  matchFilter: MatchTypeFilter;
  onMatchFilterChange: (m: MatchTypeFilter) => void;
  sortOption: SortOption;
  onSortOptionChange: (s: SortOption) => void;
  recentSearches: string[];
  onSelectRecentSearch: (term: string) => void;
  onClearRecentSearches: () => void;
  resultCount: number;
  totalRecordsCount: number;
  countsByType: {
    exact: number;
    partial: number;
    possible: number;
  };
}

const EXAMPLE_QUERIES = [
  { label: 'fac', desc: 'Partial match (Facebook)' },
  { label: 'qcl', desc: 'Partial match (Qcloud)' },
  { label: 'QclXXXX', desc: 'Masked prefix' },
  { label: 'ideXXXX', desc: 'Masked stem' },
  { label: 'CHAXXXX', desc: 'Masked prefix' },
  { label: 'VGSXXXX', desc: 'Masked resemblance' },
  { label: '447873077777', desc: 'Gateway number' },
  { label: 'LNKDIN', desc: 'Sender ID' },
  { label: 'Authmsg', desc: 'Shared OTP sender' },
  { label: 'inDrive', desc: 'Multiple senders' },
];

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  query,
  onQueryChange,
  onClear,
  fieldFilter,
  onFieldFilterChange,
  matchFilter,
  onMatchFilterChange,
  sortOption,
  onSortOptionChange,
  recentSearches,
  onSelectRecentSearch,
  onClearRecentSearches,
  resultCount,
  totalRecordsCount,
  countsByType,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Press / or Cmd+K to focus search, Esc to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' && document.activeElement !== inputRef.current) || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        if (query) {
          onClear();
        } else {
          inputRef.current?.blur();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query, onClear]);

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Title area */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Sender Search
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Search apps, sender IDs, aliases and messages
            </p>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-sm">
              /
            </kbd>
            <span>or</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-sm">
              Cmd+K
            </kbd>
            <span>to search</span>
          </div>
        </div>

        {/* Main Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
            <Search className="h-5 w-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Type an app, masked sender (e.g. QclXXXX, ideXXXX), phone number, or text..."
            className="w-full pl-11 pr-24 py-3.5 text-base sm:text-lg bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:bg-white dark:focus:bg-neutral-800 transition-all shadow-xs"
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={onClear}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                title="Clear search (Esc)"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Example Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-neutral-500 dark:text-neutral-400 scrollbar-none">
          <span className="shrink-0 flex items-center gap-1 font-medium text-neutral-600 dark:text-neutral-400">
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
            Examples:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {EXAMPLE_QUERIES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => onQueryChange(ex.label)}
                className={`px-2 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer shrink-0 border ${
                  query.toLowerCase() === ex.label.toLowerCase()
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white'
                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                }`}
                title={ex.desc}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches (if any) */}
        {recentSearches.length > 0 && !query && (
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 overflow-x-auto pb-1">
            <span className="shrink-0 flex items-center gap-1">
              <History className="w-3 h-3" />
              Recent:
            </span>
            <div className="flex items-center gap-1.5">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onSelectRecentSearch(term)}
                  className="px-2 py-0.5 rounded-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
              <button
                type="button"
                onClick={onClearRecentSearches}
                className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 ml-1 underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Filter & Control Bar */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Match Type Segmented Control */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <button
              type="button"
              onClick={() => onMatchFilterChange('all')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                matchFilter === 'all'
                  ? 'bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              All Matches <span className="font-mono tabular-nums text-neutral-400 ml-1">({resultCount})</span>
            </button>
            <button
              type="button"
              onClick={() => onMatchFilterChange('exact')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                matchFilter === 'exact'
                  ? 'bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Exact <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 ml-1">({countsByType.exact})</span>
            </button>
            <button
              type="button"
              onClick={() => onMatchFilterChange('partial')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                matchFilter === 'partial'
                  ? 'bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Partial <span className="font-mono tabular-nums text-sky-600 dark:text-sky-400 ml-1">({countsByType.partial})</span>
            </button>
            <button
              type="button"
              onClick={() => onMatchFilterChange('possible')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                matchFilter === 'possible'
                  ? 'bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Possible <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400 ml-1">({countsByType.possible})</span>
            </button>
          </div>

          {/* Right: Field Filter and Sorting */}
          <div className="flex items-center gap-3">
            {/* Field Filter */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="field-filter" className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search:</span>
              </label>
              <select
                id="field-filter"
                value={fieldFilter}
                onChange={(e) => onFieldFilterChange(e.target.value as SearchFieldFilter)}
                className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-md px-2.5 py-1.5 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white cursor-pointer"
              >
                <option value="all">All Fields</option>
                <option value="name">App / Service Name</option>
                <option value="sender">Sender ID / Number</option>
                <option value="message">Message Text</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="sort-order" className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sort:</span>
              </label>
              <select
                id="sort-order"
                value={sortOption}
                onChange={(e) => onSortOptionChange(e.target.value as SortOption)}
                className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-md px-2.5 py-1.5 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white cursor-pointer"
              >
                <option value="relevance">Best Match (Exact First)</option>
                <option value="alpha-asc">Alphabetical (A → Z)</option>
                <option value="alpha-desc">Alphabetical (Z → A)</option>
                <option value="records-desc">Most Records First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Result Summary */}
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-1">
          <div>
            {query.trim() ? (
              <span>
                Found <strong className="font-mono tabular-nums text-neutral-900 dark:text-white font-semibold">{resultCount}</strong> matching record{resultCount === 1 ? '' : 's'} for &ldquo;<span className="font-medium text-neutral-900 dark:text-white">{query}</span>&rdquo; out of <span className="font-mono tabular-nums">{totalRecordsCount}</span> services
              </span>
            ) : (
              <span>
                Showing all <strong className="font-mono tabular-nums text-neutral-900 dark:text-white font-semibold">{totalRecordsCount}</strong> services stored in database
              </span>
            )}
          </div>
          {query.trim() && (
            <button
              type="button"
              onClick={onClear}
              className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline cursor-pointer"
            >
              Reset search
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
