import React from 'react';

export const BookSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col p-4 space-y-4 animate-pulse">
      <div className="w-full h-48 bg-slate-100 rounded-xl"></div>
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-100 rounded w-1/3"></div>
        <div className="h-4.5 bg-slate-150 rounded w-4/5"></div>
        <div className="h-3 bg-slate-100 rounded w-2/3"></div>
      </div>
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="h-3 bg-slate-100 rounded w-1/4"></div>
        <div className="h-8 bg-slate-100 rounded-xl w-1/3"></div>
      </div>
    </div>
  );
};

export const BookSkeletonGrid: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <BookSkeleton key={i} />
      ))}
    </div>
  );
};
