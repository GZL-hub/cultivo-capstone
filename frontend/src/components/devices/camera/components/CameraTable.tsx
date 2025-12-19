import React from 'react';
import { CCTV } from '../../../../services/cctvService';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import EmptyState, { Camera } from '../../../common/EmptyState';
import CameraSnapshot from './CameraSnapshot';

interface CameraTableProps {
  cameras: CCTV[];
  onEdit?: (camera: CCTV) => void;
  onDelete?: (camera: CCTV) => void;
}

const CameraTable: React.FC<CameraTableProps> = ({ cameras, onEdit, onDelete }) => {
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
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
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
              <CameraRow
                key={camera._id}
                camera={camera}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {cameras.length === 0 && (
        <EmptyState
          icon={Camera}
          title="No Cameras Found"
          description="No cameras found matching your filter criteria"
        />
      )}
    </div>
  );
};

interface CameraRowProps {
  camera: CCTV;
  onEdit?: (camera: CCTV) => void;
  onDelete?: (camera: CCTV) => void;
}

const CameraRow: React.FC<CameraRowProps> = ({ camera, onEdit, onDelete }) => {

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openStream = () => {
    // Open the camera stream URL directly
    if (camera.streamUrl) {
      window.open(camera.streamUrl, '_blank');
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <CameraSnapshot
            streamUrl={camera.streamUrl}
            cameraName={camera.name}
            className="h-16 w-28 flex-shrink-0 rounded border border-gray-200"
            onClick={camera.streamUrl ? openStream : undefined}
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{camera.name}</div>
            <div className="text-xs text-gray-500">{camera._id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {camera.type}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(camera.status)}`}>
          {camera.status}
        </span>
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
          className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!camera.streamUrl}
          title={camera.streamUrl ? `Open ${camera.streamUrl}` : 'No stream URL available'}
        >
          <ExternalLink size={16} className="mr-1" />
          View
        </button>
        <button
          onClick={() => onEdit?.(camera)}
          className="text-green-600 hover:text-green-900 mr-3 inline-flex items-center"
        >
          <Pencil size={16} className="mr-1" />
          Edit
        </button>
        <button
          onClick={() => onDelete?.(camera)}
          className="text-red-600 hover:text-red-900 inline-flex items-center"
        >
          <Trash2 size={16} className="mr-1" />
          Remove
        </button>
      </td>
    </tr>
  );
};

export default CameraTable;