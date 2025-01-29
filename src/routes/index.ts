import express from 'express';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import getPrestaShopAddressId from '@/services/getPrestaShopAddressId';
// import UserRoutes from '@/routes/user';

const router = express.Router();

dotenv.config();
// const webhookToken = process.env.WEBHOOKTOKEN;

router.get('/', (req: Request, res: Response) => {
  getPrestaShopAddressId()
    .then((data) => {
      console.log('Address ID:', data);
      res.status(200).send(data);
    })
    .catch((error) => {
      console.error('Error fetching address ID:', error.data);
      res.status(500).send('Error fetching address ID');
    });
  // res.status(200).send('Welcome to the SmartPhoneShop API');
});

// router.use('/users', UserRoutes);

export default router;
