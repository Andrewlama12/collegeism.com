import React, { ReactNode } from 'react';

interface Props { children: ReactNode[]; }

export const ChannelContainer: React.FC<Props> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 h-[calc(100vh-4rem)] overflow-y-auto">
      {children.map((child, i) => (
        <div key={i} className="bg-white rounded-lg shadow-lg p-4 min-h-[400px] overflow-y-auto">
          {child}
        </div>
      ))}
    </div>
  );
}; 