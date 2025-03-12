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

const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
