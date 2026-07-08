import express from 'express';
import {
    getDashboardSummary,
    getCategoryBreakdown,
    getMonthlyTrend,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/breakdown', getCategoryBreakdown);
router.get('/trend', getMonthlyTrend);

export default router;