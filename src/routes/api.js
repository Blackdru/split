const { Router } = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const groupsRoutes = require('../modules/groups/groups.routes');
const expensesRoutes = require('../modules/expenses/expenses.routes');
const settlementsRoutes = require('../modules/settlements/settlements.routes');
const StorageService = require('../services/storage');
const { authenticate } = require('../middleware/authenticate');

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'India-First Expense Sharing API'
  });
});

// Mounted modules
router.use('/auth', authRoutes);
router.use('/groups', groupsRoutes);
router.use('/', expensesRoutes);
router.use('/', settlementsRoutes);

// Storage signed URL route (Authenticated)
router.post('/storage/signed-upload-url', authenticate, async (req, res, next) => {
  try {
    const { storageKey } = req.body;
    if (!storageKey) {
      return res.status(400).json({ success: false, error: 'storageKey is required' });
    }
    const data = await StorageService.createSignedUploadUrl(storageKey);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/storage/signed-download-url', authenticate, async (req, res, next) => {
  try {
    const { storageKey } = req.body;
    if (!storageKey) {
      return res.status(400).json({ success: false, error: 'storageKey is required' });
    }
    const signedUrl = await StorageService.getSignedDownloadUrl(storageKey);
    res.json({ success: true, data: { signedUrl } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
