import { PolygonCoordinate } from "./PolygonDataPanel";
// Calculate the area of a polygon using the Shoelace formula (Gauss's area formula)
export const calculatePolygonArea = (coordinates: PolygonCoordinate[]): number => {
  if (coordinates.length < 3) return 0;
  
  let area = 0;
  const R = 6371000; // Earth radius in meters
  
  for (let i = 0; i < coordinates.length; i++) {
    const j = (i + 1) % coordinates.length;
    
    const xi = coordinates[i].lng * Math.PI / 180;
    const yi = coordinates[i].lat * Math.PI / 180;
    
    const xj = coordinates[j].lng * Math.PI / 180;
    const yj = coordinates[j].lat * Math.PI / 180;
    
    area += (xj - xi) * (2 + Math.sin(yi) + Math.sin(yj));
  }
  
  area = area * R * R / 2;
  return Math.abs(area);
};

// Calculate the perimeter of a polygon
export const calculatePolygonPerimeter = (coordinates: PolygonCoordinate[]): number => {
  if (coordinates.length < 2) return 0;
  
  let perimeter = 0;
  const R = 6371000; // Earth radius in meters
  
  for (let i = 0; i < coordinates.length; i++) {
    const j = (i + 1) % coordinates.length;
    
    const lat1 = coordinates[i].lat * Math.PI / 180;
    const lon1 = coordinates[i].lng * Math.PI / 180;
    
    const lat2 = coordinates[j].lat * Math.PI / 180;
    const lon2 = coordinates[j].lng * Math.PI / 180;
    
    // Haversine formula
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    perimeter += R * c;
  }
  
  return perimeter;
};