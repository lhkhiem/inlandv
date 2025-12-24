// Job controller
// Handles CRUD operations for jobs

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

// Get all jobs with filters and pagination
export const getJobs = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      status,
      q 
    } = req.query;
    
    const offset = ((page as any) - 1) * (pageSize as any);
    const limit = pageSize as any;

    const whereConditions: string[] = [];
    const replacements: any = { limit, offset };

    if (status) {
      whereConditions.push(`j.status = :status`);
      replacements.status = status;
    }

    if (q) {
      whereConditions.push(`(
        j.title ILIKE :search OR 
        j.slug ILIKE :search OR
        j.location ILIKE :search OR
        COALESCE(j.description_overview, j.description, '') ILIKE :search
      )`);
      replacements.search = `%${q}%`;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      ${whereClause}
    `;
    const countResult: any = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT
    });
    const total = parseInt(countResult[0].total);

    // Get jobs
    const query = `
      SELECT 
        j.*
      FROM jobs j
      ${whereClause}
      ORDER BY j.created_at DESC NULLS LAST
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
    console.error('[getJobs] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// Get job by ID
export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        j.*,
        u.name as created_by_name
      FROM jobs j
      LEFT JOIN users u ON j.created_by = u.id
      WHERE j.id = :id
    `;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(result[0]);
  } catch (error: any) {
    console.error('[getJobById] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

// Create job
export const createJob = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      slug, 
      location,
      salary_range,
      quantity,
      deadline,
      description_overview,
      description_responsibilities,
      description_requirements,
      description_benefits,
      status
    } = req.body;
    const userId = (req as any).user?.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const finalSlug = slug || generateSlugFromName(title);

    // Check if slug already exists
    const slugCheck: any = await sequelize.query(
      `SELECT id FROM jobs WHERE slug = :slug`,
      {
        replacements: { slug: finalSlug },
        type: QueryTypes.SELECT
      }
    );

    if (slugCheck.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    // Use old schema for now (description, requirements) until migration is run
    const query = `
      INSERT INTO jobs 
        (id, title, slug, location, salary_range, description, requirements, created_at)
      VALUES 
        (gen_random_uuid(), :title, :slug, :location, :salary_range, :description, :requirements, NOW())
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        title,
        slug: finalSlug,
        location: location || null,
        salary_range: salary_range || null,
        description: description_overview || description_responsibilities || null,
        requirements: description_requirements || null,
      },
      type: QueryTypes.INSERT
    });

    const jobId = result[0]?.[0]?.id || result[0]?.id;

    // Log activity
    await logActivity(req, 'create', 'job', jobId, title, `Created job: ${title}`);

    res.status(201).json(result[0]?.[0] || result[0]);
  } catch (error: any) {
    console.error('[createJob] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to create job',
      message: error.message 
    });
  }
};

// Update job
export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      slug,
      location,
      salary_range,
      quantity,
      deadline,
      description_overview,
      description_responsibilities,
      description_requirements,
      description_benefits,
      status
    } = req.body;

    // Check if job exists
    const jobCheck: any = await sequelize.query(
      `SELECT id FROM jobs WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (jobCheck.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check slug uniqueness if slug is being updated
    if (slug) {
      const slugCheck: any = await sequelize.query(
        `SELECT id FROM jobs WHERE slug = :slug AND id != :id`,
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
    if (location !== undefined) {
      updateFields.push('location = :location');
      replacements.location = location || null;
    }
    if (salary_range !== undefined) {
      updateFields.push('salary_range = :salary_range');
      replacements.salary_range = salary_range || null;
    }
    // Map new fields to old schema columns
    if (description_overview !== undefined || description_responsibilities !== undefined) {
      updateFields.push('description = :description');
      replacements.description = description_overview || description_responsibilities || null;
    }
    if (description_requirements !== undefined) {
      updateFields.push('requirements = :requirements');
      replacements.requirements = description_requirements || null;
    }
    // Skip new columns (quantity, deadline, status, etc.) until migration is run

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE jobs 
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    const job = result[0]?.[0] || result[0];

    // Log activity
    await logActivity(req, 'update', 'job', id, job.title, `Updated job: ${job.title}`);

    res.json(job);
  } catch (error: any) {
    console.error('[updateJob] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to update job',
      message: error.message 
    });
  }
};

// Delete job
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if job exists
    const jobCheck: any = await sequelize.query(
      `SELECT id, title FROM jobs WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (jobCheck.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const jobTitle = jobCheck[0].title;

    // Delete job
    await sequelize.query(
      `DELETE FROM jobs WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.DELETE
      }
    );

    // Log activity
    await logActivity(req, 'delete', 'job', id, jobTitle, `Deleted job: ${jobTitle}`);

    res.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    console.error('[deleteJob] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to delete job',
      message: error.message 
    });
  }
};

