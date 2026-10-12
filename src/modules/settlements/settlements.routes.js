const { Router } = require('express');
const SettlementsController = require('./settlements.controller');
const { authenticate } = require('../../middleware/authenticate');
const { validate } = require('../../middleware/validate');
const { recordSettlementSchema } = require('./settlements.schema');

const router = Router();

router.post('/groups/:groupId/settlements', authenticate, validate(recordSettlementSchema), SettlementsController.recordSettlement);
router.get('/groups/:groupId/settlements', authenticate, SettlementsController.getGroupSettlements);
router.post('/settlements/:settlementId/acknowledge', authenticate, SettlementsController.acknowledgeSettlement);

module.exports = router;
