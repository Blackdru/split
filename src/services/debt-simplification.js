/**
 * Debt Simplification Service
 * Generates an optimal, minimal set of bilateral settlements
 * while strictly preserving every individual's net balance.
 */

class DebtSimplificationService {
  /**
   * Simplify debts given a map of net balances { [userId]: bigint | number }
   * Net balance sign convention:
   *   positive (> 0): Creditor (User is owed money by the group)
   *   negative (< 0): Debtor (User owes money to the group)
   *   zero (= 0): Settled
   *
   * @param {Record<string, bigint|number>} netBalances
   * @returns {{ from: string, to: string, amountMinor: bigint }[]}
   */
  static simplifyDebts(netBalances) {
    // 1. Separate debtors and creditors
    const debtors = [];
    const creditors = [];
    let netSum = 0n;

    for (const [userId, balance] of Object.entries(netBalances)) {
      const b = BigInt(balance);
      netSum += b;
      if (b < 0n) {
        debtors.push({ userId, amount: -b }); // Store as positive debt
      } else if (b > 0n) {
        creditors.push({ userId, amount: b }); // Store as credit
      }
    }

    if (netSum !== 0n) {
      throw new Error(`Financial Invariant Violation: Sum of net balances must be zero. Got: ${netSum}`);
    }

    // Sort descending by amount for greedy matching; sort by userId secondary for deterministic output
    const sortFn = (a, b) => {
      if (b.amount !== a.amount) {
        return b.amount > a.amount ? 1 : -1;
      }
      return a.userId.localeCompare(b.userId);
    };

    debtors.sort(sortFn);
    creditors.sort(sortFn);

    const transactions = [];

    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];

      const settleAmount = debtor.amount < creditor.amount ? debtor.amount : creditor.amount;

      if (settleAmount > 0n) {
        transactions.push({
          from: debtor.userId,
          to: creditor.userId,
          amountMinor: settleAmount
        });

        debtor.amount -= settleAmount;
        creditor.amount -= settleAmount;
      }

      if (debtor.amount === 0n) {
        dIdx++;
      }
      if (creditor.amount === 0n) {
        cIdx++;
      }
    }

    return transactions;
  }
}

module.exports = DebtSimplificationService;
