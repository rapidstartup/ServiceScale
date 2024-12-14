import React from 'react';
import { Edit2, Trash2, RefreshCw } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: string[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onUndelete?: (item: T) => void;
  selectedIds?: string[];
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (id: string, checked: boolean) => void;
}

const DataTable = <T extends { id: string; deleted?: boolean }>({
  data,
  columns,
  onEdit,
  onDelete,
  onUndelete,
  selectedIds = [],
  onSelectAll,
  onSelectRow
}: DataTableProps<T>) => {
  if (!data.length) return null;

  const allSelected = data.length > 0 && data.every(row => selectedIds.includes(row.id as string));

  const formatValue = (value: string | number | boolean | null | undefined) => {
    if (typeof value === 'string' && value.includes('\n')) {
      return (
        <div className="whitespace-pre-line max-w-md">
          {value}
        </div>
      );
    }
    return value;
  };

  return (
    <div className="overflow-x-auto relative">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {onSelectRow && (
              <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column}
              </th>
            ))}
            <th className="sticky right-0 z-10 bg-gray-50 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr 
              key={index}
              className={`${row.deleted ? 'text-red-500 line-through' : ''} hover:bg-gray-50`}
            >
              {onSelectRow && (
                <td className="sticky left-0 z-10 bg-white px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id as string)}
                    onChange={(e) => onSelectRow(row.id as string, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={column} className="px-6 py-4 text-sm text-gray-900">
                  {formatValue(row[column as keyof T] as string | number | boolean | null | undefined)}
                </td>
              ))}
              <td className="sticky right-0 z-10 bg-white px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                {row.deleted ? (
                  <button
                    onClick={() => onUndelete?.(row)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <RefreshCw className="h-4 w-4 inline" />
                    <span className="ml-1">Undelete</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit?.(row)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete?.(row)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;