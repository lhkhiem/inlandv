import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Get all newsletter subscriptions
export const getNewsletterSubscriptions = async (req: Request, res: Response) => {
  try {
    const { status, limit = '50', offset = '0' } = req.query;

    let query = `SELECT * FROM newsletter_subscriptions WHERE 1=1`;
    const replacements: any = {};

    if (status) {
      query += ` AND status = :status`;
      replacements.status = status;
    }

    query += ` ORDER BY subscribed_at DESC LIMIT :limit OFFSET :offset`;
    replacements.limit = parseInt(limit as string);
    replacements.offset = parseInt(offset as string);

    const subscriptions: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM newsletter_subscriptions WHERE 1=1`;
    const countReplacements: any = {};
    if (status) {
      countQuery += ` AND status = :status`;
      countReplacements.status = status;
    }

    const countResult: any = await sequelize.query(countQuery, {
      replacements: countReplacements,
      type: QueryTypes.SELECT
    });

    res.json({
      data: subscriptions,
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
    console.error('Failed to fetch newsletter subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch newsletter subscriptions' });
  }
};

// Subscribe to newsletter
export const subscribeNewsletter = async (req: Request, res: Response) => {
  try {
    const { email, source, ip_address, user_agent } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    // Check if already subscribed
    const checkQuery = `SELECT * FROM newsletter_subscriptions WHERE email = :email`;
    const existing: any = await sequelize.query(checkQuery, {
      replacements: { email },
      type: QueryTypes.SELECT
    });

    if (existing.length > 0) {
      const existingSub = existing[0];
      if (existingSub.status === 'active') {
        return res.status(409).json({ error: 'Email already subscribed' });
      } else {
        // Reactivate subscription
        const reactivateQuery = `
          UPDATE newsletter_subscriptions
          SET status = 'active', subscribed_at = CURRENT_TIMESTAMP, unsubscribed_at = NULL,
              source = :source, ip_address = :ip_address, user_agent = :user_agent,
              updated_at = CURRENT_TIMESTAMP
          WHERE email = :email
          RETURNING *
        `;
        const result: any = await sequelize.query(reactivateQuery, {
          replacements: { email, source: source || null, ip_address: ip_address || null, user_agent: user_agent || null },
          type: QueryTypes.UPDATE
        });
        return res.json(result[0][0]);
      }
    }

    const id = uuidv4();

    const query = `
      INSERT INTO newsletter_subscriptions (
        id, email, status, subscribed_at, source, ip_address, user_agent
      )
      VALUES (
        :id, :email, 'active', CURRENT_TIMESTAMP, :source, :ip_address, :user_agent
      )
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        email,
        source: source || null,
        ip_address: ip_address || null,
        user_agent: user_agent || null
      },
      type: QueryTypes.INSERT
    });

    res.status(201).json(result[0][0]);
  } catch (error: any) {
    if (error.message?.includes('duplicate key') || error.message?.includes('unique')) {
      return res.status(409).json({ error: 'Email already subscribed' });
    }
    console.error('Failed to subscribe to newsletter:', error);
    res.status(500).json({ error: 'Failed to subscribe to newsletter' });
  }
};

// Unsubscribe from newsletter
export const unsubscribeNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const query = `
      UPDATE newsletter_subscriptions
      SET status = 'unsubscribed', unsubscribed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE email = :email
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: { email },
      type: QueryTypes.UPDATE
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ message: 'Successfully unsubscribed', data: result[0][0] });
  } catch (error) {
    console.error('Failed to unsubscribe from newsletter:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from newsletter' });
  }
};

// Update subscription status (admin only)
export const updateSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'unsubscribed', 'bounced'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required (active, unsubscribed, bounced)' });
    }

    const updateFields: string[] = ['status = :status', 'updated_at = CURRENT_TIMESTAMP'];
    const replacements: any = { id, status };

    if (status === 'unsubscribed') {
      updateFields.push('unsubscribed_at = CURRENT_TIMESTAMP');
    } else if (status === 'active') {
      updateFields.push('unsubscribed_at = NULL');
    }

    const query = `
      UPDATE newsletter_subscriptions
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(result[0][0]);
  } catch (error) {
    console.error('Failed to update subscription status:', error);
    res.status(500).json({ error: 'Failed to update subscription status' });
  }
};

// Delete subscription
export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result: any = await sequelize.query(
      'DELETE FROM newsletter_subscriptions WHERE id = :id RETURNING *',
      {
        replacements: { id },
        type: QueryTypes.DELETE
      }
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Failed to delete subscription:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
};






















