// News Category controller
// Handles CRUD operations for news categories

import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { logActivity } from './activityLogController';

// Helper function to generate slug if not provided
function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get all news categories
export const getNewsCategories = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 100, q } = req.query;
    
    const offset = ((page as any) - 1) * (pageSize as any);
    const limit = pageSize as any;

    const whereConditions: string[] = [];
    const replacements: any = { limit, offset };

    if (q) {
      whereConditions.push(`(
        name ILIKE :search OR 
        slug ILIKE :search OR
        description ILIKE :search
      )`);
      replacements.search = `%${q}%`;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM news_categories
      ${whereClause}
    `;
    const countResult: any = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT
    });
    const total = parseInt(countResult[0].total);

    // Get categories
    // Try to include news_count, but handle case where news table doesn't exist
    let query = `
      SELECT 
        nc.*
    `;
    
    // Try to add news_count subquery, but handle gracefully if news table doesn't exist
    try {
      // Test if news table exists by doing a simple query
      await sequelize.query('SELECT 1 FROM news LIMIT 1', { type: QueryTypes.SELECT });
      // If we get here, news table exists
      query = `
        SELECT 
          nc.*,
          (SELECT COUNT(*) FROM news WHERE category_id = nc.id) as news_count
      `;
    } catch (e: any) {
      // News table doesn't exist, don't include news_count in query
      query = `
        SELECT 
          nc.*,
          0 as news_count
      `;
    }
    
    query += `
      FROM news_categories nc
      ${whereClause}
      ORDER BY nc.display_order ASC, nc.name ASC
      LIMIT :limit OFFSET :offset
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json({
      data: result,
      total,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
      totalPages: Math.ceil(total / (pageSize as any))
    });
  } catch (error: any) {
    console.error('[getNewsCategories] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch news categories',
      message: error.message 
    });
  }
};

// Get news category by ID
export const getNewsCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const query = `
      SELECT 
        nc.*,
        (SELECT COUNT(*) FROM news WHERE category_id = nc.id) as news_count
      FROM news_categories nc
      WHERE nc.id = :id
    `;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'News category not found' });
    }

    res.json(result[0]);
  } catch (error: any) {
    console.error('[getNewsCategoryById] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch news category',
      message: error.message 
    });
  }
};

// Create new news category
export const createNewsCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, display_order, is_active } = req.body;
    const userId = (req as any).user?.id;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const finalSlug = slug || generateSlugFromName(name);

    // Check if slug already exists
    const slugCheck: any = await sequelize.query(
      `SELECT id FROM news_categories WHERE slug = :slug`,
      {
        replacements: { slug: finalSlug },
        type: QueryTypes.SELECT
      }
    );

    if (slugCheck.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const query = `
      INSERT INTO news_categories 
        (id, name, slug, description, display_order, is_active, created_at, updated_at, created_by)
      VALUES 
        (gen_random_uuid(), :name, :slug, :description, :display_order, :is_active, NOW(), NOW(), :created_by)
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        name,
        slug: finalSlug,
        description: description || null,
        display_order: display_order || 0,
        is_active: is_active !== false,
        created_by: userId || null
      },
      type: QueryTypes.INSERT
    });

    const categoryId = result[0]?.[0]?.id || result[0]?.id;

    // Log activity
    await logActivity(req, 'create', 'news_category', categoryId, name, `Created news category: ${name}`);

    res.status(201).json(result[0]?.[0] || result[0]);
  } catch (error: any) {
    console.error('[createNewsCategory] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to create news category',
      message: error.message 
    });
  }
};

// Update news category
export const updateNewsCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, display_order, is_active } = req.body;
    const userId = (req as any).user?.id;

    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    // Check if category exists
    const existing: any = await sequelize.query(
      `SELECT id, name FROM news_categories WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'News category not found' });
    }

    // If slug is being changed, check if new slug exists
    if (slug && slug !== existing[0].slug) {
      const slugCheck: any = await sequelize.query(
        `SELECT id FROM news_categories WHERE slug = :slug AND id != :id`,
        {
          replacements: { slug, id },
          type: QueryTypes.SELECT
        }
      );

      if (slugCheck.length > 0) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
    }

    const updateFields: string[] = [];
    const replacements: any = { id };

    if (name !== undefined) {
      updateFields.push('name = :name');
      replacements.name = name;
    }
    if (slug !== undefined) {
      updateFields.push('slug = :slug');
      replacements.slug = slug;
    }
    if (description !== undefined) {
      updateFields.push('description = :description');
      replacements.description = description;
    }
    if (display_order !== undefined) {
      updateFields.push('display_order = :display_order');
      replacements.display_order = display_order;
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = :is_active');
      replacements.is_active = is_active;
    }

    updateFields.push('updated_at = NOW()');

    const query = `
      UPDATE news_categories
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    // Log activity
    await logActivity(req, 'update', 'news_category', id, name || existing[0].name, `Updated news category: ${name || existing[0].name}`);

    res.json(result[0]?.[0] || result[0]);
  } catch (error: any) {
    console.error('[updateNewsCategory] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to update news category',
      message: error.message 
    });
  }
};

// Delete news category
export const deleteNewsCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    // Check if category exists and get name for logging
    const existing: any = await sequelize.query(
      `SELECT id, name FROM news_categories WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'News category not found' });
    }

    // Check if category has news
    const newsCount: any = await sequelize.query(
      `SELECT COUNT(*) as count FROM news WHERE category_id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (parseInt(newsCount[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with associated news. Please remove or reassign news first.' 
      });
    }

    const query = `
      DELETE FROM news_categories
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.DELETE
    });

    // Log activity
    await logActivity(req, 'delete', 'news_category', id, existing[0].name, `Deleted news category: ${existing[0].name}`);

    res.json({ 
      success: true,
      message: 'News category deleted successfully',
      data: result[0]?.[0] || result[0]
    });
  } catch (error: any) {
    console.error('[deleteNewsCategory] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to delete news category',
      message: error.message 
    });
  }
};

