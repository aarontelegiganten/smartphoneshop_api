import { Request, Response } from 'express';
import { fetchYukatelOrders } from '@/services/yukatel/fetchYukatelOrders';

const authcode = process.env.YUKATEL_AUTH_CODE;
const vpnr = process.env.YUKATEL_VPNR;

/**
 * Fetches Yukatel orders
 * @param req Request
 * @param res Response
 */
export const getYukatelOrders = async (req: Request, res: Response) => {
  try {

    if (!authcode || !vpnr) {
      return res.status(400).json({ error: 'authcode and vpnr are required' });
    }

    const orders = await fetchYukatelOrders(authcode as string, vpnr as string);
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching Yukatel orders:', error);
    return res.status(500).json({ error: 'Failed to fetch Yukatel orders' });
  }
};
