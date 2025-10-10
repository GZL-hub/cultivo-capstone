export interface Camera {
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
export const sampleCameras: Camera[] = [
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