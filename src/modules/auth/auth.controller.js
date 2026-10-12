const AuthService = require('./auth.service');

class AuthController {
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req, res, next) {
    try {
      const result = await AuthService.refresh(req.body.refreshToken);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res, next) {
    try {
      await AuthService.logout(req.body.refreshToken);
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  static async logoutAll(req, res, next) {
    try {
      await AuthService.logoutAll(req.user.id);
      res.status(200).json({
        success: true,
        message: 'All device sessions terminated'
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
