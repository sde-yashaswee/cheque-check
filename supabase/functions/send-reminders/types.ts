export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export interface ReminderResult {
  userId: string;
  userName: string;
  status: 'success' | 'failed';
  sid?: string;
  error?: string;
}
