import React from 'react';

export const Table = ({ children, className = '', ...props }) => (
  <div className="w-full overflow-x-auto">
    <table className={`w-full text-left border-collapse text-sm ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '', ...props }) => (
  <thead className={`bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '', ...props }) => (
  <tbody className={`divide-y divide-slate-100 bg-white ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', isHoverable = true, ...props }) => (
  <tr
    className={`${
      isHoverable ? 'hover:bg-slate-50/80 transition-colors' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = '', ...props }) => (
  <th className={`px-4 py-3 text-left font-semibold text-slate-700 ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '', ...props }) => (
  <td className={`px-4 py-3 text-slate-700 whitespace-nowrap ${className}`} {...props}>
    {children}
  </td>
);

export const TableEmpty = ({ message = 'No records found', colSpan = 6 }) => (
  <tr>
    <td colSpan={colSpan} className="text-center py-12 text-slate-400">
      <div className="flex flex-col items-center justify-center gap-1.5">
        <p className="text-sm font-medium text-slate-600">{message}</p>
        <p className="text-xs text-slate-400">Try adjusting your filters or search terms</p>
      </div>
    </td>
  </tr>
);

export default Table;
