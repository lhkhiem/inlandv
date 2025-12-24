// News controller
// Handles CRUD operations for news

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
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

// Get all news with filters and pagination
export const getNews = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      category_id,
      featured,
      q 
    } = req.query;
    
    const offset = ((page as any) - 1) * (pageSize as any);
    const limit = pageSize as any;

    const whereConditions: string[] = [];
    const replacements: any = { limit, offset };

    if (category_id) {
      whereConditions.push(`n.category_id = :category_id`);
      replacements.category_id = category_id;
    }

    if (featured !== undefined) {
      whereConditions.push(`n.featured = :featured`);
      replacements.featured = featured === 'true' || String(featured) === 'true';
    }

    if (q) {
      whereConditions.push(`(
        n.title ILIKE :search OR 
        n.slug ILIKE :search OR
        n.excerpt ILIKE :search OR
        n.content ILIKE :search
      )`);
      replacements.search = `%${q}%`;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM news n
      ${whereClause}
    `;
    const countResult: any = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT
    });
    const total = parseInt(countResult[0].total);

    // Get news
    const query = `
      SELECT 
        n.*,
        nc.name as category_name,
        nc.slug as category_slug,
        u.name as author_name
      FROM news n
      LEFT JOIN news_categories nc ON n.category_id = nc.id
      LEFT JOIN users u ON n.created_by = u.id
      ${whereClause}
      ORDER BY n.published_at DESC NULLS LAST, n.created_at DESC
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
    console.error('[getNews] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      message: error.message 
    });
  }
};

// Get news by ID
export const getNewsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid news ID' });
    }

    const query = `
      SELECT 
        n.*,
        nc.name as category_name,
        nc.slug as category_slug,
        u.name as author_name
      FROM news n
      LEFT JOIN news_categories nc ON n.category_id = nc.id
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.id = :id
    `;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(result[0]);
  } catch (error: any) {
    console.error('[getNewsById] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      message: error.message 
    });
  }
};

// Create new news
export const createNews = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      slug, 
      category_id,
      thumbnail,
      excerpt,
      content,
      author,
      featured,
      published_at,
      meta_title,
      meta_description,
      meta_keywords
    } = req.body;
    const userId = (req as any).user?.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!category_id) {
      return res.status(400).json({ error: 'Category is required' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const finalSlug = slug || generateSlugFromName(title);

    // Check if slug already exists
    const slugCheck: any = await sequelize.query(
      `SELECT id FROM news WHERE slug = :slug`,
      {
        replacements: { slug: finalSlug },
        type: QueryTypes.SELECT
      }
    );

    if (slugCheck.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    // Check if category exists
    const categoryCheck: any = await sequelize.query(
      `SELECT id FROM news_categories WHERE id = :category_id`,
      {
        replacements: { category_id },
        type: QueryTypes.SELECT
      }
    );

    if (categoryCheck.length === 0) {
      return res.status(400).json({ error: 'Category not found' });
    }

    const query = `
      INSERT INTO news 
        (id, title, slug, category_id, thumbnail, excerpt, content, author, featured, 
         published_at, meta_title, meta_description, meta_keywords,
         view_count, created_at, updated_at, created_by)
      VALUES 
        (gen_random_uuid(), :title, :slug, :category_id, :thumbnail, :excerpt, :content, 
         :author, :featured, :published_at, :meta_title, :meta_description, :meta_keywords,
         0, NOW(), NOW(), :created_by)
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        title,
        slug: finalSlug,
        category_id,
        thumbnail: thumbnail || null,
        excerpt: excerpt || null,
        content,
        author: (author && author.trim()) ? author.trim() : null,
        featured: featured || false,
        published_at: published_at || null,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
        meta_keywords: meta_keywords || null,
        created_by: userId || null
      },
      type: QueryTypes.INSERT
    });

    const newsId = result[0]?.[0]?.id || result[0]?.id;

    // Log activity
    await logActivity(req, 'create', 'news', newsId, title, `Created news: ${title}`);

    res.status(201).json(result[0]?.[0] || result[0]);
  } catch (error: any) {
    console.error('[createNews] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to create news',
      message: error.message 
    });
  }
};

// Update news
export const updateNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      slug, 
      category_id,
      thumbnail,
      excerpt,
      content,
      author,
      featured,
      published_at,
      meta_title,
      meta_description,
      meta_keywords
    } = req.body;
    const userId = (req as any).user?.id;

    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid news ID' });
    }

    // Check if news exists
    const existing: any = await sequelize.query(
      `SELECT id, title FROM news WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    // If slug is being changed, check if new slug exists
    if (slug && slug !== existing[0].slug) {
      const slugCheck: any = await sequelize.query(
        `SELECT id FROM news WHERE slug = :slug AND id != :id`,
        {
          replacements: { slug, id },
          type: QueryTypes.SELECT
        }
      );

      if (slugCheck.length > 0) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
    }

    // If category is being changed, check if category exists
    if (category_id) {
      const categoryCheck: any = await sequelize.query(
        `SELECT id FROM news_categories WHERE id = :category_id`,
        {
          replacements: { category_id },
          type: QueryTypes.SELECT
        }
      );

      if (categoryCheck.length === 0) {
        return res.status(400).json({ error: 'Category not found' });
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
    if (category_id !== undefined) {
      updateFields.push('category_id = :category_id');
      replacements.category_id = category_id;
    }
    if (thumbnail !== undefined) {
      updateFields.push('thumbnail = :thumbnail');
      replacements.thumbnail = thumbnail;
    }
    if (excerpt !== undefined) {
      updateFields.push('excerpt = :excerpt');
      replacements.excerpt = excerpt;
    }
    if (content !== undefined) {
      updateFields.push('content = :content');
      replacements.content = content;
    }
    if (author !== undefined) {
      updateFields.push('author = :author');
      replacements.author = author;
    }
    if (featured !== undefined) {
      updateFields.push('featured = :featured');
      replacements.featured = featured;
    }
    if (published_at !== undefined) {
      updateFields.push('published_at = :published_at');
      replacements.published_at = published_at;
    }
    if (meta_title !== undefined) {
      updateFields.push('meta_title = :meta_title');
      replacements.meta_title = meta_title;
    }
    if (meta_description !== undefined) {
      updateFields.push('meta_description = :meta_description');
      replacements.meta_description = meta_description;
    }
    if (meta_keywords !== undefined) {
      updateFields.push('meta_keywords = :meta_keywords');
      replacements.meta_keywords = meta_keywords;
    }

    updateFields.push('updated_at = NOW()');

    const query = `
      UPDATE news
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    // Log activity
    await logActivity(req, 'update', 'news', id, title || existing[0].title, `Updated news: ${title || existing[0].title}`);

    res.json(result[0]?.[0] || result[0]);
  } catch (error: any) {
    console.error('[updateNews] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to update news',
      message: error.message 
    });
  }
};

// Delete news
export const deleteNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid news ID' });
    }

    // Check if news exists and get title for logging
    const existing: any = await sequelize.query(
      `SELECT id, title FROM news WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    const query = `
      DELETE FROM news
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.DELETE
    });

    // Log activity
    await logActivity(req, 'delete', 'news', id, existing[0].title, `Deleted news: ${existing[0].title}`);

    res.json({ 
      success: true,
      message: 'News deleted successfully',
      data: result[0]?.[0] || result[0]
    });
  } catch (error: any) {
    console.error('[deleteNews] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to delete news',
      message: error.message 
    });
  }
};

// Copy/Duplicate news
export const copyNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    // Get original news
    const getQuery = `SELECT * FROM news WHERE id = :id`;
    const getResult: any = await sequelize.query(getQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (getResult.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    const original = getResult[0];

    // Generate new unique slug
    let newSlug = `${original.slug}-copy`;
    let slugCounter = 1;
    while (true) {
      const slugCheck: any = await sequelize.query(
        `SELECT id FROM news WHERE slug = :slug`,
        { replacements: { slug: newSlug }, type: QueryTypes.SELECT }
      );
      if (slugCheck.length === 0) break;
      newSlug = `${original.slug}-copy-${slugCounter}`;
      slugCounter++;
    }

    // Prepare new data (copy all fields except id, slug, published_at, view_count)
    const newId = uuidv4();
    const newTitle = `${original.title} (Copy)`;

    const insertQuery = `
      INSERT INTO news (
        id, title, slug, category_id,
        thumbnail, excerpt, content,
        author, featured,
        meta_title, meta_description, meta_keywords,
        published_at, created_by
      )
      VALUES (
        :id::uuid, :title, :slug, :category_id,
        :thumbnail, :excerpt, :content,
        :author, :featured,
        :meta_title, :meta_description, :meta_keywords,
        NULL, :created_by::uuid
      )
      RETURNING *
    `;

    const replacements: any = {
      id: newId,
      title: newTitle,
      slug: newSlug,
      category_id: original.category_id,
      thumbnail: original.thumbnail,
      excerpt: original.excerpt,
      content: original.content,
      author: original.author,
      featured: original.featured ?? false,
      meta_title: original.meta_title,
      meta_description: original.meta_description,
      meta_keywords: original.meta_keywords,
      created_by: userId || original.created_by
    };

    const result: any = await sequelize.query(insertQuery, {
      replacements,
      type: QueryTypes.INSERT
    });

    const copiedNews = result[0][0];

    // Log activity
    await logActivity(req, 'create', 'news', newId, newTitle, `Copied news from "${original.title}"`);

    res.json({
      success: true,
      data: copiedNews,
      message: 'News copied successfully'
    });
  } catch (error: any) {
    console.error('[copyNews] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to copy news', message: error.message });
  }
};

