import { Request, Response } from 'express';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

// Get all posts
export const getPosts = async (req: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM posts ORDER BY created_at DESC';
    const posts = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
    
    res.json(posts);
  } catch (error: any) {
    // If table doesn't exist, return empty array
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.json([]);
    }
    console.error('Failed to fetch posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};




