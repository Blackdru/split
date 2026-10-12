const { Router } = require('express');
const ExpensesController = require('./expenses.controller');
const { authenticate } = require('../../middleware/authenticate');
const { validate } = require('../../middleware/validate');
const { createExpenseSchema } = require('./expenses.schema');

const router = Router();

router.post('/groups/:groupId/expenses', authenticate, validate(createExpenseSchema), ExpensesController.createExpense);
router.get('/groups/:groupId/expenses', authenticate, ExpensesController.getGroupExpenses);
router.get('/groups/:groupId/balances', authenticate, ExpensesController.getGroupBalances);

module.exports = router;
