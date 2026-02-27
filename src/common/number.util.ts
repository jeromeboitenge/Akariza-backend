export class NumberUtil {
  static formatCurrency(amount: number, currency: string = 'RWF'): string {
    return `${amount.toLocaleString()} ${currency}`;
  }

  static calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100 * 100) / 100;
  }

  static calculateDiscount(price: number, discountPercent: number): number {
    return Math.round(price * (discountPercent / 100) * 100) / 100;
  }

  static calculateTax(amount: number, taxPercent: number): number {
    return Math.round(amount * (taxPercent / 100) * 100) / 100;
  }

  static roundToTwo(num: number): number {
    return Math.round(num * 100) / 100;
  }

  static generateCode(prefix: string, number: number, length: number = 6): string {
    return `${prefix}-${String(number).padStart(length, '0')}`;
  }

  static generateOTP(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return String(Math.floor(min + Math.random() * (max - min + 1)));
  }
}
