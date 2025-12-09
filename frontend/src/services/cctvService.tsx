import api from './api';

export interface CCTV {
  _id?: string;
  name: string;
  status: 'online' | 'offline';
  type: string;
  streamUrl: string;
  farmId: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getCCTVs = async (farmId: string): Promise<CCTV[]> => {
  try {
    const response = await api.get(`/farms/${farmId}/cctvs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching CCTV devices:', error);
    throw error;
  }
};

export const getCCTVById = async (farmId: string, cctvId: string): Promise<CCTV> => {
  try {
    const response = await api.get(`/farms/${farmId}/cctvs/${cctvId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching CCTV device:', error);
    throw error;
  }
};

export const createCCTV = async (farmId: string, cctvData: Omit<CCTV, '_id' | 'farmId' | 'createdAt' | 'updatedAt'>): Promise<CCTV> => {
  try {
    const response = await api.post(`/farms/${farmId}/cctvs`, cctvData);
    return response.data;
  } catch (error) {
    console.error('Error creating CCTV device:', error);
    throw error;
  }
};

export const updateCCTV = async (farmId: string, cctvId: string, cctvData: Partial<CCTV>): Promise<CCTV> => {
  try {
    const response = await api.put(`/farms/${farmId}/cctvs/${cctvId}`, cctvData);
    return response.data;
  } catch (error) {
    console.error('Error updating CCTV device:', error);
    throw error;
  }
};

export const deleteCCTV = async (farmId: string, cctvId: string): Promise<void> => {
  try {
    await api.delete(`/farms/${farmId}/cctvs/${cctvId}`);
  } catch (error) {
    console.error('Error deleting CCTV device:', error);
    throw error;
  }
};

// Check if a camera stream is accessible
export const checkCameraStatus = async (streamUrl: string): Promise<'online' | 'offline'> => {
  try {
    // Try to make an OPTIONS request to check if the endpoint is reachable
    // This works better for WHEP endpoints which expect OPTIONS for CORS preflight
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(streamUrl, {
      method: 'OPTIONS',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If we get a response (even if it's an error), the server is reachable
    // For WHEP endpoints, we're just checking if the server responds
    if (response.status >= 200 && response.status < 500) {
      return 'online';
    }

    return 'offline';
  } catch (error: any) {
    // Check if it's a timeout
    if (error.name === 'AbortError') {
      console.log(`Camera stream ${streamUrl} timed out`);
      return 'offline';
    }

    // For CORS errors or network errors, try a fallback check
    // Some servers might block OPTIONS, so we try GET with no-cors
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 5000);

      await fetch(streamUrl, {
        method: 'GET',
        signal: controller2.signal,
        mode: 'no-cors',
      });

      clearTimeout(timeoutId2);
      // If no-cors fetch succeeds, assume online
      return 'online';
    } catch (fallbackError) {
      console.log(`Camera stream ${streamUrl} is offline:`, error);
      return 'offline';
    }
  }
};

// Check status of all cameras and update them
export const checkAndUpdateCameraStatuses = async (farmId: string, cameras: CCTV[]): Promise<CCTV[]> => {
  const updatedCameras = await Promise.all(
    cameras.map(async (camera) => {
      const status = await checkCameraStatus(camera.streamUrl);

      // Update the camera status in the backend if it changed
      if (status !== camera.status && camera._id) {
        try {
          await updateCCTV(farmId, camera._id, { status });
        } catch (error) {
          console.error(`Failed to update status for camera ${camera._id}:`, error);
        }
      }

      return { ...camera, status };
    })
  );

  return updatedCameras;
};

// Export the API methods
export default {
  getCCTVs,
  getCCTVById,
  createCCTV,
  updateCCTV,
  deleteCCTV,
  checkCameraStatus,
  checkAndUpdateCameraStatuses,
};
