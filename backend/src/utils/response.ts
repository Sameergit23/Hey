import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  error?: ApiError;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  details?: unknown;
}

export class ResponseBuilder {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    } satisfies ApiResponse<T>);
  }

  static created<T>(res: Response, data: T, message = 'Created'): Response {
    return ResponseBuilder.success(res, data, message, 201);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    meta: PaginationMeta,
    message = 'Success'
  ): Response {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta,
    } satisfies ApiResponse<T[]>);
  }

  static error(
    res: Response,
    message: string,
    statusCode = 400,
    code = 'BAD_REQUEST',
    details?: unknown
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      error: { code, details },
    } satisfies ApiResponse);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}

// Pagination helper
export const parsePagination = (
  query: Record<string, unknown>
): { skip: number; take: number; page: number; limit: number } => {
  const page  = Math.max(1, Number(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { skip: (page - 1) * limit, take: limit, page, limit };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasMore: page * limit < total,
});
