"use client";

import { ReactNode } from 'react';
import { RefreshCw, ChevronUp, ChevronDown, AlertCircle, Inbox } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => ReactNode;
}

export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  sort?: SortState;
  onSort?: (sort: SortState) => void;
  actions?: (item: T) => ReactNode;
  onRowClick?: (item: T) => void;
  selectedKey?: string | number;
  expandedRowRender?: (item: T) => ReactNode;
}

export default function DataTable<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon,
  sort,
  onSort,
  actions,
  onRowClick,
  selectedKey,
  expandedRowRender,
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;

    const newDirection: 'asc' | 'desc' =
      sort?.key === key && sort?.direction === 'asc' ? 'desc' : 'asc';

    onSort({ key, direction: newDirection });
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  style={{ width: column.width }}
                  className={`
                    px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider
                    ${column.align === 'center' ? 'text-center' : ''}
                    ${column.align === 'right' ? 'text-right' : 'text-left'}
                    ${column.sortable && onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className={`inline-flex items-center gap-1 ${column.align === 'right' ? 'flex-row-reverse' : ''}`}>
                    <span>{column.label}</span>
                    {column.sortable && onSort && sort?.key === column.key && (
                      sort.direction === 'asc' ? (
                        <ChevronUp className="w-4 h-4 text-green-900" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-green-900" />
                      )
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th
                  scope="col"
                  className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right"
                  style={{ width: '120px' }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <RefreshCw className="w-8 h-8 animate-spin text-green-900" />
                    <span className="mt-2 text-sm">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    {emptyIcon || <Inbox className="w-12 h-12 text-gray-300" />}
                    <span className="mt-2 text-sm">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const key = keyExtractor(item);
                const isSelected = selectedKey === key;

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(item)}
                    className={`
                      ${onRowClick ? 'cursor-pointer' : ''}
                      ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}
                      transition
                    `}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`
                          px-4 py-3 text-sm text-gray-900
                          ${column.align === 'center' ? 'text-center' : ''}
                          ${column.align === 'right' ? 'text-right' : ''}
                        `}
                      >
                        {column.render
                          ? column.render(item, index)
                          : getNestedValue(item, column.key) ?? '-'}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          {actions(item)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Previous
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`
                  px-3 py-1 text-sm font-medium rounded-lg transition
                  ${currentPage === pageNum
                    ? 'bg-green-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Action button components
interface ActionButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

export function ActionButton({
  onClick,
  icon,
  label,
  variant = 'default',
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={`
        p-1.5 rounded-lg transition disabled:opacity-50
        ${variant === 'danger'
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-600 hover:bg-gray-100'
        }
      `}
      title={label}
    >
      {icon}
    </button>
  );
}

// Badge component for status/type display
interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
