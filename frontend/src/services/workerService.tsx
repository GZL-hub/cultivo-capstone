import axios from 'axios';

const API_URL = '/api';

export interface Worker {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  joinDate?: string;
  status?: 'active' | 'inactive';
  farmId: string;
}

export const getWorkers = async (farmId: string): Promise<Worker[]> => {
  try {
    const response = await axios.get(`${API_URL}/farms/${farmId}/workers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw error;
  }
};

export const getWorkerById = async (farmId: string, workerId: string): Promise<Worker> => {
  try {
    const response = await axios.get(`${API_URL}/farms/${farmId}/workers/${workerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching worker:', error);
    throw error;
  }
};

export const createWorker = async (farmId: string, workerData: Omit<Worker, 'id' | 'farmId'>): Promise<Worker> => {
  try {
    const response = await axios.post(`${API_URL}/farms/${farmId}/workers`, workerData);
    return response.data;
  } catch (error) {
    console.error('Error creating worker:', error);
    throw error;
  }
};

export const updateWorker = async (farmId: string, workerId: string, workerData: Partial<Worker>): Promise<Worker> => {
  try {
    const response = await axios.put(`${API_URL}/farms/${farmId}/workers/${workerId}`, workerData);
    return response.data;
  } catch (error) {
    console.error('Error updating worker:', error);
    throw error;
  }
};

export const deleteWorker = async (farmId: string, workerId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/farms/${farmId}/workers/${workerId}`);
  } catch (error) {
    console.error('Error deleting worker:', error);
    throw error;
  }
};

// Export the API methods
export default {
  getWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
};