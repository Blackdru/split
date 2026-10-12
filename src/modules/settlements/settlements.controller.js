const SettlementsService = require('./settlements.service');

class SettlementsController {
  static async recordSettlement(req, res, next) {
    try {
      const settlement = await SettlementsService.recordSettlement(
        req.user.id,
        req.params.groupId,
        req.body
      );
      res.status(201).json({ success: true, data: settlement });
    } catch (err) {
      next(err);
    }
  }

  static async acknowledgeSettlement(req, res, next) {
    try {
      const updated = await SettlementsService.acknowledgeSettlement(
        req.params.settlementId,
        req.user.id
      );
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async getGroupSettlements(req, res, next) {
    try {
      const settlements = await SettlementsService.getGroupSettlements(
        req.params.groupId,
        req.user.id
      );
      res.status(200).json({ success: true, data: settlements });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SettlementsController;
