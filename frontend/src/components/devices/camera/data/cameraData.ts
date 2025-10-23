export interface Camera {
  id: string;
  name: string;
  type: string;
  location: string;
  resolution: string;
  status: 'online' | 'offline' | 'error';
  lastUpdated: string;
  thumbnail: string;
  streamUrl: string; // Add this property to the interface
}

export const sampleCameras: Camera[] = [
  {
    id: 'cam-001',
    name: 'Front Gate Camera',
    type: 'Security Camera',
    location: 'Main Entrance',
    resolution: '1080p',
    status: 'online',
    lastUpdated: '2025-10-23T08:30:00Z',
    thumbnail: '/images/camera-1.jpg',
    streamUrl: 'http://136.110.0.27:8889/livefeed/whep', // Add sample URL to existing cameras
  },
  {
    id: 'cam-002',
    name: 'Greenhouse Camera',
    type: 'Monitoring Camera',
    location: 'Greenhouse A',
    resolution: '720p',
    status: 'online',
    lastUpdated: '2025-10-23T08:35:00Z',
    thumbnail: '/images/camera-2.jpg',
    streamUrl: 'http://136.110.0.27:8889/greenhouse/whep',
  },
  {
    id: 'cam-003',
    name: 'Storage Area Camera',
    type: 'Security Camera',
    location: 'Storage Facility',
    resolution: '1080p',
    status: 'offline',
    lastUpdated: '2025-10-22T15:45:00Z',
    thumbnail: '/images/camera-3.jpg',
    streamUrl: 'http://136.110.0.27:8889/storage/whep',
  },
  {
    id: 'cam-004',
    name: 'Field Time-lapse',
    type: 'Time-Lapse Camera',
    location: 'North Field',
    resolution: '4K',
    status: 'error',
    lastUpdated: '2025-10-23T07:20:00Z',
    thumbnail: '/images/camera-4.jpg',
    streamUrl: 'http://136.110.0.27:8889/field/whep',
  }
];