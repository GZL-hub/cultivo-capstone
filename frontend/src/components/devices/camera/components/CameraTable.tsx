import React from 'react';
import { Camera } from '../data/cameraData';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';

interface CameraTableProps {
  cameras: Camera[];
}

const CameraTable: React.FC<CameraTableProps> = ({ cameras }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Camera
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resolution
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stream URL
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cameras.map((camera) => (
              <CameraRow key={camera.id} camera={camera} />
            ))}
          </tbody>
        </table>
      </div>
      
      {cameras.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No cameras found matching your filter criteria
        </div>
      )}
    </div>
  );
};

interface CameraRowProps {
  camera: Camera;
}

const CameraRow: React.FC<CameraRowProps> = ({ camera }) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openStream = () => {
    // Open the camera stream in a new window/tab
    if (camera.streamUrl) {
      window.open(`/camera-view?id=${camera.id}&url=${encodeURIComponent(camera.streamUrl)}`, '_blank');
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
            {camera.thumbnail ? (
              <img src={camera.thumbnail} alt="" className="h-10 w-10 object-cover" />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{camera.name}</div>
            <div className="text-xs text-gray-500">{camera.type}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(camera.status)}`}>
          {camera.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {camera.resolution}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {camera.location}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {camera.streamUrl ? (
          <div className="max-w-[200px] truncate">
            {camera.streamUrl}
          </div>
        ) : (
          <span className="text-gray-400">Not available</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button 
          onClick={openStream}
          className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center"
          disabled={!camera.streamUrl}
        >
          <ExternalLink size={16} className="mr-1" />
          View
        </button>
        <button className="text-green-600 hover:text-green-900 mr-3 inline-flex items-center">
          <Pencil size={16} className="mr-1" />
          Edit
        </button>
        <button className="text-red-600 hover:text-red-900 inline-flex items-center">
          <Trash2 size={16} className="mr-1" />
          Remove
        </button>
      </td>
    </tr>
  );
};

export default CameraTable;