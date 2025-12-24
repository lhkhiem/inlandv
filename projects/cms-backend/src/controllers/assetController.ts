import { Request, Response } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import AssetFolder from '../models/AssetFolder';
import Asset from '../models/Asset';
import { processImage, deleteImageFiles, getFileSize, ensureUploadDir } from '../utils/media';
import { Op } from 'sequelize';

// Storage configuration - use shared-storage for both CMS and public site
const STORAGE_BASE = process.env.STORAGE_PATH || path.join(process.cwd(), '..', 'shared-storage');
const UPLOADS_DIR = path.join(STORAGE_BASE, 'uploads');
const TEMP_DIR = path.join(STORAGE_BASE, 'temp');

const MAX_UPLOAD_FILE_SIZE_MB = 100;
const MAX_UPLOAD_FILE_SIZE = MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024;
const folderIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const allowedUrlExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

const normalizeFolderId = (input: any): string | null => {
  if (!input || typeof input !== 'string') {
    return null;
  }
  const trimmed = input.trim();
  return folderIdRegex.test(trimmed) ? trimmed : null;
};

const sanitizeFileName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_');
};

const buildAssetResponse = (
  asset: Asset,
  processed: { thumb: string; medium: string; large: string; original: string },
  fileId: string,
  originalName: string,
  fileSize: number
) => {
  const json = asset.toJSON() as any;
  return {
    ...json,
    file_name: originalName,
    file_size: fileSize,
    thumb_url: `/uploads/${fileId}/${processed.thumb}`,
    medium_url: `/uploads/${fileId}/${processed.medium}`,
    large_url: `/uploads/${fileId}/${processed.large}`,
  };
};

const cleanupTempFile = (filePath: string) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('[assets] Temp file deleted:', filePath);
    }
  } catch (cleanupError) {
    console.error('[assets] Failed to delete temp file:', cleanupError);
  }
};

const processTempUpload = async (
  tempFilePath: string,
  originalName: string,
  folderInput: any
) => {
  const uploadDate = new Date().toISOString().split('T')[0];
  const uniqueId = uuidv4();
  const relativeFileId = path.join(uploadDate, uniqueId);
  const specificDir = path.join(UPLOADS_DIR, uploadDate, uniqueId);

  let processed;
  try {
    processed = await processImage(tempFilePath, specificDir, originalName);
  } finally {
    cleanupTempFile(tempFilePath);
  }

  const processedOriginalPath = path.join(specificDir, processed.original);
  const processedFileSize = getFileSize(processedOriginalPath);
  const validFolderId = normalizeFolderId(folderInput);

  const asset = await Asset.create({
    id: uuidv4(),
    type: 'image',
    provider: 'local',
    url: `/uploads/${relativeFileId}/${processed.original}`,
    cdn_url: null,
    width: processed.width,
    height: processed.height,
    format: 'webp',
    sizes: processed.sizes,
    folder_id: validFolderId,
  });

  return buildAssetResponse(asset, processed, relativeFileId, originalName, processedFileSize);
};

const downloadStreamToFile = async (
  stream: Readable,
  destination: string
): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    let finished = false;
    let downloaded = 0;
    const writer = fs.createWriteStream(destination);

    const closeWithError = (error: Error) => {
      if (finished) return;
      finished = true;
      try {
        stream.destroy(error);
      } catch {
        // ignore secondary destroy errors
      }
      writer.destroy(error);
      reject(error);
    };

    stream.on('data', (chunk: Buffer) => {
      downloaded += chunk.length;
      if (downloaded > MAX_UPLOAD_FILE_SIZE) {
        closeWithError(new Error('REMOTE_FILE_TOO_LARGE'));
      }
    });

    stream.on('error', (error) => closeWithError(error));
    writer.on('error', (error) => closeWithError(error));
    writer.on('finish', () => {
      if (finished) return;
      finished = true;
      resolve();
    });

    stream.pipe(writer);
  });
};

// ============================================
// Asset Folders
// ============================================

// GET /api/assets/folders - list all folders with hierarchy
export const getAssetFolders = async (_req: Request, res: Response) => {
  try {
    console.log('[getAssetFolders] Fetching all folders...');
    const folders = await AssetFolder.findAll({
      order: [['parent_id', 'ASC'], ['name', 'ASC']],
    });
    console.log('[getAssetFolders] Found', folders.length, 'folders');

    // Add file count for each folder
    const foldersWithCount = await Promise.all(
      folders.map(async (folder: any) => {
        const count = await Asset.count({
          where: { folder_id: folder.id }
        });
        return {
          ...folder.toJSON(),
          file_count: count
        };
      })
    );

    console.log('[getAssetFolders] Returning folders with counts');
    res.json({ folders: foldersWithCount });
  } catch (error: any) {
    console.error('[getAssetFolders] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/assets/folders - create new folder
export const createAssetFolder = async (req: Request, res: Response) => {
  try {
    const { name, parent_id } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    const folder = await AssetFolder.create({ name: name.trim(), parent_id: parent_id || null });
    res.status(201).json({ folder });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/assets/folders/:id - rename folder
export const updateAssetFolder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const folder = await AssetFolder.findByPk(id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    await folder.update({ name: name.trim() });
    res.json({ folder });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/assets/folders/:id - delete folder (cascade children)
export const deleteAssetFolder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const folder = await AssetFolder.findByPk(id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    await folder.destroy();
    res.json({ message: 'Folder deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// Assets
// ============================================

// POST /api/assets/upload - upload media file
export const uploadAsset = async (req: Request, res: Response) => {
  console.log('[uploadAsset] Starting upload...');
  console.log('[uploadAsset] Request file:', req.file ? {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  } : 'No file');
  
  try {
    if (!req.file) {
      console.log('[uploadAsset] No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    console.log(
      '[uploadAsset] Processing file:',
      file.originalname,
      `(${(file.size / 1024 / 1024).toFixed(2)}MB)`
    );

    if (!fs.existsSync(file.path)) {
      console.error('[uploadAsset] Temp file does not exist:', file.path);
      return res.status(400).json({ error: 'File upload failed. Temp file not found.' });
    }

    const responsePayload = await processTempUpload(file.path, file.originalname, req.body.folder_id);
    res.status(201).json(responsePayload);
  } catch (error: any) {
    console.error('[uploadAsset] Error:', error);
    console.error('[uploadAsset] Error stack:', error.stack);
    
    // Clean up temp file on error
    try {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log('[uploadAsset] Cleaned up temp file on error');
      }
    } catch (cleanupError) {
      console.error('[uploadAsset] Error cleaning up temp file:', cleanupError);
    }
    
    // Provide more specific error messages
    let errorMessage = error.message || 'Upload failed';
    let statusCode = 500;
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      errorMessage = `File quá lớn. Giới hạn tối đa là ${MAX_UPLOAD_FILE_SIZE_MB}MB.`;
      statusCode = 413;
    } else if (error.message?.includes('Only image files')) {
      errorMessage = 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)';
      statusCode = 400;
    } else if (error.message?.includes('ENOENT') || error.message?.includes('no such file')) {
      errorMessage = 'Lỗi xử lý file. Vui lòng thử lại.';
      statusCode = 500;
    } else if (error.message?.includes('sharp')) {
      errorMessage = 'Lỗi xử lý ảnh. File có thể bị hỏng hoặc không đúng định dạng.';
      statusCode = 400;
    }
    
    res.status(statusCode).json({ error: errorMessage });
  }
};

export const uploadAssetFromUrl = async (req: Request, res: Response) => {
  console.log('[uploadAssetFromUrl] Starting upload by URL');
  const { url, folder_id } = req.body || {};

  if (!url || typeof url !== 'string' || url.trim() === '') {
    return res.status(400).json({ error: 'URL ảnh là bắt buộc.' });
  }

  const trimmedUrl = url.trim();
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return res.status(400).json({ error: 'URL không hợp lệ.' });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: 'URL phải sử dụng giao thức http hoặc https.' });
  }

  const decodedPath = decodeURIComponent(parsedUrl.pathname || '');
  const lastSegment = decodedPath.split('/').filter(Boolean).pop() || 'remote-image';
  const rawExt = path.extname(lastSegment).toLowerCase();
  const extension = allowedUrlExtensions.includes(rawExt) ? rawExt : '.jpg';
  const baseName = sanitizeFileName(rawExt ? lastSegment.replace(rawExt, '') : lastSegment) || 'remote-image';
  const originalName = `${baseName}${extension}`;

  ensureUploadDir(TEMP_DIR);
  const tempFilePath = path.join(TEMP_DIR, `remote-${Date.now()}-${uuidv4()}${extension}`);

  try {
    const response = await axios.get(trimmedUrl, {
      responseType: 'stream',
      timeout: 60000,
      headers: { Accept: 'image/*' },
      maxContentLength: Infinity,
    });

    const contentType = response.headers['content-type'] || '';
    const stream = response.data as unknown as Readable;
    if (contentType && !contentType.startsWith('image/')) {
      stream.destroy();
      return res.status(400).json({ error: 'URL phải trỏ đến file ảnh hợp lệ.' });
    }

    const contentLength = Number(response.headers['content-length'] || 0);
    if (!Number.isNaN(contentLength) && contentLength > MAX_UPLOAD_FILE_SIZE) {
      stream.destroy();
      return res.status(413).json({
        error: `File quá lớn. Giới hạn tối đa là ${MAX_UPLOAD_FILE_SIZE_MB}MB.`,
      });
    }

    await downloadStreamToFile(stream, tempFilePath);
    const responsePayload = await processTempUpload(tempFilePath, originalName, folder_id);
    res.status(201).json(responsePayload);
  } catch (error: any) {
    cleanupTempFile(tempFilePath);
    console.error('[uploadAssetFromUrl] Error:', error);

    let statusCode = 500;
    let errorMessage = 'Không thể tải ảnh từ URL. Vui lòng thử lại.';

    if (error?.message === 'REMOTE_FILE_TOO_LARGE') {
      statusCode = 413;
      errorMessage = `File quá lớn. Giới hạn tối đa là ${MAX_UPLOAD_FILE_SIZE_MB}MB.`;
    } else if (axios.isAxiosError(error)) {
      const remoteStatus = error.response?.status;
      if (remoteStatus === 404) {
        statusCode = 404;
        errorMessage = 'Không tìm thấy file tại URL đã cung cấp.';
      } else if (remoteStatus === 401 || remoteStatus === 403) {
        statusCode = 400;
        errorMessage = 'Link yêu cầu đăng nhập hoặc không công khai. Hãy dùng URL ảnh trực tiếp (.jpg, .png, .webp) có thể truy cập công khai.';
      } else {
        statusCode = 400;
        errorMessage = `Tải ảnh thất bại (HTTP ${remoteStatus ?? 'không xác định'}). Vui lòng kiểm tra lại URL.`;
      }
    } else if (error?.code === 'ECONNABORTED') {
      statusCode = 504;
      errorMessage = 'Tải ảnh quá thời gian. Vui lòng thử lại.';
    }

    res.status(statusCode).json({ error: errorMessage });
  }
};

// GET /api/assets/:id - get asset by ID
export const getAssetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findByPk(id);
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const assetData = asset.toJSON() as any;
    const urlParts = assetData.url.split('/');
    const directory = urlParts.slice(0, -1).join('/');
    const fileName = urlParts[urlParts.length - 1];
    
    const filePath = path.join(UPLOADS_DIR, ...urlParts.slice(1));
    const fileSize = getFileSize(filePath);
    
    let thumbUrl: string | null = null;
    let mediumUrl: string | null = null;
    let largeUrl: string | null = null;
    
    if (assetData.sizes) {
      if (assetData.sizes.thumb?.url) {
        thumbUrl = assetData.sizes.thumb.url;
      } else if (typeof assetData.sizes.thumb === 'string') {
        thumbUrl = `${directory}/${assetData.sizes.thumb}`;
      }
      
      if (assetData.sizes.medium?.url) {
        mediumUrl = assetData.sizes.medium.url;
      } else if (typeof assetData.sizes.medium === 'string') {
        mediumUrl = `${directory}/${assetData.sizes.medium}`;
      }
      
      if (assetData.sizes.large?.url) {
        largeUrl = assetData.sizes.large.url;
      } else if (typeof assetData.sizes.large === 'string') {
        largeUrl = `${directory}/${assetData.sizes.large}`;
      }
    }
    
    res.json({
      ...assetData,
      file_name: fileName.replace('original_', ''),
      file_size: fileSize,
      thumb_url: thumbUrl || assetData.url,
      medium_url: mediumUrl || assetData.url,
      large_url: largeUrl || assetData.url,
      original_url: assetData.url,
    });
  } catch (error: any) {
    console.error('[getAssetById] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/assets - list all media with pagination and filters
export const getAssets = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      search, 
      type,
      folder_id 
    } = req.query;

    const offset = ((page as any) - 1) * (pageSize as any);
    const where: any = {};

    // Filter by search
    if (search) {
      where.url = { [Op.iLike]: `%${search}%` };
    }

    // Filter by type
    if (type) {
      where.type = type;
    }

    // Filter by folder - validate UUID
    console.log('[getAssets] folder_id param:', folder_id);
    if (folder_id && folder_id !== '' && folder_id !== 'null' && folder_id !== 'undefined') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(folder_id as string)) {
        where.folder_id = folder_id;
        console.log('[getAssets] Filtering by folder_id:', folder_id);
      } else {
        console.log('[getAssets] Invalid folder_id format:', folder_id);
      }
    } else if (folder_id === null || folder_id === 'null') {
      // Show only root level files (no folder)
      where.folder_id = null;
      console.log('[getAssets] Filtering for root-level files only');
    } else {
      console.log('[getAssets] No folder filter, showing all files');
    }

    const { count, rows } = await Asset.findAndCountAll({
      where,
      offset,
      limit: pageSize as any,
      order: [['created_at', 'DESC']],
    });

    // Add helper URLs for each asset
    const assetsWithUrls = rows.map((asset: any) => {
      const assetData = asset.toJSON();
      // URL format: /uploads/YYYY-MM-DD/uuid/filename.ext
      // Extract the directory part (everything except the filename)
      const urlParts = assetData.url.split('/');
      const directory = urlParts.slice(0, -1).join('/'); // /uploads/YYYY-MM-DD/uuid
      const fileName = urlParts[urlParts.length - 1]; // original_filename.ext
      
      // Try to get file size
      const filePath = path.join(UPLOADS_DIR, ...urlParts.slice(1)); // Remove leading '/' from url
      const fileSize = getFileSize(filePath);
      
      // Extract thumbnail URL from sizes object
      // sizes can be: { thumb: { url: '/path/to/thumb.webp' } } or { thumb: 'thumb.webp' }
      let thumbUrl: string | null = null;
      let mediumUrl: string | null = null;
      let largeUrl: string | null = null;
      
      if (assetData.sizes) {
        // If sizes.thumb is an object with url property
        if (assetData.sizes.thumb?.url) {
          thumbUrl = assetData.sizes.thumb.url;
        } 
        // If sizes.thumb is a string (filename)
        else if (typeof assetData.sizes.thumb === 'string') {
          thumbUrl = `${directory}/${assetData.sizes.thumb}`;
        }
        
        if (assetData.sizes.medium?.url) {
          mediumUrl = assetData.sizes.medium.url;
        } else if (typeof assetData.sizes.medium === 'string') {
          mediumUrl = `${directory}/${assetData.sizes.medium}`;
        }
        
        if (assetData.sizes.large?.url) {
          largeUrl = assetData.sizes.large.url;
        } else if (typeof assetData.sizes.large === 'string') {
          largeUrl = `${directory}/${assetData.sizes.large}`;
        }
      }
      
      return {
        ...assetData,
        file_name: fileName.replace('original_', ''),
        file_size: fileSize,
        thumb_url: thumbUrl || assetData.url,
        medium_url: mediumUrl || assetData.url,
        large_url: largeUrl || assetData.url,
        original_url: assetData.url,
      };
    });

    res.json({
      data: assetsWithUrls,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / (pageSize as any)),
    });
  } catch (error: any) {
    console.error('[getAssets] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/assets/:id - update asset (move to folder)
export const updateAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { folder_id } = req.body;

    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Update folder_id (null for root)
    await asset.update({ 
      folder_id: folder_id === undefined ? (asset as any).folder_id : (folder_id || null)
    });

    res.json({ asset });
  } catch (error: any) {
    console.error('[updateAsset] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/assets/:id/rename - rename asset file
export const renameAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    if (!newName || newName.trim() === '') {
      return res.status(400).json({ error: 'New name is required' });
    }

    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const assetData = asset.toJSON() as any;
    
    // Extract current file information
    const urlParts = assetData.url.split('/');
    const directory = urlParts.slice(0, -1).join('/'); // /uploads/YYYY-MM-DD/uuid
    const oldFileName = urlParts[urlParts.length - 1]; // original_oldname.ext
    const fileExt = path.extname(oldFileName);
    
    // Clean new name and create new filenames
    const cleanNewName = newName.trim().replace(/\s+/g, '_');
    const baseName = path.basename(cleanNewName, fileExt);
    
    // Physical directory path
    const physicalDir = path.join(UPLOADS_DIR, ...urlParts.slice(1, -1));
    
    // Rename all file versions
    const sizes = typeof assetData.sizes === 'string' 
      ? JSON.parse(assetData.sizes) 
      : assetData.sizes;
    
    const newSizes: any = {};
    
    try {
      // Rename thumb
      if (sizes.thumb) {
        const oldThumbPath = path.join(physicalDir, sizes.thumb);
        const newThumbName = `${baseName}_thumb.webp`;
        const newThumbPath = path.join(physicalDir, newThumbName);
        if (fs.existsSync(oldThumbPath)) {
          fs.renameSync(oldThumbPath, newThumbPath);
          newSizes.thumb = newThumbName;
        }
      }
      
      // Rename medium
      if (sizes.medium) {
        const oldMediumPath = path.join(physicalDir, sizes.medium);
        const newMediumName = `${baseName}_medium.webp`;
        const newMediumPath = path.join(physicalDir, newMediumName);
        if (fs.existsSync(oldMediumPath)) {
          fs.renameSync(oldMediumPath, newMediumPath);
          newSizes.medium = newMediumName;
        }
      }
      
      // Rename large
      if (sizes.large) {
        const oldLargePath = path.join(physicalDir, sizes.large);
        const newLargeName = `${baseName}_large.webp`;
        const newLargePath = path.join(physicalDir, newLargeName);
        if (fs.existsSync(oldLargePath)) {
          fs.renameSync(oldLargePath, newLargePath);
          newSizes.large = newLargeName;
        }
      }
      
      // Rename original
      if (sizes.original) {
        const oldOriginalPath = path.join(physicalDir, sizes.original);
        const newOriginalName = `original_${baseName}${fileExt}`;
        const newOriginalPath = path.join(physicalDir, newOriginalName);
        if (fs.existsSync(oldOriginalPath)) {
          fs.renameSync(oldOriginalPath, newOriginalPath);
          newSizes.original = newOriginalName;
        }
      }
      
      // Update database
      const newUrl = `${directory}/${newSizes.original || newSizes.original}`;
      await asset.update({
        url: newUrl,
        sizes: newSizes
      });
      
      console.log(`[renameAsset] Renamed file from ${oldFileName} to ${newSizes.original}`);
      res.json({ 
        message: 'File renamed successfully',
        asset: {
          ...assetData,
          url: newUrl,
          sizes: newSizes
        }
      });
      
    } catch (renameError) {
      console.error('[renameAsset] Error renaming files:', renameError);
      // Attempt to rollback any partial renames would go here
      throw new Error('Failed to rename file on disk');
    }
    
  } catch (error: any) {
    console.error('[renameAsset] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/assets/:id - delete asset file
export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findByPk(id);

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Delete physical files
    const assetData = asset.toJSON() as any;
    if (assetData.sizes && assetData.url) {
      try {
        // Extract directory from URL: /uploads/YYYY-MM-DD/uuid/filename.ext
        const urlParts = assetData.url.split('/');
        // Remove empty first element and 'uploads', take date and uuid
        const pathParts = urlParts.filter((p: string) => p).slice(1); // Remove 'uploads'
        const uploadDir = path.join(UPLOADS_DIR, ...pathParts.slice(0, -1));
        
        // Parse sizes if it's a string (JSONB)
        const sizes = typeof assetData.sizes === 'string' 
          ? JSON.parse(assetData.sizes) 
          : assetData.sizes;
        
        deleteImageFiles(uploadDir, sizes);
      } catch (fileError) {
        console.error('[deleteAsset] Error deleting physical files:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await asset.destroy();

    res.json({ message: 'Asset deleted successfully' });
  } catch (error: any) {
    console.error('[deleteAsset] Error:', error);
    res.status(500).json({ error: error.message });
  }
};
