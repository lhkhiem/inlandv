// Industrial Park controller
// Handles CRUD operations for industrial parks

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

// Get all industrial parks with filters and pagination
export const getIndustrialParks = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      scope,
      has_rental,
      has_transfer,
      province,
      q 
    } = req.query;
    
    const offset = ((page as any) - 1) * (pageSize as any);
    const limit = pageSize as any;

    const whereConditions: string[] = [];
    const replacements: any = { limit, offset };

    if (scope) {
      whereConditions.push(`ip.scope = :scope`);
      replacements.scope = scope;
    }

    if (has_rental !== undefined) {
      whereConditions.push(`ip.has_rental = :has_rental`);
      replacements.has_rental = has_rental === 'true';
    }

    if (has_transfer !== undefined) {
      whereConditions.push(`ip.has_transfer = :has_transfer`);
      replacements.has_transfer = has_transfer === 'true';
    }

    if (province) {
      whereConditions.push(`ip.province ILIKE :province`);
      replacements.province = `%${province}%`;
    }

    if (q) {
      whereConditions.push(`(
        ip.name ILIKE :search OR 
        ip.code ILIKE :search OR 
        ip.description ILIKE :search OR
        ip.province ILIKE :search OR
        ip.ward ILIKE :search
      )`);
      replacements.search = `%${q}%`;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM industrial_parks ip
      ${whereClause}
    `;
    const countResult: any = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT
    });
    const total = parseInt(countResult[0].total);

    // Get industrial parks
    const query = `
      SELECT 
        ip.*
      FROM industrial_parks ip
      ${whereClause}
      ORDER BY ip.created_at DESC
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
  } catch (error) {
    console.error('Failed to fetch industrial parks:', error);
    res.status(500).json({ error: 'Failed to fetch industrial parks' });
  }
};

// Get industrial park by ID
export const getIndustrialParkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT *
      FROM industrial_parks
      WHERE id = :id
    `;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Industrial park not found' });
    }

    // Get images
    const imagesQuery = `
      SELECT *
      FROM industrial_park_images
      WHERE industrial_park_id = :id
      ORDER BY display_order ASC, created_at ASC
    `;
    const images: any = await sequelize.query(imagesQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    res.json({
      ...result[0],
      images
    });
  } catch (error) {
    console.error('Failed to fetch industrial park:', error);
    res.status(500).json({ error: 'Failed to fetch industrial park' });
  }
};

// Create new industrial park
export const createIndustrialPark = async (req: Request, res: Response) => {
  try {
    console.log('[createIndustrialPark] Request body:', JSON.stringify(req.body, null, 2));
    const {
      code,
      name,
      slug,
      scope,
      has_rental,
      has_transfer,
      province,
      ward,
      address,
      total_area,
      available_area,
      rental_price_min,
      rental_price_max,
      transfer_price_min,
      transfer_price_max,
      infrastructure,
      allowed_industries,
      description,
      description_full,
      thumbnail_url,
      video_url,
      meta_title,
      meta_description,
      published_at,
      images
    } = req.body;

    // Validate required fields
    if (!name || !code || !scope || !province || !total_area) {
      console.error('[createIndustrialPark] Validation failed: missing required fields');
      return res.status(400).json({ error: 'Name, code, scope, province, and total_area are required' });
    }

    if (!has_rental && !has_transfer) {
      return res.status(400).json({ error: 'At least one service (has_rental or has_transfer) must be true' });
    }

    const id = uuidv4();
    const generatedSlug = slug || generateSlugFromName(name);

    // Check if slug already exists
    const slugCheckQuery = `SELECT id FROM industrial_parks WHERE slug = :slug`;
    const slugCheck: any = await sequelize.query(slugCheckQuery, {
      replacements: { slug: generatedSlug },
      type: QueryTypes.SELECT
    });
    if (slugCheck.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    // Check if code already exists
    const codeCheckQuery = `SELECT id FROM industrial_parks WHERE code = :code`;
    const codeCheck: any = await sequelize.query(codeCheckQuery, {
      replacements: { code },
      type: QueryTypes.SELECT
    });
    if (codeCheck.length > 0) {
      return res.status(400).json({ error: 'Code already exists' });
    }

    // Handle allowed_industries: convert array to PostgreSQL array format
    // Format: ARRAY['value1', 'value2']::text[] or NULL
    console.log('[createIndustrialPark] allowed_industries received:', JSON.stringify(allowed_industries));
    let allowedIndustriesSql = 'NULL';
    if (allowed_industries && Array.isArray(allowed_industries) && allowed_industries.length > 0) {
      // Extract string values from array (handle both strings and objects)
      const filtered = allowed_industries
        .map((item: any) => {
          if (typeof item === 'string') {
            return item;
          }
          if (item && typeof item === 'object') {
            return item.industry_code || item.code || item.value || String(item);
          }
          return String(item);
        })
        .filter((item): item is string => typeof item === 'string' && item.length > 0);
      
      console.log('[createIndustrialPark] Filtered allowed_industries:', filtered);
      
      if (filtered.length > 0) {
        // Escape single quotes in array values (double them for SQL)
        const escaped = filtered.map(v => {
          const safe = String(v).replace(/'/g, "''");
          return `'${safe}'`;
        }).join(', ');
        allowedIndustriesSql = `ARRAY[${escaped}]::text[]`;
        console.log('[createIndustrialPark] Setting allowed_industries to:', `ARRAY[${escaped}]::text[]`);
      }
    }

    // Format infrastructure JSON
    const infrastructureJson = infrastructure ? JSON.stringify(infrastructure) : '{}';

    // Format published_at
    const publishedAtSql = published_at ? `'${published_at}'::timestamp with time zone` : 'NULL';

    const query = `
      INSERT INTO industrial_parks (
        id, code, name, slug, scope, has_rental, has_transfer,
        province, ward, address,
        total_area, available_area,
        rental_price_min, rental_price_max,
        transfer_price_min, transfer_price_max,
        infrastructure, allowed_industries,
        description, description_full, thumbnail_url, video_url,
        meta_title, meta_description, published_at
      )
      VALUES (
        :id::uuid, :code, :name, :slug, :scope, :has_rental, :has_transfer,
        :province, :ward, :address,
        :total_area, :available_area,
        :rental_price_min::bigint, :rental_price_max::bigint,
        :transfer_price_min::bigint, :transfer_price_max::bigint,
        :infrastructure::jsonb, ${allowedIndustriesSql},
        :description, :description_full, :thumbnail_url, :video_url,
        :meta_title, :meta_description, ${publishedAtSql}
      )
      RETURNING *
    `;

    // Prepare replacements object (excluding allowed_industries and published_at as they're in SQL directly)
    const replacements: any = {
      id,
      code,
      name,
      slug: generatedSlug,
      scope,
      has_rental: has_rental ?? false,
      has_transfer: has_transfer ?? false,
      province: province ? String(province) : null,
      ward: ward ? String(ward) : null,
      address: address ? String(address) : null,
      total_area: parseFloat(String(total_area)),
      available_area: available_area ? parseFloat(String(available_area)) : null,
      rental_price_min: rental_price_min ? (typeof rental_price_min === 'string' ? rental_price_min : String(rental_price_min)) : null,
      rental_price_max: rental_price_max ? (typeof rental_price_max === 'string' ? rental_price_max : String(rental_price_max)) : null,
      transfer_price_min: transfer_price_min ? (typeof transfer_price_min === 'string' ? transfer_price_min : String(transfer_price_min)) : null,
      transfer_price_max: transfer_price_max ? (typeof transfer_price_max === 'string' ? transfer_price_max : String(transfer_price_max)) : null,
      infrastructure: infrastructureJson,
      description: description || null,
      description_full: description_full || null,
      thumbnail_url: thumbnail_url || null,
      video_url: video_url || null,
      meta_title: meta_title || null,
      meta_description: meta_description || null
    };

    console.log('[createIndustrialPark] Query:', query);
    console.log('[createIndustrialPark] Replacements:', JSON.stringify(replacements, null, 2));

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.INSERT
    });

    const industrialPark = result[0][0];

    // Add images if provided
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imgQuery = `
          INSERT INTO industrial_park_images (id, industrial_park_id, url, caption, display_order, is_primary)
          VALUES (:img_id, :industrial_park_id, :url, :caption, :display_order, :is_primary)
        `;
        await sequelize.query(imgQuery, {
          replacements: {
            img_id: uuidv4(),
            industrial_park_id: id,
            url: typeof image === 'string' ? image : image.url,
            caption: typeof image === 'string' ? null : (image.caption || null),
            display_order: typeof image === 'string' ? i : (image.display_order ?? i),
            is_primary: typeof image === 'string' ? (i === 0) : (image.is_primary ?? (i === 0))
          },
          type: QueryTypes.INSERT
        });
      }
    }

    // Log activity
    await logActivity(req, 'create', 'industrial_park', id, name, `Created industrial park "${name}"`);

    res.status(201).json(industrialPark);
  } catch (error: any) {
    console.error('[createIndustrialPark] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to create industrial park', message: error.message });
  }
};

// Update industrial park
export const updateIndustrialPark = async (req: Request, res: Response) => {
  try {
    console.log('[updateIndustrialPark] Request body:', JSON.stringify(req.body, null, 2));
    const { id } = req.params;
    const {
      code,
      name,
      slug,
      scope,
      has_rental,
      has_transfer,
      province,
      ward,
      address,
      total_area,
      available_area,
      rental_price_min,
      rental_price_max,
      transfer_price_min,
      transfer_price_max,
      infrastructure,
      allowed_industries,
      description,
      description_full,
      thumbnail_url,
      video_url,
      meta_title,
      meta_description,
      published_at,
      images
    } = req.body;

    // Build dynamic update query
    const updateFields: string[] = [];
    const replacements: any = { id };

    if (code !== undefined) {
      // Check if code already exists (excluding current record)
      const codeCheckQuery = `SELECT id FROM industrial_parks WHERE code = :code AND id != :id`;
      const codeCheck: any = await sequelize.query(codeCheckQuery, {
        replacements: { code, id },
        type: QueryTypes.SELECT
      });
      if (codeCheck.length > 0) {
        return res.status(400).json({ error: 'Code already exists' });
      }
      updateFields.push('code = :code');
      replacements.code = code;
    }

    if (name !== undefined) {
      updateFields.push('name = :name');
      replacements.name = name;
    }

    if (slug !== undefined) {
      // Check if slug already exists (excluding current record)
      const slugCheckQuery = `SELECT id FROM industrial_parks WHERE slug = :slug AND id != :id`;
      const slugCheck: any = await sequelize.query(slugCheckQuery, {
        replacements: { slug, id },
        type: QueryTypes.SELECT
      });
      if (slugCheck.length > 0) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
      updateFields.push('slug = :slug');
      replacements.slug = slug;
    }

    if (scope !== undefined) {
      updateFields.push('scope = :scope');
      replacements.scope = scope;
    }

    if (has_rental !== undefined) {
      updateFields.push('has_rental = :has_rental');
      replacements.has_rental = has_rental;
    }

    if (has_transfer !== undefined) {
      updateFields.push('has_transfer = :has_transfer');
      replacements.has_transfer = has_transfer;
    }

    // Validate: at least one service must be true
    if (has_rental !== undefined || has_transfer !== undefined) {
      const checkQuery = `SELECT has_rental, has_transfer FROM industrial_parks WHERE id = :id`;
      const current: any = await sequelize.query(checkQuery, {
        replacements: { id },
        type: QueryTypes.SELECT
      });
      if (current.length > 0) {
        const finalHasRental = has_rental !== undefined ? has_rental : current[0].has_rental;
        const finalHasTransfer = has_transfer !== undefined ? has_transfer : current[0].has_transfer;
        if (!finalHasRental && !finalHasTransfer) {
          return res.status(400).json({ error: 'At least one service (has_rental or has_transfer) must be true' });
        }
      }
    }

    if (province !== undefined) {
      updateFields.push('province = :province');
      replacements.province = province ? String(province) : null;
    }

    if (ward !== undefined) {
      updateFields.push('ward = :ward');
      replacements.ward = ward ? String(ward) : null;
    }

    if (address !== undefined) {
      updateFields.push('address = :address');
      replacements.address = address ? String(address) : null;
    }

    if (total_area !== undefined) {
      updateFields.push('total_area = :total_area');
      replacements.total_area = parseFloat(total_area);
    }

    if (available_area !== undefined) {
      updateFields.push('available_area = :available_area');
      replacements.available_area = available_area ? parseFloat(available_area) : null;
    }

    if (rental_price_min !== undefined) {
      updateFields.push('rental_price_min = :rental_price_min::bigint');
      replacements.rental_price_min = rental_price_min ? (typeof rental_price_min === 'string' ? rental_price_min : String(rental_price_min)) : null;
    }

    if (rental_price_max !== undefined) {
      updateFields.push('rental_price_max = :rental_price_max::bigint');
      replacements.rental_price_max = rental_price_max ? (typeof rental_price_max === 'string' ? rental_price_max : String(rental_price_max)) : null;
    }

    if (transfer_price_min !== undefined) {
      updateFields.push('transfer_price_min = :transfer_price_min::bigint');
      replacements.transfer_price_min = transfer_price_min ? (typeof transfer_price_min === 'string' ? transfer_price_min : String(transfer_price_min)) : null;
    }

    if (transfer_price_max !== undefined) {
      updateFields.push('transfer_price_max = :transfer_price_max::bigint');
      replacements.transfer_price_max = transfer_price_max ? (typeof transfer_price_max === 'string' ? transfer_price_max : String(transfer_price_max)) : null;
    }

    if (infrastructure !== undefined) {
      updateFields.push('infrastructure = :infrastructure');
      replacements.infrastructure = infrastructure ? JSON.stringify(infrastructure) : JSON.stringify({});
    }

    if (allowed_industries !== undefined) {
      console.log('[updateIndustrialPark] allowed_industries received:', JSON.stringify(allowed_industries));
      console.log('[updateIndustrialPark] allowed_industries type:', typeof allowed_industries, Array.isArray(allowed_industries));
      
      // Handle allowed_industries: convert array to PostgreSQL array format (same as create)
      if (allowed_industries === null || (Array.isArray(allowed_industries) && allowed_industries.length === 0)) {
        // Set to NULL explicitly
        updateFields.push('allowed_industries = NULL');
        console.log('[updateIndustrialPark] Setting allowed_industries to NULL');
      } else if (Array.isArray(allowed_industries)) {
        // Extract string values from array (handle both strings and objects)
        const filtered = allowed_industries
          .map((item: any) => {
            if (typeof item === 'string') {
              return item.trim();
            }
            if (item && typeof item === 'object') {
              return (item.industry_code || item.code || item.value || String(item)).trim();
            }
            return String(item).trim();
          })
          .filter((item): item is string => typeof item === 'string' && item.length > 0);
        
        console.log('[updateIndustrialPark] Filtered allowed_industries:', filtered);
        console.log('[updateIndustrialPark] Filtered count:', filtered.length);
        
        if (filtered.length > 0) {
          // Escape single quotes in array values (double them for SQL)
          const escaped = filtered.map(v => {
            const safe = String(v).replace(/'/g, "''");
            return `'${safe}'`;
          }).join(', ');
          const sqlValue = `ARRAY[${escaped}]::text[]`;
          updateFields.push(`allowed_industries = ${sqlValue}`);
          console.log('[updateIndustrialPark] Setting allowed_industries to:', sqlValue);
        } else {
          // Array had items but all were filtered out - set to NULL
          updateFields.push('allowed_industries = NULL');
          console.log('[updateIndustrialPark] Setting allowed_industries to NULL (all items filtered out)');
        }
      } else {
        // Not an array, set to NULL
        updateFields.push('allowed_industries = NULL');
        console.log('[updateIndustrialPark] Setting allowed_industries to NULL (not an array)');
      }
    } else {
      console.log('[updateIndustrialPark] allowed_industries is undefined, skipping update');
    }

    if (description !== undefined) {
      updateFields.push('description = :description');
      replacements.description = description ? String(description) : null;
    }

    if (description_full !== undefined) {
      updateFields.push('description_full = :description_full');
      replacements.description_full = description_full ? String(description_full) : null;
    }

    if (thumbnail_url !== undefined) {
      updateFields.push('thumbnail_url = :thumbnail_url');
      replacements.thumbnail_url = thumbnail_url;
    }

    if (video_url !== undefined) {
      updateFields.push('video_url = :video_url');
      replacements.video_url = video_url ? String(video_url) : null;
    }

    if (meta_title !== undefined) {
      updateFields.push('meta_title = :meta_title');
      replacements.meta_title = meta_title ? String(meta_title) : null;
    }

    if (meta_description !== undefined) {
      updateFields.push('meta_description = :meta_description');
      replacements.meta_description = meta_description ? String(meta_description) : null;
    }

    if (published_at !== undefined) {
      updateFields.push('published_at = :published_at');
      replacements.published_at = published_at ? String(published_at) : null;
    }

    // Always update the updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    if (updateFields.length === 1) {
      // Only updated_at, nothing to update
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE industrial_parks
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    console.log('[updateIndustrialPark] Final SQL query:', query);
    console.log('[updateIndustrialPark] Replacements:', JSON.stringify(replacements, null, 2));
    console.log('[updateIndustrialPark] Update fields count:', updateFields.length);

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    console.log('[updateIndustrialPark] Query executed successfully');
    console.log('[updateIndustrialPark] Result:', JSON.stringify(result, null, 2));

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Industrial park not found' });
    }

    // Clean up old data in separate table if it exists (to avoid conflicts)
    // Only do this if allowed_industries was explicitly updated
    if (allowed_industries !== undefined) {
      try {
        await sequelize.query('DELETE FROM industrial_park_allowed_industries WHERE park_id = :id', {
          replacements: { id },
          type: QueryTypes.DELETE
        });
        console.log('[updateIndustrialPark] Cleaned up old data from industrial_park_allowed_industries table');
      } catch (err: any) {
        // Table might not exist, ignore error
        console.log('[updateIndustrialPark] Could not clean up separate table (might not exist):', err.message);
      }
    }

    // Update images if provided
    if (images !== undefined) {
      // Delete existing images
      await sequelize.query('DELETE FROM industrial_park_images WHERE industrial_park_id = :id', {
        replacements: { id },
        type: QueryTypes.DELETE
      });

      // Add new images
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const imgQuery = `
            INSERT INTO industrial_park_images (id, industrial_park_id, url, caption, display_order, is_primary)
            VALUES (:img_id, :industrial_park_id, :url, :caption, :display_order, :is_primary)
          `;
          await sequelize.query(imgQuery, {
            replacements: {
              img_id: uuidv4(),
              industrial_park_id: id,
              url: typeof image === 'string' ? image : image.url,
              caption: typeof image === 'string' ? null : (image.caption || null),
              display_order: typeof image === 'string' ? i : (image.display_order ?? i),
              is_primary: typeof image === 'string' ? (i === 0) : (image.is_primary ?? (i === 0))
            },
            type: QueryTypes.INSERT
          });
        }
      }
    }

    // Log activity
    await logActivity(req, 'update', 'industrial_park', id, result[0][0].name, `Updated industrial park "${result[0][0].name}"`);

    res.json(result[0][0]);
  } catch (error: any) {
    console.error('[updateIndustrialPark] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to update industrial park', message: error.message });
  }
};

// Delete industrial park
export const deleteIndustrialPark = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get industrial park name for logging
    const getQuery = `SELECT name FROM industrial_parks WHERE id = :id`;
    const getResult: any = await sequelize.query(getQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (getResult.length === 0) {
      return res.status(404).json({ error: 'Industrial park not found' });
    }

    const name = getResult[0].name;

    // Delete industrial park (cascade will delete images)
    const query = `DELETE FROM industrial_parks WHERE id = :id`;
    await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.DELETE
    });

    // Log activity
    await logActivity(req, 'delete', 'industrial_park', id, name, `Deleted industrial park "${name}"`);

    res.json({ success: true, message: 'Industrial park deleted successfully' });
  } catch (error: any) {
    console.error('[deleteIndustrialPark] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to delete industrial park', message: error.message });
  }
};

// Copy/Duplicate industrial park
export const copyIndustrialPark = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get original industrial park
    const getQuery = `SELECT * FROM industrial_parks WHERE id = :id`;
    const getResult: any = await sequelize.query(getQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (getResult.length === 0) {
      return res.status(404).json({ error: 'Industrial park not found' });
    }

    const original = getResult[0];

    // Generate new unique code
    let newCode = `${original.code}-COPY`;
    let codeCounter = 1;
    while (true) {
      const codeCheck: any = await sequelize.query(
        `SELECT id FROM industrial_parks WHERE code = :code`,
        { replacements: { code: newCode }, type: QueryTypes.SELECT }
      );
      if (codeCheck.length === 0) break;
      newCode = `${original.code}-COPY-${codeCounter}`;
      codeCounter++;
    }

    // Generate new unique slug
    let newSlug = `${original.slug}-copy`;
    let slugCounter = 1;
    while (true) {
      const slugCheck: any = await sequelize.query(
        `SELECT id FROM industrial_parks WHERE slug = :slug`,
        { replacements: { slug: newSlug }, type: QueryTypes.SELECT }
      );
      if (slugCheck.length === 0) break;
      newSlug = `${original.slug}-copy-${slugCounter}`;
      slugCounter++;
    }

    // Prepare new data (copy all fields except id, code, slug, published_at)
    const newId = uuidv4();
    const newName = `${original.name} (Copy)`;

    // Handle allowed_industries
    let allowedIndustriesSql = 'NULL';
    if (original.allowed_industries && Array.isArray(original.allowed_industries) && original.allowed_industries.length > 0) {
      const escaped = original.allowed_industries.map((v: string) => {
        const safe = String(v).replace(/'/g, "''");
        return `'${safe}'`;
      }).join(', ');
      allowedIndustriesSql = `ARRAY[${escaped}]::text[]`;
    }

    // Format infrastructure JSON
    const infrastructureJson = original.infrastructure ? JSON.stringify(original.infrastructure) : '{}';

    const insertQuery = `
      INSERT INTO industrial_parks (
        id, code, name, slug, scope, has_rental, has_transfer,
        province, ward, address, latitude, longitude, google_maps_link,
        total_area, available_area,
        rental_price_min, rental_price_max,
        transfer_price_min, transfer_price_max,
        infrastructure, allowed_industries,
        description, description_full, thumbnail_url, video_url,
        meta_title, meta_description, published_at
      )
      VALUES (
        :id::uuid, :code, :name, :slug, :scope, :has_rental, :has_transfer,
        :province, :ward, :address, :latitude, :longitude, :google_maps_link,
        :total_area, :available_area,
        :rental_price_min::bigint, :rental_price_max::bigint,
        :transfer_price_min::bigint, :transfer_price_max::bigint,
        :infrastructure::jsonb, ${allowedIndustriesSql},
        :description, :description_full, :thumbnail_url, :video_url,
        :meta_title, :meta_description, NULL
      )
      RETURNING *
    `;

    const replacements: any = {
      id: newId,
      code: newCode,
      name: newName,
      slug: newSlug,
      scope: original.scope,
      has_rental: original.has_rental ?? false,
      has_transfer: original.has_transfer ?? false,
      province: original.province,
      ward: original.ward,
      address: original.address,
      latitude: original.latitude,
      longitude: original.longitude,
      google_maps_link: original.google_maps_link,
      total_area: original.total_area,
      available_area: original.available_area,
      rental_price_min: original.rental_price_min,
      rental_price_max: original.rental_price_max,
      transfer_price_min: original.transfer_price_min,
      transfer_price_max: original.transfer_price_max,
      infrastructure: infrastructureJson,
      description: original.description,
      description_full: original.description_full,
      thumbnail_url: original.thumbnail_url,
      video_url: original.video_url,
      meta_title: original.meta_title,
      meta_description: original.meta_description
    };

    const result: any = await sequelize.query(insertQuery, {
      replacements,
      type: QueryTypes.INSERT
    });

    const copiedPark = result[0][0];

    // Copy images if any
    const imagesQuery = `SELECT * FROM industrial_park_images WHERE industrial_park_id = :original_id ORDER BY display_order`;
    const imagesResult: any = await sequelize.query(imagesQuery, {
      replacements: { original_id: id },
      type: QueryTypes.SELECT
    });

    if (imagesResult.length > 0) {
      for (let i = 0; i < imagesResult.length; i++) {
        const image = imagesResult[i];
        const imgQuery = `
          INSERT INTO industrial_park_images (id, industrial_park_id, url, caption, display_order, is_primary)
          VALUES (:img_id, :industrial_park_id, :url, :caption, :display_order, :is_primary)
        `;
        await sequelize.query(imgQuery, {
          replacements: {
            img_id: uuidv4(),
            industrial_park_id: newId,
            url: image.url,
            caption: image.caption,
            display_order: image.display_order,
            is_primary: i === 0 ? true : false // Only first image is primary
          },
          type: QueryTypes.INSERT
        });
      }
    }

    // Log activity
    await logActivity(req, 'create', 'industrial_park', newId, newName, `Copied industrial park from "${original.name}"`);

    res.json({
      success: true,
      data: copiedPark,
      message: 'Industrial park copied successfully'
    });
  } catch (error: any) {
    console.error('[copyIndustrialPark] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to copy industrial park', message: error.message });
  }
};

