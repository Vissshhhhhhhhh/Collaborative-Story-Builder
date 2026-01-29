import React from 'react';

const Loader = () => {
  // We'll render 8 skeleton cards to fill the "Explore" grid
  const skeletonCards = Array.from({ length: 8 });

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Category Header Skeletons */}
      <div className="h-8 bg-gray-200 rounded-md w-48 mb-6 animate-pulse"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {skeletonCards.map((_, index) => (
          <div 
            key={index} 
            className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col relative"
          >
            {/* The Shimmer Effect Overlay */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]"></div>

            {/* Top Image Placeholder (Matches your card ratio) */}
            <div className="w-full h-40 bg-gray-200"></div>

            {/* Bottom Content Placeholder */}
            <div className="p-3 space-y-3">
              {/* Title Placeholder */}
              <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
              {/* Optional Subtitle Placeholder */}
              <div className="h-3 bg-gray-100 rounded-md w-1/2"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Required CSS for the Shimmer effect */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Loader;