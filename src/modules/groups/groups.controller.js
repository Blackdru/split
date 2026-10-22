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

  static async getUserDashboardSummary(req, res, next) {
    try {
      const summary = await GroupsService.getUserDashboardSummary(req.user.id);
      res.status(200).json({ success: true, data: summary });
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

  static async addMember(req, res, next) {
    try {
      const result = await GroupsService.addMember(req.params.groupId, req.user.id, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async removeMember(req, res, next) {
    try {
      const result = await GroupsService.removeMember(req.params.groupId, req.user.id, req.params.memberId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async previewInvitation(req, res, next) {
    try {
      const preview = await GroupsService.getInvitationPreview(req.params.token);
      res.status(200).json({ success: true, data: preview });
    } catch (err) {
      next(err);
    }
  }

  static async renderInviteLanding(req, res, next) {
    try {
      const { renderInvitePage } = require('./invite-page.template');
      const token = req.params.token;
      const preview = await GroupsService.getInvitationPreview(token);

      const baseUrl = process.env.APP_BASE_URL || 'https://split.udhaar.store';
      const webUrl = `${baseUrl}/join/${token}`;
      const playStorePackage = process.env.PLAY_STORE_PACKAGE || 'com.budrock.splitboss';
      const playStoreUrl = `https://play.google.com/store/apps/details?id=${playStorePackage}&referrer=invite_token%3D${encodeURIComponent(token)}`;
      const appSchemeUrl = `splitboss://join/${token}`;

      // If client requests JSON explicitly, return JSON
      if (req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html')) {
        return res.status(200).json({ success: true, data: preview });
      }

      // Return high-converting branded HTML landing page
      const html = renderInvitePage({
        preview,
        token,
        playStoreUrl,
        appSchemeUrl,
        webUrl
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(preview.valid ? 200 : 404).send(html);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = GroupsController;


