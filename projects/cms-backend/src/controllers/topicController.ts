import { Request, Response } from 'express';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

// Get all topics
export const getTopics = async (req: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM topics ORDER BY sort_order ASC, name ASC';
    const topics = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
    
    res.json(topics);
  } catch (error: any) {
    // If table doesn't exist, return empty array
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.json([]);
    }
    console.error('Failed to fetch topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};




