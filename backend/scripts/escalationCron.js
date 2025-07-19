import { db } from '../config/db.js';
import { sendEscalationNotification } from '../utils/mail.js';

const checkAndEscalateGrievances = async () => {
    console.log('Running escalation check...');
    try {
        // Step 1: Find all grievances that have breached their deadline and are not resolved
        const findGrievancesSQL = `
            SELECT
                g.id,
                g.ticket_id,
                g.title,
                g.escalation_level
            FROM grievances g
            WHERE
                g.status != 'Resolved'
                AND g.resolution_deadline < NOW();
        `;

        const [grievancesToEscalate] = await db.promise().query(findGrievancesSQL);

        if (grievancesToEscalate.length === 0) {
            console.log('No grievances to escalate.');
            return;
        }

        console.log(`Found ${grievancesToEscalate.length} grievance(s) to process for escalation.`);

        // Get all authority and admin emails once
        const [authorities] = await db.promise().query('SELECT email FROM approving_authorities');
        const authorityEmails = authorities.map(a => a.email);
        const [admins] = await db.promise().query('SELECT email FROM admins');
        const adminEmails = admins.map(a => a.email);

        // Step 2: Process each grievance
        for (const grievance of grievancesToEscalate) {
            const newEscalationLevel = grievance.escalation_level + 1;

            // Update the escalation level for the grievance
            await db.promise().query('UPDATE grievances SET escalation_level = ? WHERE id = ?', [newEscalationLevel, grievance.id]);
            console.log(`Grievance ${grievance.ticket_id} escalated to level ${newEscalationLevel}.`);

            // Step 3: Send notifications based on the new level
            if (newEscalationLevel === 1) {
                // Notify Approving Authorities on first escalation
                console.log(`Notifying Approving Authority for ${grievance.ticket_id}`);
                for (const authorityEmail of authorityEmails) {
                    await sendEscalationNotification(grievance, authorityEmail, newEscalationLevel);
                }
            } else if (newEscalationLevel >= 2) {
                // Notify Admins on second or subsequent escalations
                console.log(`Notifying Admin for ${grievance.ticket_id}`);
                for (const adminEmail of adminEmails) {
                    await sendEscalationNotification(grievance, adminEmail, newEscalationLevel);
                }
            }
        }

        console.log('Escalation process complete.');

    } catch (err) {
        console.error('Error during grievance escalation process:', err);
    } finally {
        if (db.end) db.end();
    }
};

checkAndEscalateGrievances();
