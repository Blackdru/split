const GroupsService = require('./groups.service');

class GroupsController {
  static async createGroup(req, res, next) {
    try {
      const group = await GroupsService.createGroup(req.user.id, req.body);
      res.status(201).json({ success: true, data: group });
    } catch (err) {
      next(err);
    }
  }

  static async getUserGroups(req, res, next) {
    try {
      const groups = await GroupsService.getUserGroups(req.user.id);
      res.status(200).json({ success: true, data: groups });
    } catch (err) {
      next(err);
    }
  }

  static async getGroupDetails(req, res, next) {
    try {
      const details = await GroupsService.getGroupDetails(req.params.groupId, req.user.id);
      res.status(200).json({ success: true, data: details });
    } catch (err) {
      next(err);
    }
  }

  static async createInvitation(req, res, next) {
    try {
      const { maxUses, expiryDays } = req.body;
      const invite = await GroupsService.createInvitation(req.params.groupId, req.user.id, maxUses, expiryDays);
      res.status(201).json({ success: true, data: invite });
    } catch (err) {
      next(err);
    }
  }

  static async acceptInvitation(req, res, next) {
    try {
      const result = await GroupsService.acceptInvitation(req.user.id, req.params.token);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = GroupsController;
