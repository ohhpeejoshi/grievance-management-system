import { db } from '../config/db.js';
import { sendEscalationNotification } from '../utils/mail.js';

const checkAndEscalateGrievances = async () => {
    console.log('Running escalation check...');
    try {
        // LEVEL 1 Escalation: Response time breached for 'Submitted' grievances
        const findLevel1GrievancesSQL = `
            SELECT
                g.id,
                g.ticket_id,
                g.title,
                g.escalation_level
            FROM grievances g
            WHERE
                g.status = 'Submitted'
                AND g.escalation_level = 0
                AND g.response_deadline < NOW();
        `;
        const [grievancesToLevel1] = await db.promise().query(findLevel1GrievancesSQL);

        if (grievancesToLevel1.length > 0) {
            console.log(`Found ${grievancesToLevel1.length} grievance(s) to escalate to Level 1.`);
            const [authorities] = await db.promise().query('SELECT email FROM approving_authorities');
            const authorityEmails = authorities.map(a => a.email);

            for (const grievance of grievancesToLevel1) {
                await db.promise().query('UPDATE grievances SET escalation_level = 1 WHERE id = ?', [grievance.id]);
                console.log(`Grievance ${grievance.ticket_id} escalated to Level 1.`);
                for (const authorityEmail of authorityEmails) {
                    await sendEscalationNotification(grievance, authorityEmail, 1);
                }
            }
        } else {
            console.log('No new grievances to escalate to Level 1.');
        }

        // LEVEL 2 Escalation: Resolution time breached for Level 1 grievances that are still not resolved
        const findLevel2GrievancesSQL = `
            SELECT
                g.id,
                g.ticket_id,
                g.title,
                g.escalation_level
            FROM grievances g
            WHERE
                g.status != 'Resolved'
                AND g.escalation_level = 1
                AND g.resolution_deadline < NOW();
        `;
        const [grievancesToLevel2] = await db.promise().query(findLevel2GrievancesSQL);

        if (grievancesToLevel2.length > 0) {
            console.log(`Found ${grievancesToLevel2.length} grievance(s) to escalate to Level 2.`);
            const [admins] = await db.promise().query('SELECT email FROM admins');
            const adminEmails = admins.map(a => a.email);

            for (const grievance of grievancesToLevel2) {
                // Escalate to Level 2
                await db.promise().query('UPDATE grievances SET escalation_level = 2 WHERE id = ?', [grievance.id]);
                console.log(`Grievance ${grievance.ticket_id} escalated to Level 2.`);

                // Notify all admins
                for (const adminEmail of adminEmails) {
                    await sendEscalationNotification(grievance, adminEmail, 2);
                }
            }
        } else {
            console.log('No new grievances to escalate to Level 2.');
        }

        console.log('Escalation process complete.');

    } catch (err) {
        console.error('Error during grievance escalation process:', err);
    } finally {
        // Close the database connection if the pool was created with end() capability
        if (db.end) db.end();
    }
};

checkAndEscalateGrievances();