import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).send('Welcome to smartphoneshop API');
});

export default router;
