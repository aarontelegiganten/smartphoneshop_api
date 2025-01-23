import express from 'express';
import fetchOrders from './shop';
import UserRoutes from '@/routes/user';

const router = express.Router();

router.get('/', async (req, res) => {
  await fetchOrders();
  res.send('This is the API root!');
});

router.use('/users', UserRoutes);

export default router;
