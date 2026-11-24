import React from 'react';
import { Search, Filter, Plus, SlidersHorizontal } from 'lucide-react';

export default function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records by name, ID, or keyword...',
  filterOptions = [],
  activeFilter,
  onFilterChange,
  secondaryFilterOptions = [],
  activeSecondaryFilter,
  onSecondaryFilterChange,
  actionButtonLabel,
  onActionButtonClick,
  actionIcon: ActionIcon = Plus,
  totalCount = null
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 text-navy-900"
          />
        </div>

        {/* Primary Filter Dropdown */}
        {filterOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={activeFilter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="py-2 pl-3 pr-8 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Secondary Filter Dropdown */}
        {secondaryFilterOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={activeSecondaryFilter}
              onChange={(e) => onSecondaryFilterChange(e.target.value)}
              className="py-2 pl-3 pr-8 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {secondaryFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 justify-between sm:justify-end">
        {totalCount !== null && (
          <span className="text-xs font-semibold text-slate-500 px-2 py-1 bg-slate-100 rounded-md">
            {totalCount} {totalCount === 1 ? 'record' : 'records'}
          </span>
        )}

        {actionButtonLabel && (
          <button
            onClick={onActionButtonClick}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          >
            <ActionIcon className="w-4 h-4" />
            <span>{actionButtonLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
