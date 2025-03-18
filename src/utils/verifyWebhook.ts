import crypto from 'crypto';
import { Request } from 'express';

export function verifyWebhook(payload: Buffer, secretKey: string, req: Request): boolean {
  const hmac = req.headers['x-hub-signature-256'];
  if (!hmac) return false;

  const calculatedHmac = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');

  return `sha256=${calculatedHmac}` === hmac;
} 