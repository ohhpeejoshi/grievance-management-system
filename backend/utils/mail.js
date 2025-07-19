import nodemailer from "nodemailer";
import dotenv from "dotenv";
import PDFDocument from 'pdfkit';

// ... (existing code: transporter, sendEmail, and other send... functions)
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

export const sendOtpEmail = async (email, otp) => {
    const subject = "Your OTP for Login";
    const html = `<p>Your OTP for login is: <strong>${otp}</strong></p><p>Do not share this OTP with anyone.</p>`;
    await sendEmail(email, subject, html);
};

export const sendRegistrationEmail = async (email, name) => {
    const subject = "Welcome to the LNMIIT Grievance Portal!";
    const html = `
        <p>Hi ${name},</p>
        <p>Thank you for registering at the LNMIIT Grievance Portal.</p>
        <br>
        <p>Regards,<br/>LNMIIT Team</p>
    `;
    await sendEmail(email, subject, html);
};

export const sendGrievanceStatusUpdateEmail = async (userEmail, userName, ticketId, newStatus) => {
    const subject = `Grievance Update: Your ticket ${ticketId} is now ${newStatus}`;
    const html = `
        <p>Hi ${userName},</p>
        <p>The status of your grievance with Ticket ID <strong>${ticketId}</strong> has been updated.</p>
        <p>New Status: <strong>${newStatus}</strong></p>
        <br>
        <p>Regards,<br/>LNMIIT Grievance Team</p>
    `;
    await sendEmail(userEmail, subject, html);
};

export const sendGrievanceAssignedEmailToUser = async (userEmail, userName, ticketId, worker) => {
    const subject = `Your Grievance ${ticketId} has been assigned`;
    const html = `
        <p>Hi ${userName},</p>
        <p>Your grievance is now "In Progress". You may contact the assigned worker for updates:</p>
        <ul>
            <li><strong>Name:</strong> ${worker.name}</li>
            <li><strong>Email:</strong> ${worker.email}</li>
            <li><strong>Phone:</strong> ${worker.phone_number}</li>
        </ul>
        <br>
        <p>Regards,<br/>LNMIIT Grievance Team</p>
    `;
    await sendEmail(userEmail, subject, html);
};

export const sendGrievanceAssignedEmailToWorker = async (workerEmail, workerName, ticketId, grievance, officeBearer) => {
    const subject = `New Grievance Assigned to You: ${ticketId}`;

    let html = `
        <p>Hi ${workerName},</p>
        <p>A new grievance has been assigned to you.</p>
        <ul>
            <li><strong>Ticket ID:</strong> ${grievance.ticket_id}</li>
            <li><strong>Title:</strong> ${grievance.title}</li>
            <li><strong>Description:</strong> ${grievance.description}</li>
            <li><strong>Location:</strong> ${grievance.location}</li>
            <li><strong>Complainant:</strong> ${grievance.complainant_name}</li>
            <li><strong>Contact:</strong> ${grievance.mobile_number}</li>
        </ul>
        <p>Please address it at your earliest convenience.</p>
    `;

    if (officeBearer) {
        html += `
            <hr>
            <h3>Assigned By</h3>
            <p>For any clarifications, please contact the assigning office bearer:</p>
            <ul>
                <li><strong>Name:</strong> ${officeBearer.name}</li>
                <li><strong>Email:</strong> ${officeBearer.email}</li>
                <li><strong>Phone:</strong> ${officeBearer.mobile_number}</li>
            </ul>
        `;
    }
    html += `<br><p>Regards,<br/>LNMIIT Grievance Team</p>`;

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
        const pdfData = Buffer.concat(buffers);

        const attachments = [];
        if (grievance.attachment) {
            attachments.push({
                filename: `user_attachment_${ticketId}.jpg`,
                path: grievance.attachment,
            });
        }
        attachments.push({
            filename: `Grievance-Summary-${ticketId}.pdf`,
            content: pdfData,
            contentType: 'application/pdf'
        });

        await sendEmail(workerEmail, subject, html, attachments);
    });

    doc.fontSize(20).text('Grievance Report', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(16).text(`Ticket ID: ${grievance.ticket_id}`);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(12);
    doc.font('Helvetica-Bold').text('Title: ', { continued: true }).font('Helvetica').text(grievance.title);
    doc.font('Helvetica-Bold').text('Status: ', { continued: true }).font('Helvetica').text(grievance.status);
    doc.font('Helvetica-Bold').text('Urgency: ', { continued: true }).font('Helvetica').text(grievance.urgency);
    doc.font('Helvetica-Bold').text('Submitted On: ', { continued: true }).font('Helvetica').text(new Date(grievance.created_at).toLocaleString());
    doc.font('Helvetica-Bold').text('Category: ', { continued: true }).font('Helvetica').text(grievance.category_name);
    doc.font('Helvetica-Bold').text('Location: ', { continued: true }).font('Helvetica').text(grievance.location);
    doc.moveDown(2);

    doc.fontSize(14).font('Helvetica-Bold').text('Complainant Details');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(12).font('Helvetica');
    doc.font('Helvetica-Bold').text('Name: ', { continued: true }).font('Helvetica').text(grievance.complainant_name);
    doc.font('Helvetica-Bold').text('Roll Number: ', { continued: true }).font('Helvetica').text(grievance.roll_number || 'N/A');
    doc.font('Helvetica-Bold').text('Email: ', { continued: true }).font('Helvetica').text(grievance.email);
    doc.font('Helvetica-Bold').text('Mobile: ', { continued: true }).font('Helvetica').text(grievance.mobile_number);
    doc.moveDown(2);

    doc.fontSize(14).font('Helvetica-Bold').text('Description');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(grievance.description, { align: 'justify' });
    doc.moveDown();

    doc.moveDown(4);
    doc.moveTo(350, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(10).text('Signature (if satisfied)', { width: 200, align: 'right' });

    doc.end();
};


export const sendEscalationNotification = async (grievance, recipientEmail, level) => {
    const subject = `Grievance Escalated to Level ${level}: Ticket ${grievance.ticket_id}`;
    const html = `
        <p>This is an automated notification.</p>
        <p>The grievance with Ticket ID <strong>${grievance.ticket_id}</strong> ("${grievance.title}") has breached its resolution deadline and has been escalated to <strong>Level ${level}</strong>.</p>
        <p>This issue requires immediate attention.</p>
        <br>
        <p>Regards,<br/>LNMIIT Grievance System</p>
    `;
    await sendEmail(recipientEmail, subject, html);
};

// NEW: Email for when Admin reverts a grievance
export const sendRevertNotificationEmail = async (grievance, comment, adminEmail, authorityEmails) => {
    const subject = `Action Required: Grievance ${grievance.ticket_id} Reverted by Admin`;
    const html = `
        <p>To the Approving Authority,</p>
        <p>The grievance with Ticket ID <strong>${grievance.ticket_id}</strong> has been reverted from Level 2 escalation back to Level 1 by the administrator (${adminEmail}).</p>
        <p>A new resolution deadline has been set. Please review the case and take appropriate action.</p>
        <hr>
        <p><strong>Admin's Comment:</strong></p>
        <p><em>${comment}</em></p>
        <hr>
        <br>
        <p>Regards,<br/>LNMIIT Grievance System</p>
    `;
    // Send to all approving authorities
    await sendEmail(authorityEmails.join(','), subject, html);
};
