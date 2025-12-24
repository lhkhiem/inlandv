// Real Estate controller
// Handles CRUD operations for real estate properties

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

// Get all properties with filters and pagination
export const getRealEstates = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      type,
      status,
      province,
      q 
    } = req.query;
    
    const offset = ((page as any) - 1) * (pageSize as any);
    const limit = pageSize as any;

    const whereConditions: string[] = [];
    const replacements: any = { limit, offset };

    if (type) {
      whereConditions.push(`p.type = :type`);
      replacements.type = type;
    }

    if (status) {
      whereConditions.push(`p.status = :status`);
      replacements.status = status;
    }

    if (province) {
      whereConditions.push(`p.province ILIKE :province`);
      replacements.province = `%${province}%`;
    }

    if (q) {
      whereConditions.push(`(
        p.name ILIKE :search OR 
        p.code ILIKE :search OR 
        p.description ILIKE :search OR
        p.province ILIKE :search OR
        p.ward ILIKE :search OR
        p.address ILIKE :search
      )`);
      replacements.search = `%${q}%`;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM properties p
      ${whereClause}
    `;
    const countResult: any = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT
    });
    const total = parseInt(countResult[0].total);

    // Get properties
    const query = `
      SELECT 
        p.*
      FROM properties p
      ${whereClause}
      ORDER BY p.created_at DESC
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
    console.error('[getRealEstates] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch real estates',
      message: error.message 
    });
  }
};

// Get property by ID
export const getRealEstateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    const query = `
      SELECT *
      FROM properties
      WHERE id = :id
    `;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Real estate not found' });
    }

    // Get images
    const imagesQuery = `
      SELECT *
      FROM property_images
      WHERE property_id = :id
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
  } catch (error: any) {
    console.error('[getRealEstateById] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch real estate', 
      message: error.message 
    });
  }
};

// Create new property
export const createRealEstate = async (req: Request, res: Response) => {
  try {
    console.log('[createRealEstate] Request body:', JSON.stringify(req.body, null, 2));
    const {
      code,
      name,
      slug,
      province,
      ward,
      address,
      type,
      category,
      status,
      legal_status,
      area,
      land_area,
      construction_area,
      width,
      length,
      bedrooms,
      bathrooms,
      floors,
      orientation,
      negotiable,
      furniture,
      description,
      description_full,
      thumbnail_url,
      video_url,
      contact_name,
      contact_phone,
      contact_email,
      meta_title,
      meta_description,
      meta_keywords,
      published_at,
      images,
      has_rental,
      has_transfer,
      sale_price,
      sale_price_min,
      sale_price_max,
      sale_price_per_sqm,
      rental_price,
      rental_price_min,
      rental_price_max,
      rental_price_per_sqm
    } = req.body;

    // Validate required fields
    if (!name || !code || !type || !province || !area) {
      console.error('[createRealEstate] Validation failed: missing required fields');
      return res.status(400).json({ error: 'Name, code, type, province, and area are required' });
    }

    // Validate: at least one service must be true
    if (!has_rental && !has_transfer) {
      return res.status(400).json({ error: 'At least one service (has_rental or has_transfer) must be true' });
    }

    // Validate: if has_rental, must have rental_price or rental_price_min
    if (has_rental && !rental_price && !rental_price_min) {
      return res.status(400).json({ error: 'If has_rental is true, rental_price or rental_price_min is required' });
    }

    // Validate: if has_transfer, must have sale_price or sale_price_min
    if (has_transfer && !sale_price && !sale_price_min) {
      return res.status(400).json({ error: 'If has_transfer is true, sale_price or sale_price_min is required' });
    }

    const id = uuidv4();
    const generatedSlug = slug || generateSlugFromName(name);

    // Check if slug already exists
    const slugCheckQuery = `SELECT id FROM properties WHERE slug = :slug`;
    const slugCheck: any = await sequelize.query(slugCheckQuery, {
      replacements: { slug: generatedSlug },
      type: QueryTypes.SELECT
    });
    if (slugCheck.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    // Check if code already exists
    const codeCheckQuery = `SELECT id FROM properties WHERE code = :code`;
    const codeCheck: any = await sequelize.query(codeCheckQuery, {
      replacements: { code },
      type: QueryTypes.SELECT
    });
    if (codeCheck.length > 0) {
      return res.status(400).json({ error: 'Code already exists' });
    }

    // Format published_at
    const publishedAtSql = published_at ? `'${published_at}'::timestamp with time zone` : 'NULL';

    const query = `
      INSERT INTO properties (
        id, code, name, slug,
        province, ward, address,
        type, category, status, legal_status,
        area, land_area, construction_area, width, length,
        bedrooms, bathrooms, floors, orientation,
        has_rental, has_transfer,
        sale_price, sale_price_min, sale_price_max, sale_price_per_sqm,
        rental_price, rental_price_min, rental_price_max, rental_price_per_sqm,
        negotiable,
        furniture, description, description_full,
        thumbnail_url, video_url,
        contact_name, contact_phone, contact_email,
        meta_title, meta_description, meta_keywords, published_at
      )
      VALUES (
        :id::uuid, :code, :name, :slug,
        :province, :ward, :address,
        :type, :category, :status, :legal_status,
        :area, :land_area, :construction_area, :width, :length,
        :bedrooms, :bathrooms, :floors, :orientation,
        :has_rental, :has_transfer,
        :sale_price::bigint, :sale_price_min::bigint, :sale_price_max::bigint, :sale_price_per_sqm::bigint,
        :rental_price::bigint, :rental_price_min::bigint, :rental_price_max::bigint, :rental_price_per_sqm::bigint,
        :negotiable,
        :furniture, :description, :description_full,
        :thumbnail_url, :video_url,
        :contact_name, :contact_phone, :contact_email,
        :meta_title, :meta_description, :meta_keywords, ${publishedAtSql}
      )
      RETURNING *
    `;

    const replacements: any = {
      id,
      code,
      name,
      slug: generatedSlug,
      province: province ? String(province) : null,
      ward: ward ? String(ward) : null,
      address: address ? String(address) : null,
      type,
      category: category || null,
      status: status || 'available',
      legal_status: legal_status || null,
      area: parseFloat(String(area)),
      land_area: land_area ? parseFloat(String(land_area)) : null,
      construction_area: construction_area ? parseFloat(String(construction_area)) : null,
      width: width ? parseFloat(String(width)) : null,
      length: length ? parseFloat(String(length)) : null,
      bedrooms: bedrooms ? parseInt(String(bedrooms)) : null,
      bathrooms: bathrooms ? parseInt(String(bathrooms)) : null,
      floors: floors ? parseInt(String(floors)) : null,
      orientation: orientation || null,
      has_rental: has_rental ?? false,
      has_transfer: has_transfer ?? false,
      sale_price: sale_price ? (typeof sale_price === 'string' ? sale_price : String(sale_price)) : null,
      sale_price_min: sale_price_min ? (typeof sale_price_min === 'string' ? sale_price_min : String(sale_price_min)) : null,
      sale_price_max: sale_price_max ? (typeof sale_price_max === 'string' ? sale_price_max : String(sale_price_max)) : null,
      sale_price_per_sqm: sale_price_per_sqm ? (typeof sale_price_per_sqm === 'string' ? sale_price_per_sqm : String(sale_price_per_sqm)) : null,
      rental_price: rental_price ? (typeof rental_price === 'string' ? rental_price : String(rental_price)) : null,
      rental_price_min: rental_price_min ? (typeof rental_price_min === 'string' ? rental_price_min : String(rental_price_min)) : null,
      rental_price_max: rental_price_max ? (typeof rental_price_max === 'string' ? rental_price_max : String(rental_price_max)) : null,
      rental_price_per_sqm: rental_price_per_sqm ? (typeof rental_price_per_sqm === 'string' ? rental_price_per_sqm : String(rental_price_per_sqm)) : null,
      negotiable: negotiable ?? false,
      furniture: furniture || null,
      description: description || null,
      description_full: description_full || null,
      thumbnail_url: thumbnail_url || null,
      video_url: video_url || null,
      contact_name: contact_name || null,
      contact_phone: contact_phone || null,
      contact_email: contact_email || null,
      meta_title: meta_title || null,
      meta_description: meta_description || null,
      meta_keywords: meta_keywords || null
    };

    console.log('[createRealEstate] Query:', query);
    console.log('[createRealEstate] Replacements:', JSON.stringify(replacements, null, 2));

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.INSERT
    });

    const property = result[0][0];

    // Add images if provided
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imgQuery = `
          INSERT INTO property_images (id, property_id, url, caption, display_order, is_primary)
          VALUES (:img_id, :property_id, :url, :caption, :display_order, :is_primary)
        `;
        await sequelize.query(imgQuery, {
          replacements: {
            img_id: uuidv4(),
            property_id: id,
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
    await logActivity(req, 'create', 'property', id, name, `Created real estate "${name}"`);

    res.status(201).json(property);
  } catch (error: any) {
    console.error('[createRealEstate] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to create real estate', message: error.message });
  }
};

// Update property
export const updateRealEstate = async (req: Request, res: Response) => {
  try {
    console.log('[updateRealEstate] Request body:', JSON.stringify(req.body, null, 2));
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid property ID' });
    }
    const {
      code,
      name,
      slug,
      province,
      ward,
      address,
      type,
      category,
      status,
      legal_status,
      area,
      land_area,
      construction_area,
      width,
      length,
      bedrooms,
      bathrooms,
      floors,
      orientation,
      negotiable,
      furniture,
      description,
      description_full,
      thumbnail_url,
      video_url,
      contact_name,
      contact_phone,
      contact_email,
      meta_title,
      meta_description,
      meta_keywords,
      published_at,
      images,
      has_rental,
      has_transfer,
      sale_price,
      sale_price_min,
      sale_price_max,
      sale_price_per_sqm,
      rental_price,
      rental_price_min,
      rental_price_max,
      rental_price_per_sqm
    } = req.body;

    // Build dynamic update query
    const updateFields: string[] = [];
    const replacements: any = { id };

    if (code !== undefined) {
      const codeCheckQuery = `SELECT id FROM properties WHERE code = :code AND id != :id`;
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
      const slugCheckQuery = `SELECT id FROM properties WHERE slug = :slug AND id != :id`;
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

    if (type !== undefined) {
      updateFields.push('type = :type');
      replacements.type = type;
    }

    if (category !== undefined) {
      updateFields.push('category = :category');
      replacements.category = category;
    }

    if (status !== undefined) {
      updateFields.push('status = :status');
      replacements.status = status;
    }

    if (legal_status !== undefined) {
      updateFields.push('legal_status = :legal_status');
      replacements.legal_status = legal_status;
    }

    if (area !== undefined) {
      updateFields.push('area = :area');
      replacements.area = parseFloat(String(area));
    }

    if (land_area !== undefined) {
      updateFields.push('land_area = :land_area');
      replacements.land_area = land_area ? parseFloat(String(land_area)) : null;
    }

    if (construction_area !== undefined) {
      updateFields.push('construction_area = :construction_area');
      replacements.construction_area = construction_area ? parseFloat(String(construction_area)) : null;
    }

    if (width !== undefined) {
      updateFields.push('width = :width');
      replacements.width = width ? parseFloat(String(width)) : null;
    }

    if (length !== undefined) {
      updateFields.push('length = :length');
      replacements.length = length ? parseFloat(String(length)) : null;
    }

    if (bedrooms !== undefined) {
      updateFields.push('bedrooms = :bedrooms');
      replacements.bedrooms = bedrooms ? parseInt(String(bedrooms)) : null;
    }

    if (bathrooms !== undefined) {
      updateFields.push('bathrooms = :bathrooms');
      replacements.bathrooms = bathrooms ? parseInt(String(bathrooms)) : null;
    }

    if (floors !== undefined) {
      updateFields.push('floors = :floors');
      replacements.floors = floors ? parseInt(String(floors)) : null;
    }

    if (orientation !== undefined) {
      updateFields.push('orientation = :orientation');
      replacements.orientation = orientation;
    }

    if (has_rental !== undefined) {
      updateFields.push('has_rental = :has_rental');
      replacements.has_rental = has_rental;
      
      // If has_rental is false, clear rental price fields
      if (!has_rental) {
        updateFields.push('rental_price = NULL');
        updateFields.push('rental_price_min = NULL');
        updateFields.push('rental_price_max = NULL');
        updateFields.push('rental_price_per_sqm = NULL');
      }
    }

    if (has_transfer !== undefined) {
      updateFields.push('has_transfer = :has_transfer');
      replacements.has_transfer = has_transfer;
      
      // If has_transfer is false, clear sale price fields
      if (!has_transfer) {
        updateFields.push('sale_price = NULL');
        updateFields.push('sale_price_min = NULL');
        updateFields.push('sale_price_max = NULL');
        updateFields.push('sale_price_per_sqm = NULL');
      }
    }

    // Validate: at least one service must be true
    if (has_rental !== undefined || has_transfer !== undefined) {
      const checkQuery = `SELECT has_rental, has_transfer FROM properties WHERE id = :id`;
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

    if (sale_price !== undefined) {
      updateFields.push('sale_price = :sale_price');
      replacements.sale_price = sale_price ? (typeof sale_price === 'string' ? sale_price : String(sale_price)) : null;
    }

    if (sale_price_min !== undefined) {
      updateFields.push('sale_price_min = :sale_price_min');
      replacements.sale_price_min = sale_price_min ? (typeof sale_price_min === 'string' ? sale_price_min : String(sale_price_min)) : null;
    }

    if (sale_price_max !== undefined) {
      updateFields.push('sale_price_max = :sale_price_max');
      replacements.sale_price_max = sale_price_max ? (typeof sale_price_max === 'string' ? sale_price_max : String(sale_price_max)) : null;
    }

    if (sale_price_per_sqm !== undefined) {
      updateFields.push('sale_price_per_sqm = :sale_price_per_sqm');
      replacements.sale_price_per_sqm = sale_price_per_sqm ? (typeof sale_price_per_sqm === 'string' ? sale_price_per_sqm : String(sale_price_per_sqm)) : null;
    }

    if (rental_price !== undefined) {
      updateFields.push('rental_price = :rental_price');
      replacements.rental_price = rental_price ? (typeof rental_price === 'string' ? rental_price : String(rental_price)) : null;
    }

    if (rental_price_min !== undefined) {
      updateFields.push('rental_price_min = :rental_price_min');
      replacements.rental_price_min = rental_price_min ? (typeof rental_price_min === 'string' ? rental_price_min : String(rental_price_min)) : null;
    }

    if (rental_price_max !== undefined) {
      updateFields.push('rental_price_max = :rental_price_max');
      replacements.rental_price_max = rental_price_max ? (typeof rental_price_max === 'string' ? rental_price_max : String(rental_price_max)) : null;
    }

    if (rental_price_per_sqm !== undefined) {
      updateFields.push('rental_price_per_sqm = :rental_price_per_sqm');
      replacements.rental_price_per_sqm = rental_price_per_sqm ? (typeof rental_price_per_sqm === 'string' ? rental_price_per_sqm : String(rental_price_per_sqm)) : null;
    }

    if (negotiable !== undefined) {
      updateFields.push('negotiable = :negotiable');
      replacements.negotiable = negotiable;
    }

    if (furniture !== undefined) {
      updateFields.push('furniture = :furniture');
      replacements.furniture = furniture;
    }

    if (description !== undefined) {
      updateFields.push('description = :description');
      replacements.description = description;
    }

    if (description_full !== undefined) {
      updateFields.push('description_full = :description_full');
      replacements.description_full = description_full;
    }

    if (thumbnail_url !== undefined) {
      updateFields.push('thumbnail_url = :thumbnail_url');
      replacements.thumbnail_url = thumbnail_url;
    }

    if (video_url !== undefined) {
      updateFields.push('video_url = :video_url');
      replacements.video_url = video_url;
    }

    if (contact_name !== undefined) {
      updateFields.push('contact_name = :contact_name');
      replacements.contact_name = contact_name;
    }

    if (contact_phone !== undefined) {
      updateFields.push('contact_phone = :contact_phone');
      replacements.contact_phone = contact_phone;
    }

    if (contact_email !== undefined) {
      updateFields.push('contact_email = :contact_email');
      replacements.contact_email = contact_email;
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

    if (published_at !== undefined) {
      if (published_at && published_at.trim() !== '') {
        updateFields.push('published_at = :published_at::timestamp with time zone');
        replacements.published_at = published_at;
      } else {
        updateFields.push('published_at = NULL');
      }
    }

    // Always update the updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    if (updateFields.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE properties
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    console.log('[updateRealEstate] Update query:', query);
    console.log('[updateRealEstate] Replacements:', JSON.stringify(replacements, null, 2));

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Real estate not found' });
    }

    // Update images if provided
    if (images !== undefined) {
      await sequelize.query('DELETE FROM property_images WHERE property_id = :id', {
        replacements: { id },
        type: QueryTypes.DELETE
      });

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const imgQuery = `
            INSERT INTO property_images (id, property_id, url, caption, display_order, is_primary)
            VALUES (:img_id, :property_id, :url, :caption, :display_order, :is_primary)
          `;
          await sequelize.query(imgQuery, {
            replacements: {
              img_id: uuidv4(),
              property_id: id,
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
    await logActivity(req, 'update', 'property', id, result[0][0].name, `Updated real estate "${result[0][0].name}"`);

    res.json(result[0][0]);
  } catch (error: any) {
    console.error('[updateRealEstate] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to update real estate', message: error.message });
  }
};

// Delete property
export const deleteRealEstate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    const getQuery = `SELECT name FROM properties WHERE id = :id`;
    const getResult: any = await sequelize.query(getQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (getResult.length === 0) {
      return res.status(404).json({ error: 'Real estate not found' });
    }

    const name = getResult[0].name;

    const query = `DELETE FROM properties WHERE id = :id`;
    await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.DELETE
    });

    await logActivity(req, 'delete', 'property', id, name, `Deleted real estate "${name}"`);

    res.json({ success: true, message: 'Real estate deleted successfully' });
  } catch (error: any) {
    console.error('[deleteRealEstate] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to delete real estate', message: error.message });
  }
};

// Copy/Duplicate property
export const copyProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get original property
    const getQuery = `SELECT * FROM properties WHERE id = :id`;
    const getResult: any = await sequelize.query(getQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (getResult.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const original = getResult[0];

    // Generate new unique code
    let newCode = `${original.code}-COPY`;
    let codeCounter = 1;
    while (true) {
      const codeCheck: any = await sequelize.query(
        `SELECT id FROM properties WHERE code = :code`,
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
        `SELECT id FROM properties WHERE slug = :slug`,
        { replacements: { slug: newSlug }, type: QueryTypes.SELECT }
      );
      if (slugCheck.length === 0) break;
      newSlug = `${original.slug}-copy-${slugCounter}`;
      slugCounter++;
    }

    // Prepare new data (copy all fields except id, code, slug, published_at, status)
    const newId = uuidv4();
    const newName = `${original.name} (Copy)`;

    // Build INSERT query with all fields from properties table (using actual schema from migration 047)
    const insertQuery = `
      INSERT INTO properties (
        id, code, name, slug,
        province, ward, address, latitude, longitude,
        type, category, status, legal_status,
        area, land_area, construction_area, width, length,
        bedrooms, bathrooms, floors, orientation,
        has_rental, has_transfer,
        sale_price, sale_price_min, sale_price_max, sale_price_per_sqm,
        rental_price, rental_price_min, rental_price_max, rental_price_per_sqm,
        negotiable,
        furniture, description, description_full,
        thumbnail_url, video_url,
        contact_name, contact_phone, contact_email,
        meta_title, meta_description, meta_keywords,
        published_at
      )
      VALUES (
        :id::uuid, :code, :name, :slug,
        :province, :ward, :address, :latitude, :longitude,
        :type, :category, 'available', :legal_status,
        :area, :land_area, :construction_area, :width, :length,
        :bedrooms, :bathrooms, :floors, :orientation,
        :has_rental, :has_transfer,
        :sale_price::bigint, :sale_price_min::bigint, :sale_price_max::bigint, :sale_price_per_sqm::bigint,
        :rental_price::bigint, :rental_price_min::bigint, :rental_price_max::bigint, :rental_price_per_sqm::bigint,
        :negotiable,
        :furniture, :description, :description_full,
        :thumbnail_url, :video_url,
        :contact_name, :contact_phone, :contact_email,
        :meta_title, :meta_description, :meta_keywords,
        NULL
      )
      RETURNING *
    `;

    const replacements: any = {
      id: newId,
      code: newCode,
      name: newName,
      slug: newSlug,
      province: original.province,
      ward: original.ward || null,
      address: original.address || null,
      latitude: original.latitude || null,
      longitude: original.longitude || null,
      type: original.type,
      category: original.category || null,
      legal_status: original.legal_status || null,
      area: original.area,
      land_area: original.land_area || null,
      construction_area: original.construction_area || null,
      width: original.width || null,
      length: original.length || null,
      bedrooms: original.bedrooms || null,
      bathrooms: original.bathrooms || null,
      floors: original.floors || null,
      orientation: original.orientation || null,
      has_rental: original.has_rental ?? false,
      has_transfer: original.has_transfer ?? false,
      sale_price: original.sale_price || null,
      sale_price_min: original.sale_price_min || null,
      sale_price_max: original.sale_price_max || null,
      sale_price_per_sqm: original.sale_price_per_sqm || null,
      rental_price: original.rental_price || null,
      rental_price_min: original.rental_price_min || null,
      rental_price_max: original.rental_price_max || null,
      rental_price_per_sqm: original.rental_price_per_sqm || null,
      negotiable: original.negotiable ?? false,
      furniture: original.furniture || null,
      description: original.description || null,
      description_full: original.description_full || null,
      thumbnail_url: original.thumbnail_url || null,
      video_url: original.video_url || null,
      contact_name: original.contact_name || null,
      contact_phone: original.contact_phone || null,
      contact_email: original.contact_email || null,
      meta_title: original.meta_title || null,
      meta_description: original.meta_description || null,
      meta_keywords: original.meta_keywords || null
    };

    const result: any = await sequelize.query(insertQuery, {
      replacements,
      type: QueryTypes.INSERT
    });

    const copiedProperty = result[0][0];

    // Copy images if any
    const imagesQuery = `SELECT * FROM property_images WHERE property_id = :original_id ORDER BY display_order`;
    const imagesResult: any = await sequelize.query(imagesQuery, {
      replacements: { original_id: id },
      type: QueryTypes.SELECT
    });

    if (imagesResult.length > 0) {
      for (let i = 0; i < imagesResult.length; i++) {
        const image = imagesResult[i];
        const imgQuery = `
          INSERT INTO property_images (id, property_id, url, caption, display_order, is_primary)
          VALUES (:img_id, :property_id, :url, :caption, :display_order, :is_primary)
        `;
        await sequelize.query(imgQuery, {
          replacements: {
            img_id: uuidv4(),
            property_id: newId,
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
    await logActivity(req, 'create', 'property', newId, newName, `Copied property from "${original.name}"`);

    res.json({
      success: true,
      data: copiedProperty,
      message: 'Property copied successfully'
    });
  } catch (error: any) {
    console.error('[copyProperty] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to copy property', message: error.message });
  }
};


