export class QueryUtil {
  static buildPagination(page: number = 1, limit: number = 10) {
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  static buildDateRange(startDate?: Date, endDate?: Date) {
    if (!startDate && !endDate) return {};
    
    const range: any = {};
    if (startDate) range.gte = startDate;
    if (endDate) range.lte = endDate;
    
    return range;
  }

  static buildSearch(fields: string[], searchTerm: string) {
    if (!searchTerm) return {};
    
    return {
      OR: fields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    };
  }

  static buildSort(sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') {
    return {
      [sortBy]: sortOrder,
    };
  }
}
