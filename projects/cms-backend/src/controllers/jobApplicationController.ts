// Job Application controller
// Handles CRUD operations for job applications

import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { logActivity } from './activityLogController';

// Get all job applications with filters and pagination
export const getJobApplications = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      job_id,
      status,
      q 
    } = req.query;
    
    const offset = ((page as any) - 1) * (pageSize as any);
    const limit = pageSize as any;

    const whereConditions: string[] = [];
    const replacements: any = { limit, offset };

    if (job_id) {
      whereConditions.push(`ja.job_id = :job_id`);
      replacements.job_id = job_id;
    }

    if (status) {
      whereConditions.push(`ja.status = :status`);
      replacements.status = status;
    }

    if (q) {
      whereConditions.push(`(
        ja.full_name ILIKE :search OR 
        ja.email ILIKE :search OR
        ja.phone ILIKE :search OR
        ja.cover_letter ILIKE :search
      )`);
      replacements.search = `%${q}%`;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM job_applications ja
      ${whereClause}
    `;
    const countResult: any = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT
    });
    const total = parseInt(countResult[0].total);

    // Get applications
    const query = `
      SELECT 
        ja.*,
        j.title as job_title,
        j.slug as job_slug
      FROM job_applications ja
      LEFT JOIN jobs j ON ja.job_id = j.id
      ${whereClause}
      ORDER BY ja.created_at DESC
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
    console.error('[getJobApplications] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch job applications' });
  }
};

// Get job application by ID
export const getJobApplicationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        ja.*,
        j.title as job_title,
        j.slug as job_slug,
        j.location as job_location
      FROM job_applications ja
      LEFT JOIN jobs j ON ja.job_id = j.id
      WHERE ja.id = :id
    `;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    res.json(result[0]);
  } catch (error: any) {
    console.error('[getJobApplicationById] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch job application' });
  }
};

// Create job application (public endpoint, no auth required)
export const createJobApplication = async (req: Request, res: Response) => {
  try {
    const { 
      job_id,
      full_name,
      email,
      phone,
      cv_url,
      cover_letter
    } = req.body;

    if (!job_id || !full_name || !email || !phone) {
      return res.status(400).json({ error: 'job_id, full_name, email, and phone are required' });
    }

    // Check if job exists
    const jobCheck: any = await sequelize.query(
      `SELECT id, title, status FROM jobs WHERE id = :job_id`,
      {
        replacements: { job_id },
        type: QueryTypes.SELECT
      }
    );

    if (jobCheck.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (jobCheck[0].status !== 'active') {
      return res.status(400).json({ error: 'Job is not currently accepting applications' });
    }

    const query = `
      INSERT INTO job_applications 
        (id, job_id, full_name, email, phone, cv_url, cover_letter, status, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), :job_id, :full_name, :email, :phone, :cv_url, :cover_letter, 'pending', NOW(), NOW())
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        job_id,
        full_name,
        email,
        phone: phone || null,
        cv_url: cv_url || null,
        cover_letter: cover_letter || null,
      },
      type: QueryTypes.INSERT
    });

    const applicationId = result[0]?.[0]?.id || result[0]?.id;

    // Log activity
    await logActivity(req, 'create', 'job_application', applicationId, full_name, `New job application: ${full_name} for ${jobCheck[0].title}`);

    res.status(201).json(result[0]?.[0] || result[0]);
  } catch (error: any) {
    console.error('[createJobApplication] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to submit job application',
      message: error.message 
    });
  }
};

// Update job application status (admin only)
export const updateJobApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      status,
      notes
    } = req.body;

    // Check if application exists
    const appCheck: any = await sequelize.query(
      `SELECT id, full_name, job_id FROM job_applications WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (appCheck.length === 0) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    const updateFields: string[] = [];
    const replacements: any = { id };

    if (status !== undefined) {
      updateFields.push('status = :status');
      replacements.status = status;
    }
    if (notes !== undefined) {
      updateFields.push('notes = :notes');
      replacements.notes = notes || null;
    }

    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE job_applications 
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    const application = result[0]?.[0] || result[0];

    // Log activity
    await logActivity(req, 'update', 'job_application', id, appCheck[0].full_name, `Updated job application status to ${status || 'updated'}`);

    res.json(application);
  } catch (error: any) {
    console.error('[updateJobApplication] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to update job application',
      message: error.message 
    });
  }
};

// Delete job application
export const deleteJobApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if application exists
    const appCheck: any = await sequelize.query(
      `SELECT id, full_name FROM job_applications WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (appCheck.length === 0) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    const applicantName = appCheck[0].full_name;

    // Delete application
    await sequelize.query(
      `DELETE FROM job_applications WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.DELETE
      }
    );

    // Log activity
    await logActivity(req, 'delete', 'job_application', id, applicantName, `Deleted job application: ${applicantName}`);

    res.json({ message: 'Job application deleted successfully' });
  } catch (error: any) {
    console.error('[deleteJobApplication] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to delete job application',
      message: error.message 
    });
  }
};


















