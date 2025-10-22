import React from 'react';

const TroubleshootingTips: React.FC = () => {
  return (
    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md text-xs">
      <p className="font-semibold text-red-800">Troubleshooting WebRTC Issues:</p>
      <ul className="list-disc pl-5 mt-2 text-red-700 space-y-1">
        <li>Make sure your GCP VM has ports 8889/UDP and TCP open</li>
        <li>Check if the server supports WHEP protocol correctly</li>
        <li>Network latency might be causing the "write queue is full" errors</li>
        <li>Try using a different STUN/TURN server</li>
      </ul>
    </div>
  );
};

export default TroubleshootingTips;