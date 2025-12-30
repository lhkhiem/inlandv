// Product controller
// Handles CRUD operations for products (khu công nghiệp using products table)

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

// Get all products with filters and pagination
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      has_rental,
      has_transfer,
      province,
      q,
      product_types,
      transaction_types,
      location_types
    } = req.query;
    
    const offset = ((page as any) - 1) * (pageSize as any);
    const limit = pageSize as any;

    const whereConditions: string[] = [];
    const replacements: any = { limit, offset };

    if (has_rental !== undefined) {
      whereConditions.push(`p.has_rental = :has_rental`);
      replacements.has_rental = has_rental === 'true';
    }

    if (has_transfer !== undefined) {
      whereConditions.push(`p.has_transfer = :has_transfer`);
      replacements.has_transfer = has_transfer === 'true';
    }

    if (province) {
      whereConditions.push(`p.province ILIKE :province`);
      replacements.province = `%${province}%`;
    }

    // Product types filter (using array contains)
    if (product_types) {
      const productTypesArray = Array.isArray(product_types) ? product_types : [product_types];
      if (productTypesArray.length > 0) {
        whereConditions.push(`p.product_types && :product_types`);
        replacements.product_types = productTypesArray;
      }
    }

    // Transaction types filter (using array contains)
    if (transaction_types) {
      const transactionTypesArray = Array.isArray(transaction_types) ? transaction_types : [transaction_types];
      if (transactionTypesArray.length > 0) {
        whereConditions.push(`p.transaction_types && :transaction_types`);
        replacements.transaction_types = transactionTypesArray;
      }
    }

    // Location types filter (using array contains)
    if (location_types) {
      const locationTypesArray = Array.isArray(location_types) ? location_types : [location_types];
      if (locationTypesArray.length > 0) {
        whereConditions.push(`p.location_types && :location_types`);
        replacements.location_types = locationTypesArray;
      }
    }

    if (q) {
      whereConditions.push(`(
        p.name ILIKE :search OR 
        p.code ILIKE :search OR 
        p.description ILIKE :search OR
        p.province ILIKE :search OR
        p.ward ILIKE :search
      )`);
      replacements.search = `%${q}%`;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      ${whereClause}
    `;
    const countResult: any = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT
    });
    const total = parseInt(countResult[0].total);

    // Get products
    const query = `
      SELECT *
      FROM products p
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT :limit OFFSET :offset
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    // Ensure location_types is always an array for each product
    const products = result.map((product: any) => {
      if (!Array.isArray(product.location_types)) {
        product.location_types = product.location_types ? [product.location_types] : [];
      }
      return product;
    });

    res.json({
      data: products,
      total,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
      totalPages: Math.ceil(total / (pageSize as any))
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT *
      FROM products
      WHERE id = :id
    `;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = result[0];

    // Parse JSONB fields if they're strings
    if (typeof product.images === 'string') {
      try {
        product.images = JSON.parse(product.images);
      } catch (e) {
        product.images = [];
      }
    }
    if (typeof product.documents === 'string') {
      try {
        product.documents = JSON.parse(product.documents);
      } catch (e) {
        product.documents = [];
      }
    }
    if (typeof product.tenants === 'string') {
      try {
        product.tenants = JSON.parse(product.tenants);
      } catch (e) {
        product.tenants = [];
      }
    }
    if (typeof product.infrastructure === 'string') {
      try {
        product.infrastructure = JSON.parse(product.infrastructure);
      } catch (e) {
        product.infrastructure = {};
      }
    }

    // Ensure location_types is always an array
    if (!Array.isArray(product.location_types)) {
      product.location_types = product.location_types ? [product.location_types] : [];
    }

    res.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Create new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    console.log('[createProduct] Request body:', JSON.stringify(req.body, null, 2));
    const {
      code,
      name,
      slug,
      has_rental,
      has_transfer,
      has_factory,
      province,
      ward,
      address,
      latitude,
      longitude,
      google_maps_link,
      total_area,
      available_area,
      occupancy_rate,
      rental_price_min,
      rental_price_max,
      transfer_price_min,
      transfer_price_max,
      land_price,
      infrastructure,
      allowed_industries,
      description,
      description_full,
      advantages,
      thumbnail_url,
      video_url,
      contact_name,
      contact_phone,
      contact_email,
      website_url,
      meta_title,
      meta_description,
      meta_keywords,
      published_at,
      images,
      documents,
      tenants,
      product_types,
      transaction_types,
      location_types
    } = req.body;

    // Validate required fields
    if (!name || !code || !province || !total_area) {
      console.error('[createProduct] Validation failed: missing required fields');
      return res.status(400).json({ error: 'Name, code, province, and total_area are required' });
    }

    if (!has_rental && !has_transfer) {
      return res.status(400).json({ error: 'At least one service (has_rental or has_transfer) must be true' });
    }

    const id = uuidv4();
    const generatedSlug = slug || generateSlugFromName(name);

    // Check if slug already exists
    const slugCheckQuery = `SELECT id FROM products WHERE slug = :slug`;
    const slugCheck: any = await sequelize.query(slugCheckQuery, {
      replacements: { slug: generatedSlug },
      type: QueryTypes.SELECT
    });
    if (slugCheck.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    // Check if code already exists
    const codeCheckQuery = `SELECT id FROM products WHERE code = :code`;
    const codeCheck: any = await sequelize.query(codeCheckQuery, {
      replacements: { code },
      type: QueryTypes.SELECT
    });
    if (codeCheck.length > 0) {
      return res.status(400).json({ error: 'Code already exists' });
    }

    // Format arrays - no need to escape when using parameterized queries
    const productTypesArray = product_types && Array.isArray(product_types) && product_types.length > 0
      ? product_types.map(item => String(item).trim()).filter(item => item.length > 0)
      : [];
    const transactionTypesArray = transaction_types && Array.isArray(transaction_types) && transaction_types.length > 0
      ? transaction_types.map(item => String(item).trim()).filter(item => item.length > 0)
      : [];
    // location_types: always process if provided (even if empty array)
    const locationTypesArray = location_types !== undefined && Array.isArray(location_types)
      ? location_types.map(item => String(item).trim()).filter(item => item.length > 0)
      : [];
    const allowedIndustriesArray = allowed_industries && Array.isArray(allowed_industries) && allowed_industries.length > 0
      ? allowed_industries.map(item => String(item).trim()).filter(item => item.length > 0)
      : [];

    // Debug logging for location_types
    console.log('[createProduct] location_types input:', location_types);
    console.log('[createProduct] location_types type:', typeof location_types, Array.isArray(location_types));
    console.log('[createProduct] locationTypesArray:', locationTypesArray);

    // Format JSONB fields
    const infrastructureJson = infrastructure ? JSON.stringify(infrastructure) : '{}';
    const imagesJson = images && Array.isArray(images) && images.length > 0
      ? JSON.stringify(images)
      : '[]';
    const documentsJson = documents && Array.isArray(documents) && documents.length > 0
      ? JSON.stringify(documents)
      : '[]';
    const tenantsJson = tenants && Array.isArray(tenants) && tenants.length > 0
      ? JSON.stringify(tenants)
      : '[]';

    // Format published_at
    const publishedAtSql = published_at ? `'${published_at}'::timestamp with time zone` : 'NULL';

    const query = `
      INSERT INTO products (
        id, code, name, slug, has_rental, has_transfer, has_factory,
        province, ward, address, latitude, longitude, google_maps_link,
        total_area, available_area, occupancy_rate,
        rental_price_min, rental_price_max,
        transfer_price_min, transfer_price_max, land_price,
        infrastructure, allowed_industries,
        product_types, transaction_types, location_types,
        description, description_full, advantages,
        thumbnail_url, video_url,
        contact_name, contact_phone, contact_email, website_url,
        meta_title, meta_description, meta_keywords,
        images, documents, tenants,
        published_at
      )
      VALUES (
        :id::uuid, :code, :name, :slug, :has_rental, :has_transfer, :has_factory,
        :province, :ward, :address, :latitude, :longitude, :google_maps_link,
        :total_area, :available_area, :occupancy_rate,
        :rental_price_min::bigint, :rental_price_max::bigint,
        :transfer_price_min::bigint, :transfer_price_max::bigint, :land_price::bigint,
        :infrastructure::jsonb, 
        ${allowedIndustriesArray.length > 0 ? `ARRAY[${allowedIndustriesArray.map((_, i) => `:allowed_industries_${i}`).join(', ')}]::text[]` : `ARRAY[]::text[]`},
        ${productTypesArray.length > 0 ? `ARRAY[${productTypesArray.map((_, i) => `:product_types_${i}`).join(', ')}]::text[]` : `ARRAY[]::text[]`},
        ${transactionTypesArray.length > 0 ? `ARRAY[${transactionTypesArray.map((_, i) => `:transaction_types_${i}`).join(', ')}]::text[]` : `ARRAY[]::text[]`},
        ${locationTypesArray.length > 0 ? `ARRAY[${locationTypesArray.map((_, i) => `:location_types_${i}`).join(', ')}]::text[]` : `ARRAY[]::text[]`},
        :description, :description_full, :advantages,
        :thumbnail_url, :video_url,
        :contact_name, :contact_phone, :contact_email, :website_url,
        :meta_title, :meta_description, :meta_keywords,
        :images::jsonb, :documents::jsonb, :tenants::jsonb,
        ${publishedAtSql}
      )
      RETURNING *
    `;

    const replacements: any = {
      id,
      code,
      name,
      slug: generatedSlug,
      has_rental: has_rental ?? false,
      has_transfer: has_transfer ?? false,
      has_factory: has_factory ?? false,
      province: province ? String(province) : null,
      ward: ward ? String(ward) : null,
      address: address ? String(address) : null,
      latitude: latitude ? parseFloat(String(latitude)) : null,
      longitude: longitude ? parseFloat(String(longitude)) : null,
      google_maps_link: google_maps_link || null,
      total_area: parseFloat(String(total_area)),
      available_area: available_area ? parseFloat(String(available_area)) : null,
      occupancy_rate: occupancy_rate ? parseFloat(String(occupancy_rate)) : null,
      rental_price_min: rental_price_min ? (typeof rental_price_min === 'string' ? rental_price_min : String(rental_price_min)) : null,
      rental_price_max: rental_price_max ? (typeof rental_price_max === 'string' ? rental_price_max : String(rental_price_max)) : null,
      transfer_price_min: transfer_price_min ? (typeof transfer_price_min === 'string' ? transfer_price_min : String(transfer_price_min)) : null,
      transfer_price_max: transfer_price_max ? (typeof transfer_price_max === 'string' ? transfer_price_max : String(transfer_price_max)) : null,
      land_price: land_price ? (typeof land_price === 'string' ? land_price : String(land_price)) : null,
      infrastructure: infrastructureJson,
      description: description || null,
      description_full: description_full || null,
      advantages: advantages || null,
      thumbnail_url: thumbnail_url || null,
      video_url: video_url || null,
      contact_name: contact_name || null,
      contact_phone: contact_phone || null,
      contact_email: contact_email || null,
      website_url: website_url || null,
      meta_title: meta_title || null,
      meta_description: meta_description || null,
      meta_keywords: meta_keywords || null,
      images: imagesJson,
      documents: documentsJson,
      tenants: tenantsJson
    };

    // Add array replacements individually for proper escaping
    allowedIndustriesArray.forEach((item, i) => {
      replacements[`allowed_industries_${i}`] = String(item);
    });
    productTypesArray.forEach((item, i) => {
      replacements[`product_types_${i}`] = String(item);
    });
    transactionTypesArray.forEach((item, i) => {
      replacements[`transaction_types_${i}`] = String(item);
    });
    locationTypesArray.forEach((item, i) => {
      replacements[`location_types_${i}`] = String(item);
    });

    console.log('[createProduct] Query:', query);
    console.log('[createProduct] Replacements:', JSON.stringify(replacements, null, 2));

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.INSERT
    });

    const product = result[0][0];

    // Log activity
    await logActivity(req, 'create', 'product', id, name, `Created product "${name}"`);

    res.status(201).json(product);
  } catch (error: any) {
    console.error('[createProduct] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to create product', message: error.message });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    console.log('[updateProduct] Request body:', JSON.stringify(req.body, null, 2));
    const { id } = req.params;
    const {
      code,
      name,
      slug,
      has_rental,
      has_transfer,
      has_factory,
      province,
      ward,
      address,
      latitude,
      longitude,
      google_maps_link,
      total_area,
      available_area,
      occupancy_rate,
      rental_price_min,
      rental_price_max,
      transfer_price_min,
      transfer_price_max,
      land_price,
      infrastructure,
      allowed_industries,
      description,
      description_full,
      advantages,
      thumbnail_url,
      video_url,
      contact_name,
      contact_phone,
      contact_email,
      website_url,
      meta_title,
      meta_description,
      meta_keywords,
      published_at,
      images,
      documents,
      tenants,
      product_types,
      transaction_types,
      location_types
    } = req.body;

    // Build dynamic update query
    const updateFields: string[] = [];
    const replacements: any = { id };

    if (code !== undefined) {
      // Check if code already exists (excluding current record)
      const codeCheckQuery = `SELECT id FROM products WHERE code = :code AND id != :id`;
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
      const slugCheckQuery = `SELECT id FROM products WHERE slug = :slug AND id != :id`;
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

    if (has_rental !== undefined) {
      updateFields.push('has_rental = :has_rental');
      replacements.has_rental = has_rental;
    }

    if (has_transfer !== undefined) {
      updateFields.push('has_transfer = :has_transfer');
      replacements.has_transfer = has_transfer;
    }

    if (has_factory !== undefined) {
      updateFields.push('has_factory = :has_factory');
      replacements.has_factory = has_factory;
    }

    // Validate: at least one service must be true
    if (has_rental !== undefined || has_transfer !== undefined) {
      const checkQuery = `SELECT has_rental, has_transfer FROM products WHERE id = :id`;
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

    if (latitude !== undefined) {
      updateFields.push('latitude = :latitude');
      replacements.latitude = latitude ? parseFloat(String(latitude)) : null;
    }

    if (longitude !== undefined) {
      updateFields.push('longitude = :longitude');
      replacements.longitude = longitude ? parseFloat(String(longitude)) : null;
    }

    if (google_maps_link !== undefined) {
      updateFields.push('google_maps_link = :google_maps_link');
      replacements.google_maps_link = google_maps_link || null;
    }

    if (total_area !== undefined) {
      const parsedTotalArea = parseFloat(String(total_area));
      if (isNaN(parsedTotalArea)) {
        return res.status(400).json({ error: 'total_area must be a valid number' });
      }
      updateFields.push('total_area = :total_area');
      replacements.total_area = parsedTotalArea;
    }

    if (available_area !== undefined) {
      if (available_area === null || available_area === '') {
        updateFields.push('available_area = :available_area');
        replacements.available_area = null;
      } else {
        const parsedAvailableArea = parseFloat(String(available_area));
        if (isNaN(parsedAvailableArea)) {
          return res.status(400).json({ error: 'available_area must be a valid number' });
        }
        updateFields.push('available_area = :available_area');
        replacements.available_area = parsedAvailableArea;
      }
    }

    if (occupancy_rate !== undefined) {
      if (occupancy_rate === null || occupancy_rate === '') {
        updateFields.push('occupancy_rate = :occupancy_rate');
        replacements.occupancy_rate = null;
      } else {
        const parsedOccupancyRate = parseFloat(String(occupancy_rate));
        if (isNaN(parsedOccupancyRate)) {
          return res.status(400).json({ error: 'occupancy_rate must be a valid number' });
        }
        updateFields.push('occupancy_rate = :occupancy_rate');
        replacements.occupancy_rate = parsedOccupancyRate;
      }
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

    if (land_price !== undefined) {
      updateFields.push('land_price = :land_price::bigint');
      replacements.land_price = land_price ? (typeof land_price === 'string' ? land_price : String(land_price)) : null;
    }

    if (infrastructure !== undefined) {
      updateFields.push('infrastructure = :infrastructure::jsonb');
      replacements.infrastructure = infrastructure ? JSON.stringify(infrastructure) : JSON.stringify({});
    }

    if (allowed_industries !== undefined) {
      const allowedIndustriesArray = Array.isArray(allowed_industries) && allowed_industries.length > 0
        ? allowed_industries
        : [];
      if (allowedIndustriesArray.length > 0) {
        updateFields.push(`allowed_industries = ARRAY[${allowedIndustriesArray.map((_, i) => `:allowed_industries_${i}`).join(', ')}]::text[]`);
        allowedIndustriesArray.forEach((item, i) => {
          replacements[`allowed_industries_${i}`] = String(item);
        });
      } else {
        updateFields.push('allowed_industries = ARRAY[]::text[]');
      }
    }

    if (product_types !== undefined) {
      const productTypesArray = Array.isArray(product_types) && product_types.length > 0
        ? product_types
        : [];
      if (productTypesArray.length > 0) {
        updateFields.push(`product_types = ARRAY[${productTypesArray.map((_, i) => `:product_types_${i}`).join(', ')}]::text[]`);
        productTypesArray.forEach((item, i) => {
          replacements[`product_types_${i}`] = String(item);
        });
      } else {
        updateFields.push('product_types = ARRAY[]::text[]');
      }
    }

    if (transaction_types !== undefined) {
      const transactionTypesArray = Array.isArray(transaction_types) && transaction_types.length > 0
        ? transaction_types
        : [];
      if (transactionTypesArray.length > 0) {
        updateFields.push(`transaction_types = ARRAY[${transactionTypesArray.map((_, i) => `:transaction_types_${i}`).join(', ')}]::text[]`);
        transactionTypesArray.forEach((item, i) => {
          replacements[`transaction_types_${i}`] = String(item);
        });
      } else {
        updateFields.push('transaction_types = ARRAY[]::text[]');
      }
    }

    if (location_types !== undefined) {
      // Always process location_types if provided (even if empty array)
      const locationTypesArray = Array.isArray(location_types)
        ? location_types.map(item => String(item).trim()).filter(item => item.length > 0)
        : [];
      
      // Debug logging
      console.log('[updateProduct] location_types input:', location_types);
      console.log('[updateProduct] location_types type:', typeof location_types, Array.isArray(location_types));
      console.log('[updateProduct] locationTypesArray:', locationTypesArray);
      
      if (locationTypesArray.length > 0) {
        updateFields.push(`location_types = ARRAY[${locationTypesArray.map((_, i) => `:location_types_${i}`).join(', ')}]::text[]`);
        locationTypesArray.forEach((item, i) => {
          replacements[`location_types_${i}`] = String(item);
        });
      } else {
        // Set to empty array if location_types was provided but is empty
        updateFields.push('location_types = ARRAY[]::text[]');
      }
    }

    if (description !== undefined) {
      updateFields.push('description = :description');
      replacements.description = description ? String(description) : null;
    }

    if (description_full !== undefined) {
      updateFields.push('description_full = :description_full');
      replacements.description_full = description_full ? String(description_full) : null;
    }

    if (advantages !== undefined) {
      updateFields.push('advantages = :advantages');
      replacements.advantages = advantages ? String(advantages) : null;
    }

    // Always update thumbnail_url if provided (even if null/empty)
    if (thumbnail_url !== undefined) {
      console.log('[updateProduct] thumbnail_url:', thumbnail_url);
      updateFields.push('thumbnail_url = :thumbnail_url');
      replacements.thumbnail_url = thumbnail_url && thumbnail_url.trim() ? thumbnail_url.trim() : null;
    }

    if (video_url !== undefined) {
      updateFields.push('video_url = :video_url');
      replacements.video_url = video_url ? String(video_url) : null;
    }

    if (contact_name !== undefined) {
      updateFields.push('contact_name = :contact_name');
      replacements.contact_name = contact_name || null;
    }

    if (contact_phone !== undefined) {
      updateFields.push('contact_phone = :contact_phone');
      replacements.contact_phone = contact_phone || null;
    }

    if (contact_email !== undefined) {
      updateFields.push('contact_email = :contact_email');
      replacements.contact_email = contact_email || null;
    }

    if (website_url !== undefined) {
      updateFields.push('website_url = :website_url');
      replacements.website_url = website_url || null;
    }

    if (meta_title !== undefined) {
      updateFields.push('meta_title = :meta_title');
      replacements.meta_title = meta_title ? String(meta_title) : null;
    }

    if (meta_description !== undefined) {
      updateFields.push('meta_description = :meta_description');
      replacements.meta_description = meta_description ? String(meta_description) : null;
    }

    if (meta_keywords !== undefined) {
      updateFields.push('meta_keywords = :meta_keywords');
      replacements.meta_keywords = meta_keywords ? String(meta_keywords) : null;
    }

    if (published_at !== undefined) {
      updateFields.push('published_at = :published_at');
      replacements.published_at = published_at ? String(published_at) : null;
    }

    if (occupancy_rate !== undefined) {
      if (occupancy_rate === null || occupancy_rate === '') {
        updateFields.push('occupancy_rate = :occupancy_rate');
        replacements.occupancy_rate = null;
      } else {
        const parsedOccupancyRate = parseFloat(String(occupancy_rate));
        if (isNaN(parsedOccupancyRate)) {
          return res.status(400).json({ error: 'occupancy_rate must be a valid number' });
        }
        updateFields.push('occupancy_rate = :occupancy_rate');
        replacements.occupancy_rate = parsedOccupancyRate;
      }
    }

    // Always update images if provided (even if empty array)
    if (images !== undefined) {
      console.log('[updateProduct] images input:', images);
      console.log('[updateProduct] images type:', typeof images, 'isArray:', Array.isArray(images));
      const imagesArray = Array.isArray(images) ? images : [];
      const imagesJson = imagesArray.length > 0
        ? JSON.stringify(imagesArray)
        : '[]';
      console.log('[updateProduct] images JSON:', imagesJson);
      updateFields.push('images = :images::jsonb');
      replacements.images = imagesJson;
    }

    if (documents !== undefined) {
      const documentsJson = Array.isArray(documents) && documents.length > 0
        ? JSON.stringify(documents)
        : '[]';
      updateFields.push('documents = :documents::jsonb');
      replacements.documents = documentsJson;
    }

    if (tenants !== undefined) {
      const tenantsJson = Array.isArray(tenants) && tenants.length > 0
        ? JSON.stringify(tenants)
        : '[]';
      updateFields.push('tenants = :tenants::jsonb');
      replacements.tenants = tenantsJson;
    }

    // Always update the updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    if (updateFields.length === 1) {
      // Only updated_at, nothing to update
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE products
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    console.log('[updateProduct] Final SQL query:', query);
    console.log('[updateProduct] Replacements:', JSON.stringify(replacements, null, 2));

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Log activity
    await logActivity(req, 'update', 'product', id, result[0][0].name, `Updated product "${result[0][0].name}"`);

    res.json(result[0][0]);
  } catch (error: any) {
    console.error('[updateProduct] Error:', error.message, error.stack);
    console.error('[updateProduct] Error details:', JSON.stringify(error, null, 2));
    const errorMessage = error.message || 'Unknown error';
    const errorDetails = error.detail || error.hint || '';
    res.status(500).json({ 
      error: 'Failed to update product', 
      message: errorMessage,
      details: errorDetails,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get product name for logging
    const getQuery = `SELECT name FROM products WHERE id = :id`;
    const getResult: any = await sequelize.query(getQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (getResult.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const name = getResult[0].name;

    // Delete product
    const query = `DELETE FROM products WHERE id = :id`;
    await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.DELETE
    });

    // Log activity
    await logActivity(req, 'delete', 'product', id, name, `Deleted product "${name}"`);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('[deleteProduct] Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to delete product', message: error.message });
  }
};

