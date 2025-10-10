import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Camera {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'maintenance';
  resolution: string;
  location: string;
  storage: string;
  lastSnapshot?: string;
}

// Sample data - in a real app, you would fetch this from an API
const sampleCameras: Camera[] = [
  {
    id: 'c1',
    name: 'North Gate CCTV',
    type: 'Security Camera',
    status: 'online',
    resolution: '1080p',
    location: 'North Farm Entrance',
    storage: 'Cloud (14 days retention)',
    lastSnapshot: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZmFybSUyMGdhdGV8ZW58MHx8MHx8&w=200&q=80'
  },
  {
    id: 'c2',
    name: 'Orchard Time-Lapse',
    type: 'Time-Lapse Camera',
    status: 'online',
    resolution: '4K',
    location: 'Main Orchard',
    storage: 'Local (500GB)',
    lastSnapshot: 'https://images.unsplash.com/photo-1473158912295-779ef17fc94b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8b3JjaGFyZHxlbnwwfHwwfHw%3D&w=200&q=80'
  },
  {
    id: 'c3',
    name: 'Greenhouse Camera',
    type: 'Monitoring Camera',
    status: 'offline',
    resolution: '720p',
    location: 'Greenhouse',
    storage: 'Local (128GB)',
  },
  {
    id: 'c4',
    name: 'Equipment Shed',
    type: 'Security Camera',
    status: 'maintenance',
    resolution: '1080p',
    location: 'Tool Shed',
    storage: 'Cloud (30 days retention)',
  }
];

const CameraDevices: React.FC = () => {
  const [cameras] = useState<Camera[]>(sampleCameras);
  const [filter, setFilter] = useState<string>('all');

  const filteredCameras = filter === 'all' 
    ? cameras 
    : cameras.filter(camera => camera.status === filter);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-700">Camera Management</h1>
          <p className="text-gray-600 mt-1">Configure and monitor your security and monitoring cameras</p>
        </div>
        <Link to="/device-settings" className="text-green-600 hover:text-green-800">
          ← Back to Devices
        </Link>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex space-x-2 mb-3 md:mb-0">
          <button 
            className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm ${filter === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}
            onClick={() => setFilter('online')}
          >
            Online
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm ${filter === 'offline' ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}
            onClick={() => setFilter('offline')}
          >
            Offline
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm ${filter === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}
            onClick={() => setFilter('maintenance')}
          >
            Maintenance
          </button>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          Add New Camera
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCameras.map((camera) => (
          <div key={camera.id} className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
            <div className="relative h-40 bg-gray-200">
              {camera.lastSnapshot ? (
                <img 
                  src={camera.lastSnapshot} 
                  alt={camera.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="ml-2">No preview available</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(camera.status)}`}>
                  {camera.status}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{camera.name}</h3>
                  <p className="text-sm text-gray-500">{camera.type}</p>
                </div>
                <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {camera.resolution}
                </div>
              </div>
              
              <div className="mt-3 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Location:</span>
                  <span className="text-gray-900">{camera.location}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Storage:</span>
                  <span className="text-gray-900">{camera.storage}</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <button className="text-green-600 hover:text-green-800 text-sm">
                  Live View
                </button>
                <div>
                  <button className="text-green-600 hover:text-green-800 text-sm mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCameras.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No cameras found matching your filter criteria
        </div>
      )}
    </div>
  );
};

export default CameraDevices;