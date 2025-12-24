import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Get all settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    const query = `SELECT * FROM settings ORDER BY namespace ASC`;
    const settings: any = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    res.json({ data: settings });
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.json({ data: [] });
    }
    console.error('Failed to fetch settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Get setting by namespace
export const getSettingByNamespace = async (req: Request, res: Response) => {
  try {
    const { namespace } = req.params;

    const query = `SELECT * FROM settings WHERE namespace = :namespace`;
    const result: any = await sequelize.query(query, {
      replacements: { namespace },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      // Return empty value object instead of 404 to match frontend expectations
      return res.json({ namespace, value: {} });
    }

    const setting = result[0];
    // Parse JSON value if it's a string
    if (typeof setting.value === 'string') {
      try {
        setting.value = JSON.parse(setting.value);
      } catch (e) {
        // If parsing fails, keep as is
      }
    }

    res.json(setting);
  } catch (error) {
    console.error('Failed to fetch setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
};

// Create or update setting
export const upsertSetting = async (req: Request, res: Response) => {
  try {
    const { namespace, value } = req.body;

    if (!namespace || !value) {
      return res.status(400).json({ error: 'namespace and value are required' });
    }

    const query = `
      INSERT INTO settings (id, namespace, value, updated_at)
      VALUES (gen_random_uuid(), :namespace, :value, CURRENT_TIMESTAMP)
      ON CONFLICT (namespace) 
      DO UPDATE SET value = :value, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: { namespace, value: JSON.stringify(value) },
      type: QueryTypes.INSERT
    });

    const setting = result[0][0];
    // Parse JSON value if it's a string
    if (typeof setting.value === 'string') {
      try {
        setting.value = JSON.parse(setting.value);
      } catch (e) {
        // If parsing fails, keep as is
      }
    }

    res.json(setting);
  } catch (error) {
    console.error('Failed to upsert setting:', error);
    res.status(500).json({ error: 'Failed to upsert setting' });
  }
};

// Update setting (with upsert behavior)
export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { namespace } = req.params;
    const { value, namespace: bodyNamespace } = req.body;

    // Use namespace from body if provided, otherwise from params
    const finalNamespace = bodyNamespace || namespace;

    if (!value) {
      return res.status(400).json({ error: 'value is required' });
    }

    // Use upsert (INSERT ... ON CONFLICT) to create if doesn't exist
    const query = `
      INSERT INTO settings (id, namespace, value, updated_at)
      VALUES (gen_random_uuid(), :namespace, :value, CURRENT_TIMESTAMP)
      ON CONFLICT (namespace) 
      DO UPDATE SET value = :value, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: { namespace: finalNamespace, value: JSON.stringify(value) },
      type: QueryTypes.INSERT
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(500).json({ error: 'Failed to update setting' });
    }

    const setting = result[0][0];
    // Parse JSON value if it's a string
    if (typeof setting.value === 'string') {
      try {
        setting.value = JSON.parse(setting.value);
      } catch (e) {
        // If parsing fails, keep as is
      }
    }

    res.json(setting);
  } catch (error) {
    console.error('Failed to update setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
};

// Delete setting
export const deleteSetting = async (req: Request, res: Response) => {
  try {
    const { namespace } = req.params;

    const result: any = await sequelize.query(
      'DELETE FROM settings WHERE namespace = :namespace RETURNING *',
      {
        replacements: { namespace },
        type: QueryTypes.DELETE
      }
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Failed to delete setting:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
};

// Clear cache (placeholder - implement actual cache clearing if needed)
export const clearCache = async (req: Request, res: Response) => {
  try {
    // TODO: Implement actual cache clearing logic if using Redis or other cache
    // For now, just return success
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
};

// Reset settings to defaults
export const resetDefaults = async (req: Request, res: Response) => {
  try {
    const { scope } = req.body;

    // Default values for each namespace
    const defaults: Record<string, any> = {
      general: {
        siteName: '',
        siteDescription: '',
        siteUrl: '',
        adminEmail: '',
        businessInfo: {},
        socialLinks: {},
        workingHours: {}
      },
      appearance: {
        primaryColor: '#8b5cf6',
        logo_asset_id: null,
        logo_url: '',
        favicon_asset_id: null,
        favicon_url: '',
        ecommerce_logo_asset_id: null,
        ecommerce_logo_url: '',
        ecommerce_favicon_asset_id: null,
        ecommerce_favicon_url: '',
        topBannerText: '',
        themeMode: 'light'
      },
      email: {
        smtpHost: '',
        smtpPort: 587,
        encryption: 'tls',
        fromEmail: '',
        fromName: 'Inland CMS',
        username: '',
        password: '',
        enabled: false
      },
      notifications: {
        newPost: true,
        newUser: true,
        newComment: true,
        systemUpdates: true
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 60,
        passwordPolicy: {
          minLength: 8,
          uppercase: true,
          numbers: true,
          special: false
        }
      },
      advanced: {
        apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001',
        cacheStrategy: 'memory'
      },
      homepage_metrics: {
        activeCustomers: '',
        countriesServed: '',
        yearsInBusiness: ''
      }
    };

    if (!scope || !defaults[scope]) {
      return res.status(400).json({ error: 'Invalid scope or scope not found' });
    }

    const defaultValue = defaults[scope];

    // Upsert the default value
    const query = `
      INSERT INTO settings (id, namespace, value, updated_at)
      VALUES (gen_random_uuid(), :namespace, :value, CURRENT_TIMESTAMP)
      ON CONFLICT (namespace) 
      DO UPDATE SET value = :value, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: { namespace: scope, value: JSON.stringify(defaultValue) },
      type: QueryTypes.INSERT
    });

    const setting = result[0][0];
    // Parse JSON value if it's a string
    if (typeof setting.value === 'string') {
      try {
        setting.value = JSON.parse(setting.value);
      } catch (e) {
        // If parsing fails, keep as is
      }
    }

    res.json({ 
      message: 'Settings reset to defaults',
      defaults: setting.value
    });
  } catch (error) {
    console.error('Failed to reset defaults:', error);
    res.status(500).json({ error: 'Failed to reset defaults' });
  }
};






