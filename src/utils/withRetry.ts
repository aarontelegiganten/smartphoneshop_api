
// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('Operation failed after retries');
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
