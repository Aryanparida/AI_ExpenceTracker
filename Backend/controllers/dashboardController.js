import pool from '../db.js';

// 1. Get Dashboard Summary Statistics
export const getDashboardSummary = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses
             FROM transactions
             WHERE user_id = $1 AND date_trunc('month', transaction_date) = date_trunc('month', CURRENT_DATE)`,
            [req.userId]
        );

        const { total_income, total_expenses } = result.rows[0];
        const net_savings = total_income - total_expenses;

        res.json({
            totalIncome: parseFloat(total_income),
            totalExpenses: parseFloat(total_expenses),
            netSavings: parseFloat(net_savings)
        });
    } catch (error) {
        console.error('GetDashboardSummary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 2. Get Expense Breakdown by Category
export const getCategoryBreakdown = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                c.name AS category,
                c.color,
                c.icon,
                SUM(t.amount) AS total,
                ROUND((SUM(t.amount) / SUM(SUM(t.amount)) OVER()) * 100, 2) AS percentage
             FROM transactions t
             JOIN categories c ON t.category_id = c.id
             WHERE t.user_id = $1 
               AND t.type = 'expense' 
               AND date_trunc('month', t.transaction_date) = date_trunc('month', CURRENT_DATE)
             GROUP BY c.id, c.name, c.color, c.icon
             ORDER BY total DESC`,
            [req.userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('GetCategoryBreakdown error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 3. Get Monthly Cash Flow Trend (Last 6 Months)
export const getMonthlyTrend = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                to_char(transaction_date, 'Mon YYYY') AS month,
                date_trunc('month', transaction_date) AS month_date,
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
             FROM transactions
             WHERE user_id = $1 
               AND transaction_date >= CURRENT_DATE - INTERVAL '6 months'
             GROUP BY month, month_date
             ORDER BY month_date ASC`,
            [req.userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('GetMonthlyTrend error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};