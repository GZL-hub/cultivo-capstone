import { Request, Response } from 'express';
import Farm from '../model/farm';
export const getFarms = async (req: Request, res: Response) => {
  try {
    const farms = await Farm.find();
    return res.status(200).json(farms);
  } catch (error) {
    console.error('Error fetching farms:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const getFarmById = async (req: Request, res: Response) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }
    return res.status(200).json(farm);
  } catch (error) {
    console.error('Error fetching farm:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};