import jwt from 'jsonwebtoken';

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp: number } | null;
    if (decoded === null || typeof decoded.exp !== 'number' || isNaN(decoded.exp)) {
      throw new Error('Invalid token');
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // Assume token is expired if there's an error
  }
}

export default isTokenExpired;
