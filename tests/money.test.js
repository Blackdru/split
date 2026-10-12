const MoneyService = require('../src/services/money');

describe('MoneyService', () => {
  describe('rupeesToPaise & paiseToRupees', () => {
    test('converts standard rupees to paise correctly', () => {
      expect(MoneyService.rupeesToPaise('100')).toBe(10000n);
      expect(MoneyService.rupeesToPaise('100.50')).toBe(10050n);
      expect(MoneyService.rupeesToPaise('0.05')).toBe(5n);
      expect(MoneyService.rupeesToPaise('0.1')).toBe(10n);
      expect(MoneyService.rupeesToPaise(1250)).toBe(125000n);
    });

    test('converts paise to rupee string correctly', () => {
      expect(MoneyService.paiseToRupees(10000n)).toBe('100.00');
      expect(MoneyService.paiseToRupees(10050n)).toBe('100.50');
      expect(MoneyService.paiseToRupees(5n)).toBe('0.05');
      expect(MoneyService.paiseToRupees(-500n)).toBe('-5.00');
    });

    test('formats Indian number convention correctly', () => {
      expect(MoneyService.formatINR(10000n)).toBe('₹100.00');
      expect(MoneyService.formatINR(12345678n)).toBe('₹1,23,456.78');
      expect(MoneyService.formatINR(1000000000n)).toBe('₹1,00,00,000.00');
    });
  });

  describe('calculateEqualSplit', () => {
    test('splits evenly when divisible', () => {
      const splits = MoneyService.calculateEqualSplit(30000n, ['u1', 'u2', 'u3']);
      expect(splits).toEqual([
        { userId: 'u1', shareMinor: 10000n },
        { userId: 'u2', shareMinor: 10000n },
        { userId: 'u3', shareMinor: 10000n }
      ]);
      const sum = splits.reduce((acc, s) => acc + s.shareMinor, 0n);
      expect(sum).toBe(30000n);
    });

    test('distributes remainder 1 paise deterministically (e.g. ₹100 / 3)', () => {
      const splits = MoneyService.calculateEqualSplit(10000n, ['u1', 'u2', 'u3']);
      expect(splits).toEqual([
        { userId: 'u1', shareMinor: 3334n },
        { userId: 'u2', shareMinor: 3333n },
        { userId: 'u3', shareMinor: 3333n }
      ]);
      const sum = splits.reduce((acc, s) => acc + s.shareMinor, 0n);
      expect(sum).toBe(10000n);
    });
  });

  describe('calculatePercentageSplit', () => {
    test('splits percentage correctly and allocates rounding remainder', () => {
      const splits = MoneyService.calculatePercentageSplit(10000n, [
        { userId: 'u1', percentage: 33.33 },
        { userId: 'u2', percentage: 33.33 },
        { userId: 'u3', percentage: 33.34 }
      ]);
      const sum = splits.reduce((acc, s) => acc + s.shareMinor, 0n);
      expect(sum).toBe(10000n);
    });

    test('throws if total percentage is not 100%', () => {
      expect(() => {
        MoneyService.calculatePercentageSplit(10000n, [
          { userId: 'u1', percentage: 50 },
          { userId: 'u2', percentage: 40 }
        ]);
      }).toThrow('Total percentage must equal 100%');
    });
  });

  describe('calculateSharesSplit', () => {
    test('allocates according to share units (2 : 1 : 1)', () => {
      const splits = MoneyService.calculateSharesSplit(10000n, [
        { userId: 'u1', shares: 2 },
        { userId: 'u2', shares: 1 },
        { userId: 'u3', shares: 1 }
      ]);
      expect(splits).toEqual([
        { userId: 'u1', shareMinor: 5000n },
        { userId: 'u2', shareMinor: 2500n },
        { userId: 'u3', shareMinor: 2500n }
      ]);
      const sum = splits.reduce((acc, s) => acc + s.shareMinor, 0n);
      expect(sum).toBe(10000n);
    });
  });

  describe('validatePayers & validateExactSplit', () => {
    test('validates multi-payer sum equals expense total', () => {
      expect(() =>
        MoneyService.validatePayers(10000n, [
          { userId: 'u1', amountMinor: 6000n },
          { userId: 'u2', amountMinor: 4000n }
        ])
      ).not.toThrow();

      expect(() =>
        MoneyService.validatePayers(10000n, [
          { userId: 'u1', amountMinor: 6000n },
          { userId: 'u2', amountMinor: 3000n }
        ])
      ).toThrow('does not equal expense total');
    });
  });
});
