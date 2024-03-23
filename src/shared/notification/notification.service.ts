import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from './notification.interface';

@Injectable()
export class NotifyUserService implements NotificationService {
  private logger: Logger;
  constructor() {
    this.logger = new Logger(NotifyUserService.name);
  }

  async sendNotification(data: Record<string, any>): Promise<void> {
    const { fullName, email, randomPassword } = data;
    this.logger.log(`Sending notification to ${email}`);
    this.logger.log(`Welcome ${fullName},
 
    we happy to have you here! Please proceed to sign-in with your email. Here's your password: ${randomPassword} `);
  }
}
