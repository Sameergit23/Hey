import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { successResponse } from '../../utils/response';

class AuthController {
  sendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { phone, countryCode } = req.body;
    const result = await authService.sendOtp(phone, countryCode);
    return successResponse(res, result, 'OTP sent successfully');
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { phone, countryCode, code } = req.body;
    const result = await authService.verifyOtp(phone, countryCode, code);
    return successResponse(res, result, 'OTP verified successfully');
  });

  signup = asyncHandler(async (req: Request, res: Response) => {
    const { phone, countryCode, code, name, username } = req.body;
    const result = await authService.signup(phone, countryCode, code, name, username);
    return successResponse(res, result, 'Signup successful', 201);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { phone, countryCode, code } = req.body;
    const result = await authService.login(phone, countryCode, code);
    return successResponse(res, result, 'Login successful');
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    return successResponse(res, result, 'Token refreshed successfully');
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { refreshToken, allDevices } = req.body;
    const result = await authService.logout(userId, refreshToken, allDevices);
    return successResponse(res, result, 'Logged out successfully');
  });

  getActiveSessions = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const sessions = await authService.getActiveSessions(userId);
    return successResponse(res, { sessions }, 'Active sessions retrieved');
  });
}

export const authController = new AuthController();
