import React from 'react';
import { Sun, Moon, Database, Plus, Search } from 'lucide-react';

interface NavbarProps {
  stats: {
    totalApps: number;
    totalSenderIds: number;
    totalPhoneNumbers: number;
    totalMessages: number;
  };
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenDatasetModal: () => void;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  darkMode,
  onToggleDarkMode,
  onOpenDatasetModal,
  onOpenAddModal,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-bold text-lg shadow-xs">
            <Search className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <a href="/" className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              Sender Search
            </a>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">
              Search apps, sender IDs, aliases and messages
            </p>
          </div>
        </div>

        {/* Zone 2: Stored Dataset Telemetry */}
        <div className="hidden md:flex items-center gap-6 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 dark:text-neutral-500">Apps:</span>
            <span className="font-mono tabular-nums text-neutral-900 dark:text-neutral-200 font-semibold">{stats.totalApps}</span>
          </div>
          <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 dark:text-neutral-500">Senders:</span>
            <span className="font-mono tabular-nums text-neutral-900 dark:text-neutral-200 font-semibold">{stats.totalSenderIds + stats.totalPhoneNumbers}</span>
          </div>
          <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 dark:text-neutral-500">Messages:</span>
            <span className="font-mono tabular-nums text-neutral-900 dark:text-neutral-200 font-semibold">{stats.totalMessages}</span>
          </div>
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            title="Quick add single record"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </button>

          <button
            type="button"
            onClick={onOpenDatasetModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-md shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Dataset Manager</span>
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
