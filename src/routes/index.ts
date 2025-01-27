import express from 'express';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
// import UserRoutes from '@/routes/user';

const router = express.Router();

dotenv.config();
// const webhookToken = process.env.WEBHOOKTOKEN;

router.get('/', (req: Request, res: Response) => {
  res.status(200).send('Welcome to the SmartPhoneShop API');
});

// router.use('/users', UserRoutes);

export default router;
