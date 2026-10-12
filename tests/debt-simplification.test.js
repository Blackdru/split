const DebtSimplificationService = require('../src/services/debt-simplification');

describe('DebtSimplificationService', () => {
  test('simplifies a 3-way circular debt chain into minimal direct settlements', () => {
    // A owes B ₹100, B owes C ₹100
    // Net: A = -10000, B = 0, C = +10000
    const netBalances = {
      userA: -10000n,
      userB: 0n,
      userC: 10000n
    };

    const settlements = DebtSimplificationService.simplifyDebts(netBalances);
    expect(settlements).toHaveLength(1);
    expect(settlements[0]).toEqual({
      from: 'userA',
      to: 'userC',
      amountMinor: 10000n
    });
  });

  test('simplifies multi-person group scenario accurately', () => {
    // 4 friends:
    // u1 paid 400 (net +200)
    // u2 paid 0 (net -100)
    // u3 paid 0 (net -100)
    // u4 paid 0 (net 0) -> not participating
    const netBalances = {
      u1: 20000n,
      u2: -10000n,
      u3: -10000n
    };

    const settlements = DebtSimplificationService.simplifyDebts(netBalances);
    expect(settlements).toHaveLength(2);

    const totalSettled = settlements.reduce((acc, s) => acc + s.amountMinor, 0n);
    expect(totalSettled).toBe(20000n);

    // Verify all go to u1
    settlements.forEach((s) => {
      expect(s.to).toBe('u1');
      expect(s.amountMinor).toBe(10000n);
    });
  });

  test('handles zero balances gracefully', () => {
    const netBalances = {
      u1: 0n,
      u2: 0n
    };
    const settlements = DebtSimplificationService.simplifyDebts(netBalances);
    expect(settlements).toHaveLength(0);
  });

  test('throws error if net balances do not sum to zero (invariant failure)', () => {
    const netBalances = {
      u1: 5000n,
      u2: -4000n
    };
    expect(() => DebtSimplificationService.simplifyDebts(netBalances)).toThrow('Invariant Violation');
  });
});
