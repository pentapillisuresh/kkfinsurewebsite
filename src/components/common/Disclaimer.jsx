import React from 'react';

const Disclaimer = () => {
  return (
    <div className="w-full border-t border-gray-200 bg-white px-3 py-2">
      <p className="text-center text-[9px] sm:text-[10px] leading-4 text-gray-400">
        <span className="font-semibold text-gray-500">
          Disclaimer:
        </span>{' '}
        Investment in securities is subject to market risk. Read all related
        documents carefully before investing.
      </p>
    </div>
  );
};

export default Disclaimer;