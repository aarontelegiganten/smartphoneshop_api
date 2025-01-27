import express from 'express';
import type { Request, Response } from 'express';
import getXmlData from '@/services/fetchMobileAdds';

const router = express.Router();
router.get('/fetch-xml', (req: Request, res: Response) => {
  try {
    const url = 'https://mobileadds.eu/module/xmlfeeds/api?id=1&categorylist=3283'; // Replace with your XML endpoint
    getXmlData(url)
      .then((data) => {
        // console.log('XML data:', data);
        res.status(200).send(data);
      })
      .catch((error) => {
        console.error('Error fetching XML data:', error);
        res.status(500).send('Error fetching XML data');
      });
  } catch (error) {
    res.status(500).send('Error fetching XML data');
  }
});

export default router;
