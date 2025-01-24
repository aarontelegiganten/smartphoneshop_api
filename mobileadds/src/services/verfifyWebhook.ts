import { createHmac } from 'crypto';
import type { Request } from 'express';

const hmacHeader = 'X-Hmac-Sha256';

function verifyWebhook(payload: Buffer, secretKey: string, request: Request): boolean {
  const received = request.headers[hmacHeader.toLowerCase()] as string;
  if (received.length === 0) {
    throw new Error('HMAC header not found');
  }
  const receivedHMAC = Buffer.from(received, 'base64');

  const hash = createHmac('sha256', secretKey);
  hash.update(payload);
  const sum = hash.digest();

  const calculatedHMAC = Buffer.from(sum);

  return receivedHMAC.equals(calculatedHMAC);
}

export default verifyWebhook;
