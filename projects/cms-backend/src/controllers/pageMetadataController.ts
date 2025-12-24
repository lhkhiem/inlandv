import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Get all page metadata
export const getPageMetadata = async (req: Request, res: Response) => {
  try {
    const { path, enabled, auto_generated } = req.query;

    let query = `SELECT * FROM page_metadata WHERE 1=1`;
    const replacements: any = {};

    if (path) {
      query += ` AND path = :path`;
      replacements.path = path;
    }
    if (enabled !== undefined) {
      query += ` AND enabled = :enabled`;
      replacements.enabled = enabled === 'true';
    }
    if (auto_generated !== undefined) {
      query += ` AND auto_generated = :auto_generated`;
      replacements.auto_generated = auto_generated === 'true';
    }

    query += ` ORDER BY created_at DESC`;

    const metadata: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json({ data: metadata });
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.json({ data: [] });
    }
    console.error('Failed to fetch page metadata:', error);
    res.status(500).json({ error: 'Failed to fetch page metadata' });
  }
};

// Get page metadata by path
export const getPageMetadataByPath = async (req: Request, res: Response) => {
  try {
    const { path } = req.params;

    const query = `SELECT * FROM page_metadata WHERE path = :path`;
    const result: any = await sequelize.query(query, {
      replacements: { path },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Page metadata not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Failed to fetch page metadata:', error);
    res.status(500).json({ error: 'Failed to fetch page metadata' });
  }
};

// Create page metadata
export const createPageMetadata = async (req: Request, res: Response) => {
  try {
    const {
      path,
      title,
      description,
      og_image,
      keywords,
      enabled,
      auto_generated
    } = req.body;

    if (!path) {
      return res.status(400).json({ error: 'path is required' });
    }

    const id = uuidv4();

    // Handle keywords: convert array to PostgreSQL TEXT[] format
    let keywordsArray: string[] | null = null;
    if (keywords) {
      if (Array.isArray(keywords)) {
        keywordsArray = keywords.filter(k => k && k.trim());
      } else if (typeof keywords === 'string') {
        keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k);
      }
      if (keywordsArray && keywordsArray.length === 0) {
        keywordsArray = null;
      }
    }

    // Build keywords array literal for PostgreSQL
    const keywordsLiteral = keywordsArray && keywordsArray.length > 0
      ? `ARRAY[${keywordsArray.map((_, i) => `:keyword${i}`).join(', ')}]::TEXT[]`
      : `ARRAY[]::TEXT[]`;
    
    const query = `
      INSERT INTO page_metadata (
        id, path, title, description, og_image, keywords, enabled, auto_generated
      )
      VALUES (
        :id, :path, :title, :description, :og_image, ${keywordsLiteral}, :enabled, :auto_generated
      )
      RETURNING *
    `;

    const replacements: any = {
      id,
      path,
      title: title || null,
      description: description || null,
      og_image: og_image || null,
      enabled: enabled !== undefined ? enabled : true,
      auto_generated: auto_generated !== undefined ? auto_generated : false
    };

    // Add keyword replacements
    if (keywordsArray && keywordsArray.length > 0) {
      keywordsArray.forEach((keyword, i) => {
        replacements[`keyword${i}`] = keyword;
      });
    }

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.INSERT
    });

    res.status(201).json(result[0][0]);
  } catch (error: any) {
    if (error.message?.includes('duplicate key') || error.message?.includes('unique')) {
      return res.status(409).json({ error: 'Page metadata with this path already exists' });
    }
    console.error('Failed to create page metadata:', error);
    res.status(500).json({ error: 'Failed to create page metadata' });
  }
};

// Update page metadata
export const updatePageMetadata = async (req: Request, res: Response) => {
  try {
    const { path } = req.params;
    const {
      title,
      description,
      og_image,
      keywords,
      enabled,
      auto_generated
    } = req.body;

    const updateFields: string[] = [];
    const replacements: any = { path };

    if (title !== undefined) {
      updateFields.push('title = :title');
      replacements.title = title;
    }
    if (description !== undefined) {
      updateFields.push('description = :description');
      replacements.description = description;
    }
    if (og_image !== undefined) {
      updateFields.push('og_image = :og_image');
      replacements.og_image = og_image;
    }
    if (keywords !== undefined) {
      // Handle keywords: convert array to PostgreSQL TEXT[] format
      let keywordsArray: string[] | null = null;
      if (keywords) {
        if (Array.isArray(keywords)) {
          keywordsArray = keywords.filter(k => k && k.trim());
        } else if (typeof keywords === 'string') {
          keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k);
        }
        if (keywordsArray && keywordsArray.length === 0) {
          keywordsArray = null;
        }
      }
      
      // Build keywords array literal for PostgreSQL
      const keywordsLiteral = keywordsArray && keywordsArray.length > 0
        ? `ARRAY[${keywordsArray.map((_, i) => `:keyword${i}`).join(', ')}]::TEXT[]`
        : `ARRAY[]::TEXT[]`;
      
      updateFields.push(`keywords = ${keywordsLiteral}`);
      
      // Add keyword replacements
      if (keywordsArray && keywordsArray.length > 0) {
        keywordsArray.forEach((keyword, i) => {
          replacements[`keyword${i}`] = keyword;
        });
      }
    }
    if (enabled !== undefined) {
      updateFields.push('enabled = :enabled');
      replacements.enabled = enabled;
    }
    if (auto_generated !== undefined) {
      updateFields.push('auto_generated = :auto_generated');
      replacements.auto_generated = auto_generated;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    if (updateFields.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE page_metadata
      SET ${updateFields.join(', ')}
      WHERE path = :path
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Page metadata not found' });
    }

    res.json(result[0][0]);
  } catch (error) {
    console.error('Failed to update page metadata:', error);
    res.status(500).json({ error: 'Failed to update page metadata' });
  }
};

// Delete page metadata
export const deletePageMetadata = async (req: Request, res: Response) => {
  try {
    const { path } = req.params;

    const result: any = await sequelize.query(
      'DELETE FROM page_metadata WHERE path = :path RETURNING *',
      {
        replacements: { path },
        type: QueryTypes.DELETE
      }
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Page metadata not found' });
    }

    res.json({ message: 'Page metadata deleted successfully' });
  } catch (error) {
    console.error('Failed to delete page metadata:', error);
    res.status(500).json({ error: 'Failed to delete page metadata' });
  }
};




