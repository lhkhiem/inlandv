// Page controller
// Handles CRUD operations for pages

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

// Get all pages
export const getPages = async (req: Request, res: Response) => {
  try {
    const { 
      page_type,
      published,
      q 
    } = req.query;
    
    const whereConditions: string[] = [];
    const replacements: any = {};

    if (page_type) {
      whereConditions.push(`p.page_type = :page_type`);
      replacements.page_type = page_type;
    }

    if (published !== undefined) {
      whereConditions.push(`p.published = :published`);
      replacements.published = published === 'true';
    }

    if (q) {
      whereConditions.push(`(
        p.title ILIKE :search OR 
        p.slug ILIKE :search
      )`);
      replacements.search = `%${q}%`;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT 
        p.*,
        u.name as created_by_name
      FROM pages p
      LEFT JOIN users u ON p.created_by = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json({ data: result });
  } catch (error: any) {
    console.error('[getPages] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};

// Get page by slug
export const getPageBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const query = `
      SELECT 
        p.*,
        u.name as created_by_name
      FROM pages p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.slug = :slug
    `;

    const result: any = await sequelize.query(query, {
      replacements: { slug },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(result[0]);
  } catch (error: any) {
    console.error('[getPageBySlug] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
};

// Get page by ID
export const getPageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        p.*,
        u.name as created_by_name
      FROM pages p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = :id
    `;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(result[0]);
  } catch (error: any) {
    console.error('[getPageById] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
};

// Create page
export const createPage = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      slug, 
      page_type,
      published,
      meta_title,
      meta_description
    } = req.body;
    const userId = (req as any).user?.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const finalSlug = slug || generateSlugFromName(title);

    // Check if slug already exists
    const slugCheck: any = await sequelize.query(
      `SELECT id FROM pages WHERE slug = :slug`,
      {
        replacements: { slug: finalSlug },
        type: QueryTypes.SELECT
      }
    );

    if (slugCheck.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const query = `
      INSERT INTO pages 
        (id, title, slug, page_type, published, meta_title, meta_description, created_at, updated_at, created_by)
      VALUES 
        (gen_random_uuid(), :title, :slug, :page_type, :published, :meta_title, :meta_description, NOW(), NOW(), :created_by)
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        title,
        slug: finalSlug,
        page_type: page_type || 'static',
        published: published !== undefined ? published : true,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
        created_by: userId || null
      },
      type: QueryTypes.INSERT
    });

    const pageId = result[0]?.[0]?.id || result[0]?.id;

    // Log activity
    await logActivity(req, 'create', 'page', pageId, title, `Created page: ${title}`);

    res.status(201).json(result[0]?.[0] || result[0]);
  } catch (error: any) {
    console.error('[createPage] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to create page',
      message: error.message 
    });
  }
};

// Update page
export const updatePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      slug,
      page_type,
      published,
      meta_title,
      meta_description
    } = req.body;

    // Check if page exists
    const pageCheck: any = await sequelize.query(
      `SELECT id FROM pages WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (pageCheck.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Check slug uniqueness if slug is being updated
    if (slug) {
      const slugCheck: any = await sequelize.query(
        `SELECT id FROM pages WHERE slug = :slug AND id != :id`,
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

    if (title !== undefined) {
      updateFields.push('title = :title');
      replacements.title = title;
    }
    if (slug !== undefined) {
      updateFields.push('slug = :slug');
      replacements.slug = slug;
    }
    if (page_type !== undefined) {
      updateFields.push('page_type = :page_type');
      replacements.page_type = page_type;
    }
    if (published !== undefined) {
      updateFields.push('published = :published');
      replacements.published = published;
    }
    if (meta_title !== undefined) {
      updateFields.push('meta_title = :meta_title');
      replacements.meta_title = meta_title || null;
    }
    if (meta_description !== undefined) {
      updateFields.push('meta_description = :meta_description');
      replacements.meta_description = meta_description || null;
    }

    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE pages 
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    const page = result[0]?.[0] || result[0];

    // Log activity
    await logActivity(req, 'update', 'page', id, page.title, `Updated page: ${page.title}`);

    res.json(page);
  } catch (error: any) {
    console.error('[updatePage] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to update page',
      message: error.message 
    });
  }
};

// Delete page
// Delete page function disabled - pages can only be updated, not deleted
export const deletePage = async (req: Request, res: Response) => {
  res.status(403).json({ 
    error: 'Page deletion is not allowed',
    message: 'Pages can only be updated, not deleted. Please update the page content instead.' 
  });
};


