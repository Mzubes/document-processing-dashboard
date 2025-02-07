import React from 'react';

export function Button({ onClick, children }) {
  return (
    <button onClick={onClick} className="bg-blue-500 text-white p-2 rounded">
      {children}
    </button>
  );
}
