import { Router } from "express";
import { getYukatelOrderById, getYukatelOrders } from "@/controllers/yukatelController";

const router = Router();

router.get('/yukatel/orders', getYukatelOrders);  
router.get('/yukatel/orders/:id', getYukatelOrderById);
export default router;