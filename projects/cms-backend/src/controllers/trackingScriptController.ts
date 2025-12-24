import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Get all tracking scripts
export const getTrackingScripts = async (req: Request, res: Response) => {
  try {
    const { is_active, position, type } = req.query;

    let query = `SELECT * FROM tracking_scripts WHERE 1=1`;
    const replacements: any = {};

    if (is_active !== undefined) {
      query += ` AND is_active = :is_active`;
      replacements.is_active = is_active === 'true';
    }
    if (position) {
      query += ` AND position = :position`;
      replacements.position = position;
    }
    if (type) {
      query += ` AND type = :type`;
      replacements.type = type;
    }

    query += ` ORDER BY priority ASC, created_at ASC`;

    const scripts: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json({ data: scripts });
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.json({ data: [] });
    }
    console.error('Failed to fetch tracking scripts:', error);
    res.status(500).json({ error: 'Failed to fetch tracking scripts' });
  }
};

// Get active tracking scripts for a specific page
export const getActiveTrackingScripts = async (req: Request, res: Response) => {
  try {
    const { page } = req.query;
    const position = req.query.position || 'head'; // 'head' or 'body'

    let query = `
      SELECT * FROM tracking_scripts
      WHERE is_active = true AND position = :position
    `;
    const replacements: any = { position };

    if (page && page !== 'all') {
      query += ` AND (pages @> :page OR pages @> '["all"]')`;
      replacements.page = JSON.stringify([page]);
    } else {
      query += ` AND pages @> '["all"]'`;
    }

    query += ` ORDER BY priority ASC`;

    const scripts: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json({ data: scripts });
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.json({ data: [] });
    }
    console.error('Failed to fetch active tracking scripts:', error);
    res.status(500).json({ error: 'Failed to fetch active tracking scripts' });
  }
};

// Create tracking script
export const createTrackingScript = async (req: Request, res: Response) => {
  try {
    const {
      name,
      type,
      provider,
      position,
      script_code,
      is_active,
      load_strategy,
      pages,
      priority,
      description
    } = req.body;

    if (!name || !script_code) {
      return res.status(400).json({ error: 'name and script_code are required' });
    }

    const id = uuidv4();

    const query = `
      INSERT INTO tracking_scripts (
        id, name, type, provider, position, script_code, is_active,
        load_strategy, pages, priority, description
      )
      VALUES (
        :id, :name, :type, :provider, :position, :script_code, :is_active,
        :load_strategy, :pages, :priority, :description
      )
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        name,
        type: type || 'custom',
        provider: provider || null,
        position: position || 'head',
        script_code,
        is_active: is_active !== undefined ? is_active : true,
        load_strategy: load_strategy || 'sync',
        pages: pages ? JSON.stringify(pages) : JSON.stringify(['all']),
        priority: priority !== undefined ? priority : 0,
        description: description || null
      },
      type: QueryTypes.INSERT
    });

    res.status(201).json(result[0][0]);
  } catch (error) {
    console.error('Failed to create tracking script:', error);
    res.status(500).json({ error: 'Failed to create tracking script' });
  }
};

// Update tracking script
export const updateTrackingScript = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      provider,
      position,
      script_code,
      is_active,
      load_strategy,
      pages,
      priority,
      description
    } = req.body;

    const updateFields: string[] = [];
    const replacements: any = { id };

    if (name !== undefined) {
      updateFields.push('name = :name');
      replacements.name = name;
    }
    if (type !== undefined) {
      updateFields.push('type = :type');
      replacements.type = type;
    }
    if (provider !== undefined) {
      updateFields.push('provider = :provider');
      replacements.provider = provider;
    }
    if (position !== undefined) {
      updateFields.push('position = :position');
      replacements.position = position;
    }
    if (script_code !== undefined) {
      updateFields.push('script_code = :script_code');
      replacements.script_code = script_code;
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = :is_active');
      replacements.is_active = is_active;
    }
    if (load_strategy !== undefined) {
      updateFields.push('load_strategy = :load_strategy');
      replacements.load_strategy = load_strategy;
    }
    if (pages !== undefined) {
      updateFields.push('pages = :pages');
      replacements.pages = JSON.stringify(pages);
    }
    if (priority !== undefined) {
      updateFields.push('priority = :priority');
      replacements.priority = priority;
    }
    if (description !== undefined) {
      updateFields.push('description = :description');
      replacements.description = description;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    if (updateFields.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE tracking_scripts
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Tracking script not found' });
    }

    res.json(result[0][0]);
  } catch (error) {
    console.error('Failed to update tracking script:', error);
    res.status(500).json({ error: 'Failed to update tracking script' });
  }
};

// Delete tracking script
export const deleteTrackingScript = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result: any = await sequelize.query(
      'DELETE FROM tracking_scripts WHERE id = :id RETURNING *',
      {
        replacements: { id },
        type: QueryTypes.DELETE
      }
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Tracking script not found' });
    }

    res.json({ message: 'Tracking script deleted successfully' });
  } catch (error) {
    console.error('Failed to delete tracking script:', error);
    res.status(500).json({ error: 'Failed to delete tracking script' });
  }
};






