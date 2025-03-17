import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../apidoc.json';

import routes from '@/routes/index';
import WebhookRoutes from '@/routes/webhook';
import mobileAddsRoute from '@/routes/mobileadds';
import mailchimpRoutes from '@/routes/mailchimpRoutes';
import productRoutes from '@/routes/soapProductRoutes';
import { initializeStockUpdateScheduler, stopStockUpdateScheduler } from './controllers/productController';
dotenv.config();

const app = express();

// Configure CORS
const corsOptions = {
  origin: '*', // Allow all origins. Change this to specific origins as needed.
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api', routes);
app.use('/api', WebhookRoutes);
app.use('/api', mobileAddsRoute);
app.use('/api', mailchimpRoutes);
app.use('/api', productRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start the stock update scheduler
initializeStockUpdateScheduler();

const PORT = process.env.PORT ?? 8080;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  stopStockUpdateScheduler();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  stopStockUpdateScheduler();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;


