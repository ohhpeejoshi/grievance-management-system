import { db } from '../config/db.js';
import { sendEscalationNotification } from '../utils/mail.js';

// Helper function to check if a date is a Sunday
const isSunday = (date) => {
    return date.getDay() === 0;
};

// Helper function to calculate business days (excluding Sundays) between two dates
const calculateBusinessDays = (startDate, endDate) => {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
        if (!isSunday(curDate)) {
            count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count - 1; // Subtract 1 to not count the start day
};


const checkAndEscalateGrievances = async () => {
    console.log('Running escalation check...');
    try {
        const now = new Date();

        // --- LEVEL 1 ESCALATION ---
        const findLevel1GrievancesSQL = `
            SELECT
                g.id, g.ticket_id, g.title, g.status, g.response_deadline, g.resolution_deadline
            FROM grievances g
            WHERE
                g.escalation_level = 0 AND g.status != 'Resolved'
                AND (
                    (g.status = 'Submitted' AND g.response_deadline < NOW()) OR
                    (g.status = 'In Progress' AND g.resolution_deadline < NOW())
                )
        `;
        const [grievancesToLevel1] = await db.promise().query(findLevel1GrievancesSQL);

        if (grievancesToLevel1.length > 0) {
            console.log(`Found ${grievancesToLevel1.length} grievance(s) to escalate to Level 1.`);
            const [authorities] = await db.promise().query('SELECT email FROM approving_authorities');
            const authorityEmails = authorities.map(a => a.email);

            if (authorityEmails.length > 0) {
                for (const grievance of grievancesToLevel1) {
                    // Check if today is Sunday. If so, skip escalation for today.
                    if (isSunday(now)) {
                        console.log(`Skipping Level 1 escalation for ${grievance.ticket_id} because today is Sunday.`);
                        continue;
                    }
                    await db.promise().query('UPDATE grievances SET escalation_level = 1, updated_at = NOW() WHERE id = ?', [grievance.id]);
                    console.log(`Grievance ${grievance.ticket_id} escalated to Level 1.`);
                    for (const authorityEmail of authorityEmails) {
                        await sendEscalationNotification(grievance, authorityEmail, 1);
                    }
                }
            }
        } else {
            console.log('No new grievances to escalate to Level 1.');
        }


        // --- LEVEL 2 ESCALATION ---
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

checkAndEscalateGrievances();