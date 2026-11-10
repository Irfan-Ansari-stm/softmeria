import { Router } from 'express';
import multer from 'multer';
import { filesController } from './files.controller';
import { authenticate } from '../../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB per file
  }
});

const router = Router();
router.use(authenticate);

// Storage stats
router.get('/stats', (req, res, next) => filesController.getStorageStats(req, res, next));

// Folders
router.get('/folders', (req, res, next) => filesController.listFolders(req, res, next));
router.post('/folders', (req, res, next) => filesController.createFolder(req, res, next));
router.put('/folders/:id', (req, res, next) => filesController.updateFolder(req, res, next));
router.delete('/folders/:id', (req, res, next) => filesController.deleteFolder(req, res, next));

// Bulk operations
router.post('/bulk-delete', (req, res, next) => filesController.bulkDelete(req, res, next));
router.post('/bulk-move', (req, res, next) => filesController.bulkMove(req, res, next));

// Files
router.get('/', (req, res, next) => filesController.listFiles(req, res, next));
router.post('/upload', upload.array('files', 10), (req, res, next) => filesController.uploadFiles(req, res, next));
router.get('/:id', (req, res, next) => filesController.getFile(req, res, next));
router.get('/:id/download', (req, res, next) => filesController.downloadFile(req, res, next));
router.get('/:id/preview', (req, res, next) => filesController.previewFile(req, res, next));
router.patch('/:id/rename', (req, res, next) => filesController.renameFile(req, res, next));
router.put('/:id/rename', (req, res, next) => filesController.renameFile(req, res, next));
router.patch('/:id/move', (req, res, next) => filesController.moveFile(req, res, next));
router.put('/:id/move', (req, res, next) => filesController.moveFile(req, res, next));
router.post('/:id/copy', (req, res, next) => filesController.copyFile(req, res, next));
router.delete('/:id', (req, res, next) => filesController.deleteFile(req, res, next));
router.post('/:id/restore', (req, res, next) => filesController.restoreFile(req, res, next));

// Versioning
router.post('/:id/versions', upload.single('file'), (req, res, next) => filesController.createFileVersion(req, res, next));

// Attachments
router.post('/:id/attachments', (req, res, next) => filesController.attachFile(req, res, next));
router.delete('/attachments/:attachmentId', (req, res, next) => filesController.detachFile(req, res, next));

export const filesRoutes = router;
