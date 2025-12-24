import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Helper function to log activity (can be used in controllers)
export const logActivity = async (
  req: Request,
  action: string,
  entityType: string,
  entityId?: string,
  entityName?: string,
  description?: string,
  metadata?: Record<string, unknown>
) => {
  try {
    const userId = (req as any).user?.id || null;
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : null)
      || (typeof req.headers['x-real-ip'] === 'string' ? req.headers['x-real-ip'] : null)
      || (typeof req.socket.remoteAddress === 'string' ? req.socket.remoteAddress : null)
      || null;
    const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : null;

    const id = uuidv4();

    const query = `
      INSERT INTO activity_logs (
        id, user_id, action, entity_type, entity_id, entity_name,
        description, metadata, ip_address, user_agent
      )
      VALUES (
        :id, :user_id, :action, :entity_type, :entity_id, :entity_name,
        :description, :metadata, :ip_address, :user_agent
      )
    `;

    await sequelize.query(query, {
      replacements: {
        id,
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        entity_name: entityName || null,
        description: description || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ip_address: ipAddress,
        user_agent: userAgent
      },
      type: QueryTypes.INSERT
    });
  } catch (error) {
    // Don't throw error - activity logging should not break the main flow
    console.error('Failed to create activity log:', error);
  }
};

// Get activity logs with filters
export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      action,
      entity_type,
      entity_id,
      limit = '50',
      offset = '0'
    } = req.query;

    let query = `SELECT * FROM activity_logs WHERE 1=1`;
    const replacements: any = {};

    if (user_id) {
      query += ` AND user_id = :user_id`;
      replacements.user_id = user_id;
    }
    if (action) {
      query += ` AND action = :action`;
      replacements.action = action;
    }
    if (entity_type) {
      query += ` AND entity_type = :entity_type`;
      replacements.entity_type = entity_type;
    }
    if (entity_id) {
      query += ` AND entity_id = :entity_id`;
      replacements.entity_id = entity_id;
    }

    query += ` ORDER BY created_at DESC LIMIT :limit OFFSET :offset`;

    replacements.limit = parseInt(limit as string);
    replacements.offset = parseInt(offset as string);

    const logs: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM activity_logs WHERE 1=1`;
    const countReplacements: any = {};
    if (user_id) {
      countQuery += ` AND user_id = :user_id`;
      countReplacements.user_id = user_id;
    }
    if (action) {
      countQuery += ` AND action = :action`;
      countReplacements.action = action;
    }
    if (entity_type) {
      countQuery += ` AND entity_type = :entity_type`;
      countReplacements.entity_type = entity_type;
    }
    if (entity_id) {
      countQuery += ` AND entity_id = :entity_id`;
      countReplacements.entity_id = entity_id;
    }

    const countResult: any = await sequelize.query(countQuery, {
      replacements: countReplacements,
      type: QueryTypes.SELECT
    });

    res.json({
      data: logs,
      pagination: {
        total: parseInt(countResult[0].total),
        limit: replacements.limit,
        offset: replacements.offset
      }
    });
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.json({ data: [], pagination: { total: 0, limit: 50, offset: 0 } });
    }
    console.error('Failed to fetch activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
};

// Create activity log
export const createActivityLog = async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      action,
      entity_type,
      entity_id,
      entity_name,
      description,
      metadata,
      ip_address,
      user_agent
    } = req.body;

    if (!action || !entity_type) {
      return res.status(400).json({ error: 'action and entity_type are required' });
    }

    const id = uuidv4();

    const query = `
      INSERT INTO activity_logs (
        id, user_id, action, entity_type, entity_id, entity_name,
        description, metadata, ip_address, user_agent
      )
      VALUES (
        :id, :user_id, :action, :entity_type, :entity_id, :entity_name,
        :description, :metadata, :ip_address, :user_agent
      )
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        user_id: user_id || null,
        action,
        entity_type,
        entity_id: entity_id || null,
        entity_name: entity_name || null,
        description: description || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ip_address: ip_address || null,
        user_agent: user_agent || null
      },
      type: QueryTypes.INSERT
    });

    res.status(201).json(result[0][0]);
  } catch (error) {
    console.error('Failed to create activity log:', error);
    res.status(500).json({ error: 'Failed to create activity log' });
  }
};

// Get activity log by ID
export const getActivityLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `SELECT * FROM activity_logs WHERE id = :id`;
    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Activity log not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Failed to fetch activity log:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
};



