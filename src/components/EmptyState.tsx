import React from 'react';
import { SearchX, RotateCcw, Plus, Info } from 'lucide-react';

interface EmptyStateProps {
  query: string;
  hasFilters: boolean;
  onClear: () => void;
  onOpenAddModal: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  query,
  hasFilters,
  onClear,
  onOpenAddModal,
}) => {
  return (
    <div className="text-center py-16 px-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs max-w-xl mx-auto my-8 space-y-4">
      <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 mx-auto flex items-center justify-center">
        <SearchX className="w-6 h-6 stroke-[1.75]" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white">
          No matching records found
        </h3>
        {query ? (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            No stored app, sender ID, number, alias, or message matches &ldquo;
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono">{query}</span>
            &rdquo;.
          </p>
        ) : (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            The database is currently empty or filtered out.
          </p>
        )}
      </div>

      <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 text-left space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
          <Info className="w-3.5 h-3.5 text-neutral-500" />
          <span>Search tips:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-500 dark:text-neutral-400">
          <li>Try typing partial letters (e.g. <span className="font-mono font-medium">fac</span>, <span className="font-mono font-medium">qcl</span>, <span className="font-mono font-medium">dri</span>)</li>
          <li>For masked SMS headers, use <span className="font-mono font-medium">XXXX</span> (e.g. <span className="font-mono font-medium">QclXXXX</span>, <span className="font-mono font-medium">ideXXXX</span>)</li>
          <li>Search by full phone numbers or shortcodes (e.g. <span className="font-mono font-medium">447873077777</span> or <span className="font-mono font-medium">67425</span>)</li>
          <li>If you have an active filter (Exact/Partial), try switching to <strong>All Matches</strong></li>
        </ul>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Search & Filters</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add this as a Record</span>
        </button>
      </div>
    </div>
  );
};
