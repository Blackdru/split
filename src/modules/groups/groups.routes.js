const { Router } = require('express');
const GroupsController = require('./groups.controller');
const { authenticate } = require('../../middleware/authenticate');
const { validate } = require('../../middleware/validate');
const { createGroupSchema, createInviteSchema } = require('./groups.schema');

const router = Router();

router.use(authenticate);

router.post('/', validate(createGroupSchema), GroupsController.createGroup);
router.get('/', GroupsController.getUserGroups);
router.get('/:groupId', GroupsController.getGroupDetails);
router.post('/:groupId/invitations', validate(createInviteSchema), GroupsController.createInvitation);
router.post('/invitations/:token/accept', GroupsController.acceptInvitation);

module.exports = router;
