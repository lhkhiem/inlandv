import { Router, Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth';
import { 
  getAssetFolders, 
  createAssetFolder,
  updateAssetFolder,
  deleteAssetFolder,
  uploadAsset,
  uploadAssetFromUrl,
  getAssets,
  getAssetById,
  updateAsset,
  renameAsset,
  deleteAsset
} from '../controllers/assetController';

const router = Router();

// Storage configuration - use shared-storage for both CMS and public site
const STORAGE_BASE = process.env.STORAGE_PATH || path.join(process.cwd(), '..', 'shared-storage');
const TEMP_DIR = path.join(STORAGE_BASE, 'temp');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    // Ensure temp directory exists
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
    cb(null, TEMP_DIR);
  },
  filename: function (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max (will be compressed to webp)
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Error handler for multer
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err) {
    console.error('[handleMulterError] Multer error:', err);
    console.error('[handleMulterError] Error code:', err.code);
    console.error('[handleMulterError] Error message:', err.message);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      console.log('[handleMulterError] File size limit exceeded');
      return res.status(413).json({ 
        error: 'File quá lớn. Giới hạn tối đa là 100MB. File sẽ được nén sau khi upload.' 
      });
    }
    if (err.message?.includes('Only image files')) {
      console.log('[handleMulterError] Invalid file type');
      return res.status(400).json({ 
        error: 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)' 
      });
    }
    console.log('[handleMulterError] Generic multer error');
    return res.status(400).json({ error: err.message || 'Upload failed' });
  }
  next();
};

// Folder routes (must come before /:id routes to avoid conflicts)
router.get('/folders', authMiddleware, getAssetFolders);
router.post('/folders', authMiddleware, createAssetFolder);
router.put('/folders/:id', authMiddleware, updateAssetFolder);
router.patch('/folders/:id', authMiddleware, updateAssetFolder);
router.delete('/folders/:id', authMiddleware, deleteAssetFolder);

// Asset routes
// Note: specific routes must come before /:id to avoid route conflicts
router.post('/upload', authMiddleware, upload.single('file'), handleMulterError, uploadAsset);
router.post('/upload/by-url', authMiddleware, uploadAssetFromUrl);
router.get('/:id', authMiddleware, getAssetById);
router.put('/:id', authMiddleware, updateAsset);
router.patch('/:id', authMiddleware, updateAsset);
router.post('/:id/rename', authMiddleware, renameAsset);
router.delete('/:id', authMiddleware, deleteAsset);
router.get('/', authMiddleware, getAssets);
router.post('/folders', authMiddleware, createAssetFolder);
router.put('/folders/:id', authMiddleware, updateAssetFolder);
router.patch('/folders/:id', authMiddleware, updateAssetFolder);
router.delete('/folders/:id', authMiddleware, deleteAssetFolder);

export default router;
