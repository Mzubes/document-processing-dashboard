import React from 'react';

export function Table({ children, className }) {
  return (
    <table className={`min-w-full ${className}`}>
      {children}
    </table>
  );
}

export function TableHeader({ children }) {
  return (
    <thead className="bg-gray-200">
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return (
    <tbody className="bg-white">
      {children}
    </tbody>
  );
}

export function TableRow({ children }) {
  return (
    <tr className="border-b">
      {children}
    </tr>
  );
}

export function TableCell({ children }) {
  return (
    <td className="p-4">
      {children}
    </td>
  );
}
