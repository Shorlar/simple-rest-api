export interface NotificationService {
  sendNotification(data: any): Promise<void>;
}
