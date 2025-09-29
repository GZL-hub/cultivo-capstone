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
  createdAt: string;
  updatedAt: string;
}

export const getFarms = async (): Promise<IFarm[]> => {
  try {
    const response = await axios.get(`${API_URL}/farms`);
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
    const response = await axios.post(`${API_URL}/farms`, farmData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating farm:', error);
    throw error;
  }
};