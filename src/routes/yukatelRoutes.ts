import { Router } from "express";
import { getYukatelOrders } from "@/controllers/yukatelController";

const router = Router();

router.get('/yukatel/orders', getYukatelOrders);  

export default router;