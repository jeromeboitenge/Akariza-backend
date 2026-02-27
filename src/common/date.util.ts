export class DateUtil {
  static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  static addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 86400000);
  }

  static startOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  static endOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }

  static formatDate(date: Date, format: 'YYYY-MM-DD' | 'DD/MM/YYYY' = 'YYYY-MM-DD'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (format === 'DD/MM/YYYY') {
      return `${day}/${month}/${year}`;
    }
    return `${year}-${month}-${day}`;
  }

  static isExpired(date: Date): boolean {
    return new Date() > date;
  }

  static minutesUntil(date: Date): number {
    return Math.ceil((date.getTime() - Date.now()) / 60000);
  }
}
