/**
 * Money Service: Indian Rupee & Paise Arithmetic & Split Calculations
 * Invariant: All calculations use integer minor units (paise). 1 INR = 100 paise.
 */

class MoneyService {
  /**
   * Convert Rupee decimal or string to integer Paise
   * @param {number|string} rupees
   * @returns {bigint}
   */
  static rupeesToPaise(rupees) {
    if (rupees === null || rupees === undefined || rupees === '') {
      throw new Error('Invalid rupee amount: empty');
    }
    const cleanStr = String(rupees).trim();
    if (!/^-?\d+(\.\d{1,2})?$/.test(cleanStr)) {
      throw new Error(`Invalid rupee format: "${rupees}". Max 2 decimal digits allowed.`);
    }

    const parts = cleanStr.split('.');
    const integerPart = BigInt(parts[0]);
    let fractionPart = 0n;

    if (parts.length > 1) {
      const frac = parts[1].padEnd(2, '0');
      fractionPart = BigInt(frac);
    }

    if (cleanStr.startsWith('-')) {
      return integerPart * 100n - fractionPart;
    }
    return integerPart * 100n + fractionPart;
  }

  /**
   * Convert Paise (bigint or number) to Rupee decimal string
   * @param {bigint|number} paise
   * @returns {string}
   */
  static paiseToRupees(paise) {
    const bPaise = BigInt(paise);
    const isNegative = bPaise < 0n;
    const absPaise = isNegative ? -bPaise : bPaise;
    const whole = absPaise / 100n;
    const fraction = absPaise % 100n;
    const paddedFrac = fraction.toString().padStart(2, '0');
    return `${isNegative ? '-' : ''}${whole}.${paddedFrac}`;
  }

  /**
   * Format paise into Indian Rupee locale representation (e.g., ₹1,23,456.78)
   * @param {bigint|number} paise
   * @returns {string}
   */
  static formatINR(paise) {
    const rupeeStr = this.paiseToRupees(paise);
    const [whole, fraction] = rupeeStr.split('.');
    const isNegative = whole.startsWith('-');
    const cleanWhole = isNegative ? whole.slice(1) : whole;

    // Indian numbering format: 3 digits from right, then groups of 2
    let formattedWhole = '';
    if (cleanWhole.length <= 3) {
      formattedWhole = cleanWhole;
    } else {
      const lastThree = cleanWhole.slice(-3);
      const remaining = cleanWhole.slice(0, -3);
      const groups = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
      formattedWhole = `${groups},${lastThree}`;
    }

    return `${isNegative ? '-' : ''}₹${formattedWhole}.${fraction}`;
  }

  /**
   * Calculate Equal Split with deterministic remainder paise distribution
   * @param {bigint|number} totalMinor
   * @param {string[]} participantUserIds
   * @returns {{ userId: string, shareMinor: bigint }[]}
   */
  static calculateEqualSplit(totalMinor, participantUserIds) {
    const total = BigInt(totalMinor);
    if (total <= 0n) throw new Error('Total amount must be greater than zero.');
    if (!participantUserIds || participantUserIds.length === 0) {
      throw new Error('At least one participant is required for an equal split.');
    }

    const count = BigInt(participantUserIds.length);
    const baseShare = total / count;
    let remainder = total % count;

    // Distribute remainder 1 paise to the first N participants deterministically
    return participantUserIds.map((userId, index) => {
      let share = baseShare;
      if (BigInt(index) < remainder) {
        share += 1n;
      }
      return {
        userId,
        shareMinor: share
      };
    });
  }

  /**
   * Calculate Percentage Split and distribute minor remainder
   * @param {bigint|number} totalMinor
   * @param {{ userId: string, percentage: number }[]} allocations
   * @returns {{ userId: string, shareMinor: bigint }[]}
   */
  static calculatePercentageSplit(totalMinor, allocations) {
    const total = BigInt(totalMinor);
    if (total <= 0n) throw new Error('Total amount must be greater than zero.');
    if (!allocations || allocations.length === 0) {
      throw new Error('Allocations are required.');
    }

    const totalPct = allocations.reduce((sum, a) => sum + a.percentage, 0);
    if (Math.abs(totalPct - 100) > 0.001) {
      throw new Error(`Total percentage must equal 100%. Received: ${totalPct}%`);
    }

    let allocatedSum = 0n;
    const results = allocations.map((a) => {
      // Calculate (total * percentage) / 100
      const share = BigInt(Math.floor((Number(total) * a.percentage) / 100));
      allocatedSum += share;
      return {
        userId: a.userId,
        shareMinor: share
      };
    });

    // Remainder distributed to the first allocation
    const remainder = total - allocatedSum;
    if (remainder !== 0n && results.length > 0) {
      results[0].shareMinor += remainder;
    }

    return results;
  }

  /**
   * Calculate Share-based (units) split
   * @param {bigint|number} totalMinor
   * @param {{ userId: string, shares: number }[]} allocations
   * @returns {{ userId: string, shareMinor: bigint }[]}
   */
  static calculateSharesSplit(totalMinor, allocations) {
    const total = BigInt(totalMinor);
    if (total <= 0n) throw new Error('Total amount must be greater than zero.');
    const totalShares = allocations.reduce((sum, a) => sum + BigInt(a.shares), 0n);
    if (totalShares <= 0n) throw new Error('Total shares must be greater than zero.');

    let allocatedSum = 0n;
    const results = allocations.map((a) => {
      const share = (total * BigInt(a.shares)) / totalShares;
      allocatedSum += share;
      return {
        userId: a.userId,
        shareMinor: share
      };
    });

    const remainder = total - allocatedSum;
    if (remainder > 0n && results.length > 0) {
      results[0].shareMinor += remainder;
    }

    return results;
  }

  /**
   * Validate that exact splits sum up to the total
   */
  static validateExactSplit(totalMinor, splits) {
    const total = BigInt(totalMinor);
    const sum = splits.reduce((acc, s) => acc + BigInt(s.shareMinor), 0n);
    if (sum !== total) {
      throw new Error(`Split sum (${sum} paise) does not equal total amount (${total} paise).`);
    }
    return true;
  }

  /**
   * Validate that payer contributions sum up to the total expense
   */
  static validatePayers(totalMinor, payers) {
    const total = BigInt(totalMinor);
    if (!payers || payers.length === 0) {
      throw new Error('At least one payer is required.');
    }
    const sum = payers.reduce((acc, p) => acc + BigInt(p.amountMinor), 0n);
    if (sum !== total) {
      throw new Error(`Total paid (${sum} paise) does not equal expense total (${total} paise).`);
    }
    return true;
  }
}

module.exports = MoneyService;
