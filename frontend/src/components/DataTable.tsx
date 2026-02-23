import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
  searchable?: boolean;
  searchFields?: (keyof T)[];
  filterOptions?: {
    label: string;
    field: keyof T;
    options: { label: string; value: any }[];
  }[];
  title?: string;
  rowLink?: (row: T) => string;
}

const DataTable = React.forwardRef<HTMLDivElement, DataTableProps<any>>(
  (
    {
      data,
      columns,
      itemsPerPage = 10,
      searchable = true,
      searchFields,
      filterOptions = [],
      title,
      rowLink
    },
    ref
  ) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<Record<string, any>>({});

    const filteredData = useMemo(() => {
      let result = [...data];

      // Apply filters
      filterOptions.forEach((filterOption) => {
        if (filters[filterOption.field as string]) {
          result = result.filter((item) => item[filterOption.field] === filters[filterOption.field as string]);
        }
      });

      // Apply search
      if (searchTerm && searchFields) {
        result = result.filter((item) =>
          searchFields.some((field) =>
            String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }

      return result;
    }, [data, filters, searchTerm, searchFields, filterOptions]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    const handleFilterChange = (filterKey: string, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [filterKey]: value === 'all' ? undefined : value
      }));
      setCurrentPage(1);
    };

    return (
      <div ref={ref} className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {(title || searchable || filterOptions.length > 0) && (
          <div className="p-6 border-b border-slate-100">
            {title && <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>}
            <div className="flex flex-col sm:flex-row gap-4">
              {searchable && (
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              )}
              {filterOptions.map((filterOption) => (
                <select
                  key={String(filterOption.field)}
                  value={filters[filterOption.field as string] || 'all'}
                  onChange={(e) => handleFilterChange(String(filterOption.field), e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  <option value="all">{filterOption.label}</option>
                  {filterOption.options.map((option) => (
                    <option key={String(option.value)} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150"
                    onClick={() => {
                      if (rowLink) {
                        window.location.href = rowLink(row);
                      }
                    }}
                    style={{ cursor: rowLink ? 'pointer' : 'default' }}
                  >
                    {columns.map((column) => (
                      <td key={String(column.key)} className="px-6 py-4">
                        {column.render ? column.render(row[column.key], row) : String(row[column.key])}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <p className="text-slate-500 text-sm">No data available</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of{' '}
              {filteredData.length} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-2 text-sm font-medium text-slate-900">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';

export default DataTable;
