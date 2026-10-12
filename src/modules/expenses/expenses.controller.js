const ExpensesService = require('./expenses.service');

class ExpensesController {
  static async createExpense(req, res, next) {
    try {
      const expense = await ExpensesService.createExpense(req.user.id, req.params.groupId, req.body);
      res.status(201).json({ success: true, data: expense });
    } catch (err) {
      next(err);
    }
  }

  static async getGroupExpenses(req, res, next) {
    try {
      const expenses = await ExpensesService.getGroupExpenses(req.params.groupId, req.user.id);
      res.status(200).json({ success: true, data: expenses });
    } catch (err) {
      next(err);
    }
  }

  static async getGroupBalances(req, res, next) {
    try {
      const balances = await ExpensesService.getGroupBalances(req.params.groupId, req.user.id);
      res.status(200).json({ success: true, data: balances });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ExpensesController;
