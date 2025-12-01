import api from './api';

export interface IFarm {
  _id: string;
  name: string;
  type: string;
  operationDate: string;
  areaSize: string;
  coordinates?: string; // Optional coordinate string
  farmBoundary?: {
    type: string;
    coordinates: number[][][];
  };
  owner: string; // Add the owner field
  createdAt: string;
  updatedAt: string;
}

export const getFarms = async (ownerId?: string): Promise<IFarm[]> => {
  try {
    // Add support for filtering by owner
    const url = ownerId ? `/farms?owner=${ownerId}` : `/farms`;
    const response = await api.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching farms:', error);
    throw error;
  }
};

export const getFarm = async (id: string): Promise<IFarm> => {
  try {
    const response = await api.get(`/farms/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching farm with id ${id}:`, error);
    throw error;
  }
};

export const createFarm = async (farmData: Omit<IFarm, '_id' | 'createdAt' | 'updatedAt'>): Promise<IFarm> => {
  try {
    // farmData now needs to include the owner field
    if (!farmData.owner) {
      throw new Error('Owner ID is required');
    }
    const response = await api.post(`/farms`, farmData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating farm:', error);
    throw error;
  }
};
export const updateFarm = async (id: string, farmData: Partial<IFarm>): Promise<IFarm> => {
  try {
    const response = await api.put(`/farms/${id}`, farmData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating farm with id ${id}:`, error);
    throw error;
  }
};