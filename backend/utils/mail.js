import nodemailer from "nodemailer";
import dotenv from "dotenv";
import PDFDocument from 'pdfkit';

dotenv.config();

// Helper function to create a standardized, styled email template
const createStyledEmail = (subject, contentHtml) => {
    // Make sure to set FRONTEND_URL in your .env file, e.g., FRONTEND_URL=https://gmp-user-ui41.vercel.app
    const frontendUrl = process.env.FRONTEND_URL || '#';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; margin: 0; padding: 0; background-color: #f4f7f6; }
            .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
            .email-header { background-color: #f8f8f8; padding: 20px; text-align: center; border-bottom: 1px solid #e0e0e0;}
            .email-header img { max-width: 220px; }
            .email-body { padding: 30px; font-size: 16px; line-height: 1.6; color: #333333; }
            .email-body p { margin: 0 0 15px 0; }
            .email-body h2 { color: #004a9c; margin-top: 0; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { display: inline-block; padding: 14px 28px; background-color: #005A9C; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .email-footer { background-color: #f8f8f8; padding: 20px; font-size: 14px; color: #888888; text-align: center; border-top: 1px solid #e0e0e0; }
            ul { list-style-type: none; padding-left: 0; }
            li { background: #fafafa; margin-bottom: 8px; padding: 12px; border-left: 4px solid #005A9C; border-radius: 4px; }
            li strong { color: #333; }
            blockquote { border-left: 4px solid #ccc; padding-left: 15px; margin: 20px 0; font-style: italic; color: #555; }
            hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <img src="https://gmp-user-ui41.vercel.app/gmp-logo-preview.png" alt="LNMIIT Grievance Portal Logo">
            </div>
            <div class="email-body">
                ${contentHtml}
            </div>
            <div class="email-footer">
                <p>This is an automated message. Please do not reply directly to this email.</p>
                <p>&copy; ${new Date().getFullYear()} LNMIIT Grievance Management Portal</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, html, attachments = []) => {
    const mailOptions = {
        from: `"LNMIIT Grievance Portal" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
    } catch (error) {
        console.error("--- NODEMAILER ERROR ---", error);
        throw new Error("Failed to send email via Nodemailer.");
    }
};

export const sendRegistrationEmail = async (email, name) => {
    const subject = "Welcome to the LNMIIT Grievance Portal!";
    const content = `
        <h2>Welcome, ${name}!</h2>
        <p>Thank you for registering for the LNMIIT Grievance Management Portal. We're glad to have you on board.</p>
        <p>You can now log in to submit and track your grievances. Our goal is to provide a transparent and efficient platform for addressing your concerns.</p>
        <div class="button-container">
            <a href="${process.env.FRONTEND_URL || '#'}/login" class="button">Go to Login</a>
        </div>
        <p>Best regards,<br>The LNMIIT Grievance Team</p>
    `;
    const html = createStyledEmail(subject, content);
    await sendEmail(email, subject, html);
};

export const sendGrievanceStatusUpdateEmail = async (userEmail, userName, ticketId, newStatus) => {
    const subject = `Grievance Update: Your ticket ${ticketId} is now ${newStatus}`;
    const content = `
        <h2>Grievance Status Update</h2>
        <p>Hi ${userName},</p>
        <p>The status of your grievance with Ticket ID <strong>${ticketId}</strong> has been updated to:</p>
        <p style="text-align:center; font-size: 20px; font-weight: bold; color: #005A9C;">${newStatus}</p>
        <div class="button-container">
             <a href="${process.env.FRONTEND_URL || '#'}/track-grievance" class="button">Track Your Grievance</a>
        </div>
        <p>Regards,<br>LNMIIT Grievance Team</p>
    `;
    const html = createStyledEmail(subject, content);
    await sendEmail(userEmail, subject, html);
};

export const sendGrievanceAssignedEmailToUser = async (userEmail, userName, ticketId, worker) => {
    const subject = `Action has been taken on your Grievance ${ticketId}`;
    const content = `
        <h2>Grievance In Progress</h2>
        <p>Hi ${userName},</p>
        <p>Your grievance with Ticket ID <strong>${ticketId}</strong> is now "In Progress" and has been assigned to a concerned authority for resolution.</p>
        <p>For any urgent updates, you may contact the assigned personnel:</p>
        <ul>
            <li><strong>Name:</strong> ${worker.name}</li>
            <li><strong>Email:</strong> ${worker.email}</li>
            <li><strong>Phone:</strong> ${worker.phone_number}</li>
        </ul>
        <p>We appreciate your patience as we work to resolve your issue.</p>
        <p>Regards,<br>LNMIIT Grievance Team</p>
    `;
    const html = createStyledEmail(subject, content);
    await sendEmail(userEmail, subject, html);
};

export const sendGrievanceAssignedEmailToWorker = async (workerEmail, workerName, ticketId, grievance, officeBearer) => {
    const subject = `New Grievance Assigned to You: ${ticketId}`;
    const content = `
        <h2>New Grievance Assignment</h2>
        <p>Hi ${workerName},</p>
        <p>A new grievance has been assigned to you. Please review the details in the attached PDF and take appropriate action.</p>
        ${officeBearer ? `
            <hr>
            <h3>Assigned By (Office Bearer)</h3>
            <ul>
                <li><strong>Name:</strong> ${officeBearer.name}</li>
                <li><strong>Email:</strong> ${officeBearer.email}</li>
                <li><strong>Phone:</strong> ${officeBearer.mobile_number}</li>
            </ul>
        ` : ''}
        <p>Regards,<br>LNMIIT Grievance System</p>
    `;
    const html = createStyledEmail(subject, content);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
        const pdfData = Buffer.concat(buffers);
        const attachments = [{
            filename: `Grievance-Summary-${ticketId}.pdf`,
            content: pdfData,
            contentType: 'application/pdf'
        }];
        if (grievance.attachment) {
            attachments.push({
                filename: `user_attachment_${ticketId}.jpg`, // Assuming jpg, adjust if needed
                path: grievance.attachment,
            });
        }
        await sendEmail(workerEmail, subject, html, attachments);
    });

    doc.fontSize(20).text('Grievance Report', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(16).text(`Ticket ID: ${grievance.ticket_id}`);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(12);
    doc.font('Helvetica-Bold').text('Title: ', { continued: true }).font('Helvetica').text(grievance.title);
    doc.font('Helvetica-Bold').text('Urgency: ', { continued: true }).font('Helvetica').text(grievance.urgency);
    doc.font('Helvetica-Bold').text('Location: ', { continued: true }).font('Helvetica').text(grievance.location);
    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica-Bold').text('Complainant Details');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(12).font('Helvetica');
    doc.font('Helvetica-Bold').text('Name: ', { continued: true }).font('Helvetica').text(grievance.complainant_name);
    doc.font('Helvetica-Bold').text('Email: ', { continued: true }).font('Helvetica').text(grievance.email);
    doc.font('Helvetica-Bold').text('Mobile: ', { continued: true }).font('Helvetica').text(grievance.mobile_number);
    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica-Bold').text('Description');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(grievance.description, { align: 'justify' });
    doc.end();
};

export const sendEscalationNotification = async (grievance, recipientEmail, level) => {
    const subject = `URGENT: Grievance Escalated to Level ${level} - Ticket ${grievance.ticket_id}`;
    const content = `
        <h2>Grievance Escalation Notice</h2>
        <p>This is an automated notification to alert you that the grievance with Ticket ID <strong>${grievance.ticket_id}</strong> titled "<em>${grievance.title}</em>" has been automatically escalated to <strong>Level ${level}</strong> due to a delay in resolution.</p>
        <p>This issue requires your immediate attention.</p>
        <p>Regards,<br>LNMIIT Grievance System</p>
    `;
    const html = createStyledEmail(subject, content);
    await sendEmail(recipientEmail, subject, html);
};

export const sendRevertNotificationEmail = async (grievance, comment, adminEmail, authorityEmails) => {
    const subject = `Action Required: Grievance ${grievance.ticket_id} Reverted by Admin`;
    const content = `
        <h2>Grievance Reverted to Level 1</h2>
        <p>To the Approving Authority,</p>
        <p>The grievance with Ticket ID <strong>${grievance.ticket_id}</strong> has been reverted to Level 1 by the administrator (${adminEmail}).</p>
        <p>Please review the case and take appropriate action promptly.</p>
        <hr>
        <p><strong>Administrator's Comment:</strong></p>
        <blockquote>${comment}</blockquote>
        <hr>
        <p>Regards,<br>LNMIIT Grievance System</p>
    `;
    const html = createStyledEmail(subject, content);
    await sendEmail(authorityEmails.join(','), subject, html);
};

export const sendRevertToOfficeBearerEmail = async (grievance, comment, authorityEmail, bearerEmails) => {
    const subject = `Action Required: Grievance ${grievance.ticket_id} Reverted by Approving Authority`;
    const content = `
        <h2>Grievance Reverted to Office Bearer</h2>
        <p>To the Office Bearers of the ${grievance.department_name} department,</p>
        <p>The escalated grievance with Ticket ID <strong>${grievance.ticket_id}</strong> has been reverted by the Approving Authority (${authorityEmail}). Please assign it for resolution.</p>
        <hr>
        <p><strong>Approving Authority's Comment:</strong></p>
        <blockquote>${comment}</blockquote>
        <hr>
        <p>Regards,<br>LNMIIT Grievance System</p>
    `;
    const html = createStyledEmail(subject, content);
    await sendEmail(bearerEmails.join(','), subject, html);
};

export const sendGrievanceTransferNotification = async (grievance, newDepartmentName, bearerEmails) => {
    const subject = `[Transferred] New Grievance Assigned to Your Department: ${grievance.ticket_id}`;
    const content = `
        <h2>Grievance Transfer Notification</h2>
        <p>To the Office Bearers of the ${newDepartmentName} department,</p>
        <p>The following grievance has been transferred to your department for resolution. Please review and assign it to a worker.</p>
        <hr>
        <h3>Grievance Details</h3>
        <ul>
            <li><strong>Ticket ID:</strong> ${grievance.ticket_id}</li>
            <li><strong>Title:</strong> ${grievance.title}</li>
        </ul>
        <hr>
        <p>Regards,<br>LNMIIT Grievance System</p>
    `;
    const html = createStyledEmail(subject, content);
    await sendEmail(bearerEmails.join(','), subject, html);
};