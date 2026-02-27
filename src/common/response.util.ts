export class ResponseUtil {
  static success<T>(data: T, message?: string) {
    return {
      success: true,
      message: message || 'Operation successful',
      data,
    };
  }

  static error(message: string, errors?: any) {
    return {
      success: false,
      message,
      errors,
    };
  }

  static paginated<T>(data: T[], total: number, page: number, limit: number) {
    return {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }
}
