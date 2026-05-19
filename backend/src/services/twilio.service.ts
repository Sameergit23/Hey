import twilio from 'twilio';
import { config } from '../config/env';
import logger from '../lib/logger';

class TwilioService {
  private client: twilio.Twilio | null = null;

  constructor() {
    if (config.twilioAccountSid && config.twilioAuthToken) {
      this.client = twilio(config.twilioAccountSid, config.twilioAuthToken);
    }
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    if (!this.client) {
      logger.warn('Twilio not configured, skipping OTP send');
      return;
    }

    try {
      await this.client.messages.create({
        body: `Your Hey verification code is: ${code}. Valid for 10 minutes.`,
        from: config.twilioPhoneNumber,
        to: phone,
      });

      logger.info(`OTP sent via Twilio to ${phone}`);
    } catch (error) {
      logger.error('Twilio send error:', error);
      throw error;
    }
  }
}

export const twilioService = new TwilioService();
