// backend/scripts/escalationCron.js
import { fileURLToPath } from 'url';
import { db } from '../config/db.js';
import { sendEscalationNotification } from '../utils/mail.js';

/**
 * Checks if a given date falls on a Sunday.
 * @param {Date} date - The date to check.
 * @returns {boolean} - True if the date is a Sunday, false otherwise.
 */
const isSunday = (date) => {
    return date.getDay() === 0; // Sunday is 0 in JavaScript's getDay()
};

/**
 * Calculates the number of business days (excluding Sundays) between two dates.
 * @param {Date} startDate - The start date.
 * @param {Date} endDate - The end date.
 * @returns {number} - The total number of business days.
 */
const calculateBusinessDays = (startDate, endDate) => {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
        if (!isSunday(curDate)) {
            count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count - 1; // Subtract 1 to not count the start day itself
};

/**
 * Checks for overdue grievances and escalates them to the next level.
 * This function is designed to be called periodically by the main app server.
 */
export const checkAndEscalateGrievances = async () => {
    console.log(`[${new Date().toISOString()}] Running escalation check...`);
    try {
        const now = new Date();

        // --- LEVEL 1 ESCALATION (Office Bearer -> Approving Authority) ---
        // FIX: Use CONVERT_TZ to ensure the current time is in IST for comparison,
        // making the query robust against server timezone configurations.
        const findLevel1GrievancesSQL = `
            SELECT
                g.id, g.ticket_id, g.title, g.status, g.response_deadline, g.resolution_deadline
            FROM grievances g
            WHERE
                g.escalation_level = 0 AND g.status != 'Resolved'
                AND (
                    (g.status = 'Submitted' AND g.response_deadline < CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+05:30')) OR
                    (g.status = 'In Progress' AND g.resolution_deadline < CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+05:30'))
                )
        `;
        const [grievancesToLevel1] = await db.promise().query(findLevel1GrievancesSQL);

        if (grievancesToLevel1.length > 0) {
            console.log(`Found ${grievancesToLevel1.length} grievance(s) to escalate to Level 1.`);
            const [authorities] = await db.promise().query('SELECT email FROM approving_authorities');
            const authorityEmails = authorities.map(a => a.email);

            if (authorityEmails.length > 0) {
                for (const grievance of grievancesToLevel1) {
                    await db.promise().query('UPDATE grievances SET escalation_level = 1, status = \'Escalated\', updated_at = NOW() WHERE id = ?', [grievance.id]);
                    console.log(`Grievance ${grievance.ticket_id} escalated to Level 1.`);
                    for (const authorityEmail of authorityEmails) {
                        await sendEscalationNotification(grievance, authorityEmail, 1);
                    }
                }
            }
        } else {
            console.log('No new grievances to escalate to Level 1.');
        }

        // --- LEVEL 2 ESCALATION (Approving Authority -> Admin) ---
        const findLevel2GrievancesSQL = `
            SELECT
                g.id, g.ticket_id, g.title, g.updated_at
            FROM grievances g
            WHERE
                g.escalation_level = 1
                AND g.status != 'Resolved'
        `;
        const [grievancesToLevel2] = await db.promise().query(findLevel2GrievancesSQL);

        if (grievancesToLevel2.length > 0) {
            console.log(`Found ${grievancesToLevel2.length} potential grievance(s) for Level 2 escalation. Checking time elapsed...`);
            const [admins] = await db.promise().query('SELECT email FROM admins');
            const adminEmails = admins.map(a => a.email);

            if (adminEmails.length > 0) {
                for (const grievance of grievancesToLevel2) {
                    const lastUpdate = new Date(grievance.updated_at);
                    const businessDaysSinceUpdate = calculateBusinessDays(lastUpdate, now);

                    if (businessDaysSinceUpdate >= 2) {
                        await db.promise().query('UPDATE grievances SET escalation_level = 2, updated_at = NOW() WHERE id = ?', [grievance.id]);
                        console.log(`Grievance ${grievance.ticket_id} escalated to Level 2 after ${businessDaysSinceUpdate} business days.`);
                        for (const adminEmail of adminEmails) {
                            await sendEscalationNotification(grievance, adminEmail, 2);
                        }
                    }
                }
            }
        } else {
            console.log('No new grievances to escalate to Level 2.');
        }

        console.log('Escalation process complete.');

    } catch (err) {
        console.error('Error during grievance escalation process:', err);
    }
};


/**
 * This block checks if the script is being run directly from the command line.
 * If so, it executes the escalation check and then closes the database connection
 * to allow the Node.js process to terminate.
 */
const isRunDirectly = fileURLToPath(import.meta.url) === process.argv[1];
if (isRunDirectly) {
    console.log('Running escalation script manually from command line...');
    checkAndEscalateGrievances()
        .then(() => {
            console.log('Manual run finished.');
        })
        .catch(err => {
            console.error('Manual run failed with an error:', err);
        })
        .finally(() => {
            // Always try to close the connection pool
            db.end();
        });
}
