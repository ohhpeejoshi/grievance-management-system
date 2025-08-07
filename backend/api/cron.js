import { checkAndEscalateGrievances } from '../scripts/escalationCron.js';
import ErrorResponse from '../utils/errorResponse.js';

/**
 * Handles incoming requests to trigger the cron job.
 * This function is designed to be called by Vercel's Cron Job scheduler.
 *
 * @param {object} req - The incoming request object.
 * @param {object} res - The outgoing response object.
 * @param {function} next - The next middleware function.
 */
export default async function handler(req, res, next) {
    // 1. Authorization Check: Ensure the request comes from Vercel Cron
    const authHeader = req.headers.authorization;
    if (req.method !== 'GET' || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Use the existing ErrorResponse for consistent error handling
        return next(new ErrorResponse('Unauthorized', 401));
    }

    // 2. Execute the Escalation Logic
    try {
        console.log('Cron job endpoint triggered successfully. Starting escalation check...');
        await checkAndEscalateGrievances();
        res.status(200).json({ success: true, message: 'Escalation check completed.' });
    } catch (error) {
        console.error('Error executing the cron job from the API endpoint:', error);
        // Pass the error to the global error handler
        next(new ErrorResponse('Cron job execution failed', 500));
    }
}