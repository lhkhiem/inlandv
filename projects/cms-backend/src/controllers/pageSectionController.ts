// Page Section controller
// Handles CRUD operations for page sections

import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { logActivity } from './activityLogController';

// Get all sections for a page
export const getPageSections = async (req: Request, res: Response) => {
  try {
    const { page_id } = req.params;
    const { published } = req.query;

    const whereConditions: string[] = ['ps.page_id = :page_id'];
    const replacements: any = { page_id };

    if (published !== undefined) {
      whereConditions.push('ps.published = :published');
      replacements.published = published === 'true';
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const query = `
      SELECT 
        ps.*,
        u.name as created_by_name
      FROM page_sections ps
      LEFT JOIN users u ON ps.created_by = u.id
      ${whereClause}
      ORDER BY ps.display_order ASC, ps.created_at ASC
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json({ data: result });
  } catch (error: any) {
    console.error('[getPageSections] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch page sections' });
  }
};

// Get section by ID
export const getPageSectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        ps.*,
        u.name as created_by_name
      FROM page_sections ps
      LEFT JOIN users u ON ps.created_by = u.id
      WHERE ps.id = :id
    `;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Page section not found' });
    }

    res.json(result[0]);
  } catch (error: any) {
    console.error('[getPageSectionById] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch page section' });
  }
};

// Create section
export const createPageSection = async (req: Request, res: Response) => {
  try {
    const { 
      page_id,
      section_key,
      name,
      section_type,
      display_order,
      content,
      images,
      published
    } = req.body;
    const userId = (req as any).user?.id;

    if (!page_id || !section_key || !name || !section_type) {
      return res.status(400).json({ error: 'page_id, section_key, name, and section_type are required' });
    }

    // Check if page exists
    const pageCheck: any = await sequelize.query(
      `SELECT id FROM pages WHERE id = :page_id`,
      {
        replacements: { page_id },
        type: QueryTypes.SELECT
      }
    );

    if (pageCheck.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Check if section_key already exists for this page
    const keyCheck: any = await sequelize.query(
      `SELECT id FROM page_sections WHERE page_id = :page_id AND section_key = :section_key`,
      {
        replacements: { page_id, section_key },
        type: QueryTypes.SELECT
      }
    );

    if (keyCheck.length > 0) {
      return res.status(400).json({ error: 'Section key already exists for this page' });
    }

    // Format images array for PostgreSQL TEXT[]
    const imagesArray = images && Array.isArray(images) ? images : (images ? [images] : []);
    const replacements: any = {
      page_id,
      section_key,
      name,
      section_type,
      display_order: display_order || 0,
      content: content || null,
      published: published !== undefined ? published : true,
      created_by: userId || null
    };

    // Build images array SQL
    let imagesSql = 'ARRAY[]::text[]';
    if (imagesArray.length > 0) {
      const escaped = imagesArray.map((img, i) => {
        const key = `img${i}`;
        replacements[key] = img;
        return `:${key}`;
      }).join(', ');
      imagesSql = `ARRAY[${escaped}]::text[]`;
    }

    const query = `
      INSERT INTO page_sections 
        (id, page_id, section_key, name, section_type, display_order, content, images, published, created_at, updated_at, created_by)
      VALUES 
        (gen_random_uuid(), :page_id, :section_key, :name, :section_type, :display_order, :content, ${imagesSql}, :published, NOW(), NOW(), :created_by)
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.INSERT
    });

    const sectionId = result[0]?.[0]?.id || result[0]?.id;

    // Log activity
    await logActivity(req, 'create', 'page_section', sectionId, name, `Created section: ${name}`);

    res.status(201).json(result[0]?.[0] || result[0]);
  } catch (error: any) {
    console.error('[createPageSection] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to create page section',
      message: error.message 
    });
  }
};

// Update section
export const updatePageSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      section_key,
      name,
      section_type,
      display_order,
      content,
      images,
      published
    } = req.body;

    // Check if section exists
    const sectionCheck: any = await sequelize.query(
      `SELECT id, page_id FROM page_sections WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (sectionCheck.length === 0) {
      return res.status(404).json({ error: 'Page section not found' });
    }

    const pageId = sectionCheck[0].page_id;

    // Check section_key uniqueness if being updated
    if (section_key) {
      const keyCheck: any = await sequelize.query(
        `SELECT id FROM page_sections WHERE page_id = :page_id AND section_key = :section_key AND id != :id`,
        {
          replacements: { page_id: pageId, section_key, id },
          type: QueryTypes.SELECT
        }
      );

      if (keyCheck.length > 0) {
        return res.status(400).json({ error: 'Section key already exists for this page' });
      }
    }

    const updateFields: string[] = [];
    const replacements: any = { id };

    if (section_key !== undefined) {
      updateFields.push('section_key = :section_key');
      replacements.section_key = section_key;
    }
    if (name !== undefined) {
      updateFields.push('name = :name');
      replacements.name = name;
    }
    if (section_type !== undefined) {
      updateFields.push('section_type = :section_type');
      replacements.section_type = section_type;
    }
    if (display_order !== undefined) {
      updateFields.push('display_order = :display_order');
      replacements.display_order = display_order;
    }
    if (content !== undefined) {
      updateFields.push('content = :content');
      replacements.content = content || null;
    }
    if (images !== undefined) {
      // Handle images array - PostgreSQL TEXT[] format
      const imagesArray = images && Array.isArray(images) ? images : (images ? [images] : []);
      if (imagesArray.length > 0) {
        // Format as PostgreSQL array literal: ARRAY['url1', 'url2']::text[]
        const escaped = imagesArray.map((img, i) => {
          const key = `img${i}`;
          replacements[key] = img;
          return `:${key}`;
        }).join(', ');
        updateFields.push(`images = ARRAY[${escaped}]::text[]`);
      } else {
        updateFields.push('images = ARRAY[]::text[]');
      }
    }
    if (published !== undefined) {
      updateFields.push('published = :published');
      replacements.published = published;
    }

    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE page_sections 
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    // Sequelize returns result in format: [[row], metadata] or [rows, metadata]
    const section = Array.isArray(result[0]) && result[0].length > 0 
      ? result[0][0] 
      : (result[0] || null);

    if (!section) {
      return res.status(404).json({ error: 'Page section not found' });
    }

    // Log activity
    await logActivity(req, 'update', 'page_section', id, section.name, `Updated section: ${section.name}`);

    res.json(section);
  } catch (error: any) {
    console.error('[updatePageSection] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to update page section',
      message: error.message 
    });
  }
};

// Delete section function disabled - sections can only be updated, not deleted
export const deletePageSection = async (req: Request, res: Response) => {
  res.status(403).json({ 
    error: 'Section deletion is not allowed',
    message: 'Sections can only be updated, not deleted. Please update the section content instead.' 
  });
};

// Bulk update section order
export const updatePageSectionsOrder = async (req: Request, res: Response) => {
  try {
    const { page_id } = req.params;
    const { sections } = req.body; // Array of { id, display_order }

    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'sections must be an array' });
    }

    // Use transaction
    await sequelize.transaction(async (transaction) => {
      for (const section of sections) {
        await sequelize.query(
          `UPDATE page_sections SET display_order = :display_order WHERE id = :id AND page_id = :page_id`,
          {
            replacements: {
              id: section.id,
              display_order: section.display_order,
              page_id
            },
            type: QueryTypes.UPDATE,
            transaction
          }
        );
      }
    });

    res.json({ message: 'Sections order updated successfully' });
  } catch (error: any) {
    console.error('[updatePageSectionsOrder] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to update sections order',
      message: error.message 
    });
  }
};


