import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// FAQ Categories
// ============================================

export const getFAQCategories = async (req: Request, res: Response) => {
  try {
    const { is_active } = req.query;

    let query = `SELECT * FROM faq_categories WHERE 1=1`;
    const replacements: any = {};

    if (is_active !== undefined) {
      query += ` AND is_active = :is_active`;
      replacements.is_active = is_active === 'true';
    }

    query += ` ORDER BY sort_order ASC, created_at ASC`;

    const categories: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json({ data: categories });
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.json({ data: [] });
    }
    console.error('Failed to fetch FAQ categories:', error);
    res.status(500).json({ error: 'Failed to fetch FAQ categories' });
  }
};

export const createFAQCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, sort_order, is_active } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug are required' });
    }

    const id = uuidv4();

    const query = `
      INSERT INTO faq_categories (id, name, slug, sort_order, is_active)
      VALUES (:id, :name, :slug, :sort_order, :is_active)
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        name,
        slug,
        sort_order: sort_order !== undefined ? sort_order : 0,
        is_active: is_active !== undefined ? is_active : true
      },
      type: QueryTypes.INSERT
    });

    res.status(201).json(result[0][0]);
  } catch (error: any) {
    if (error.message?.includes('duplicate key') || error.message?.includes('unique')) {
      return res.status(409).json({ error: 'FAQ category with this slug already exists' });
    }
    console.error('Failed to create FAQ category:', error);
    res.status(500).json({ error: 'Failed to create FAQ category' });
  }
};

export const updateFAQCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, sort_order, is_active } = req.body;

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
    if (sort_order !== undefined) {
      updateFields.push('sort_order = :sort_order');
      replacements.sort_order = sort_order;
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = :is_active');
      replacements.is_active = is_active;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    if (updateFields.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE faq_categories
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'FAQ category not found' });
    }

    res.json(result[0][0]);
  } catch (error) {
    console.error('Failed to update FAQ category:', error);
    res.status(500).json({ error: 'Failed to update FAQ category' });
  }
};

export const deleteFAQCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result: any = await sequelize.query(
      'DELETE FROM faq_categories WHERE id = :id RETURNING *',
      {
        replacements: { id },
        type: QueryTypes.DELETE
      }
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'FAQ category not found' });
    }

    res.json({ message: 'FAQ category deleted successfully' });
  } catch (error) {
    console.error('Failed to delete FAQ category:', error);
    res.status(500).json({ error: 'Failed to delete FAQ category' });
  }
};

// ============================================
// FAQ Questions
// ============================================

export const getFAQQuestions = async (req: Request, res: Response) => {
  try {
    const { category_id, is_active } = req.query;

    let query = `SELECT * FROM faq_questions WHERE 1=1`;
    const replacements: any = {};

    if (category_id) {
      query += ` AND category_id = :category_id`;
      replacements.category_id = category_id;
    }
    if (is_active !== undefined) {
      query += ` AND is_active = :is_active`;
      replacements.is_active = is_active === 'true';
    }

    query += ` ORDER BY sort_order ASC, created_at ASC`;

    const questions: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json({ data: questions });
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.json({ data: [] });
    }
    console.error('Failed to fetch FAQ questions:', error);
    res.status(500).json({ error: 'Failed to fetch FAQ questions' });
  }
};

export const createFAQQuestion = async (req: Request, res: Response) => {
  try {
    const { category_id, question, answer, sort_order, is_active } = req.body;

    if (!category_id || !question || !answer) {
      return res.status(400).json({ error: 'category_id, question, and answer are required' });
    }

    const id = uuidv4();

    const query = `
      INSERT INTO faq_questions (id, category_id, question, answer, sort_order, is_active)
      VALUES (:id, :category_id, :question, :answer, :sort_order, :is_active)
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        category_id,
        question,
        answer,
        sort_order: sort_order !== undefined ? sort_order : 0,
        is_active: is_active !== undefined ? is_active : true
      },
      type: QueryTypes.INSERT
    });

    res.status(201).json(result[0][0]);
  } catch (error) {
    console.error('Failed to create FAQ question:', error);
    res.status(500).json({ error: 'Failed to create FAQ question' });
  }
};

export const updateFAQQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category_id, question, answer, sort_order, is_active } = req.body;

    const updateFields: string[] = [];
    const replacements: any = { id };

    if (category_id !== undefined) {
      updateFields.push('category_id = :category_id');
      replacements.category_id = category_id;
    }
    if (question !== undefined) {
      updateFields.push('question = :question');
      replacements.question = question;
    }
    if (answer !== undefined) {
      updateFields.push('answer = :answer');
      replacements.answer = answer;
    }
    if (sort_order !== undefined) {
      updateFields.push('sort_order = :sort_order');
      replacements.sort_order = sort_order;
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = :is_active');
      replacements.is_active = is_active;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    if (updateFields.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE faq_questions
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'FAQ question not found' });
    }

    res.json(result[0][0]);
  } catch (error) {
    console.error('Failed to update FAQ question:', error);
    res.status(500).json({ error: 'Failed to update FAQ question' });
  }
};

export const deleteFAQQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result: any = await sequelize.query(
      'DELETE FROM faq_questions WHERE id = :id RETURNING *',
      {
        replacements: { id },
        type: QueryTypes.DELETE
      }
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'FAQ question not found' });
    }

    res.json({ message: 'FAQ question deleted successfully' });
  } catch (error) {
    console.error('Failed to delete FAQ question:', error);
    res.status(500).json({ error: 'Failed to delete FAQ question' });
  }
};






