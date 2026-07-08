import express from 'express';
import {
    getSummary,
    getCategoryBreakdown,
    getMonthlyTrend,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/breakdown', getCategoryBreakdown);
router.get('/trend', getMonthlyTrend);

export default router;