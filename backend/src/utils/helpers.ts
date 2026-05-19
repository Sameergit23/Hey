import { Request, Response, NextFunction } from 'express';

// Wraps async route handlers to eliminate try/catch boilerplate
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Generate a cryptographically random numeric OTP
export const generateOTP = (length = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

// Sleep helper
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Pick specific keys from an object (remove sensitive fields)
export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
};

// Omit keys from object
export const omit = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result as Omit<T, K>;
};

// Format phone to E.164
export const formatPhone = (countryCode: string, phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const code = countryCode.replace(/\D/g, '');
  return `+${code}${cleaned}`;
};

// Sanitize user object (remove password/sensitive fields)
export const sanitizeUser = <T extends Record<string, unknown>>(user: T): Omit<T, never> => {
  const { password, ...safe } = user as T & { password?: unknown };
  void password;
  return safe;
};
