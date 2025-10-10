import axios from 'axios';

const API_URL = '/api';

export interface IFarm {
  _id: string;
  name: string;
  type: string;
  operationDate: string;
  areaSize: string;
  farmBoundary: {
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
    const url = ownerId ? `${API_URL}/farms?owner=${ownerId}` : `${API_URL}/farms`;
    const response = await axios.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching farms:', error);
    throw error;
  }
};

export const getFarm = async (id: string): Promise<IFarm> => {
  try {
    const response = await axios.get(`${API_URL}/farms/${id}`);
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
    const response = await axios.post(`${API_URL}/farms`, farmData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating farm:', error);
    throw error;
  }
};
export const updateFarm = async (id: string, farmData: Partial<IFarm>): Promise<IFarm> => {
  try {
    const response = await axios.put(`${API_URL}/farms/${id}`, farmData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating farm with id ${id}:`, error);
    throw error;
  }
};