import React from 'react';

const Tag = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="text-xs bg-neutralMid text-gray-300 px-3 py-1 rounded-full">
      {children}
    </span>
  );
};

export default Tag;
