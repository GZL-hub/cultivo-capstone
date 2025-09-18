import React from 'react';

const FarmCCTV: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div className="h-64 bg-gray-200 rounded flex items-center justify-center">CCTV Feed 1</div>
    <div className="h-64 bg-gray-200 rounded flex items-center justify-center">CCTV Feed 2</div>
    <div className="h-64 bg-gray-200 rounded flex items-center justify-center">CCTV Feed 3</div>
  </div>
);

export default FarmCCTV;