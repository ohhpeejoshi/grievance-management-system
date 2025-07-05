import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// … your existing sendOtpEmail and sendRegistrationEmail …

/**
 * Send the user their grievance ticket ID and resolution timeline.
 *
 * @param {string} email       Recipient’s email address
 * @param {string} name        Complainant's name
 * @param {string} ticketId    Generated ticket ID (e.g. lnm/2025/07/0001)
 * @param {string} urgency     Urgency level (“Normal”, “High”, “Emergency”)
 * @param {string} resolveIn   Resolution timeline (e.g. “5 working days”)
 */
export const sendTicketIdEmail = async (email, name, ticketId, urgency, resolveIn) => {
    if (!email) {
        console.error("sendTicketIdEmail: missing recipient email, aborting send");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"LNMIIT Grievance Portal" <${process.env.EMAIL_USER}>`,
        to: `"${name}" <${email}>`,         // 👈 make it explicit
        subject: `Your Grievance Ticket ${ticketId}`,
        html: `
      <p>Hi ${name},</p>
      <p>Your grievance has been received. Here are the details:</p>
      <ul>
        <li><strong>Ticket ID:</strong> ${ticketId}</li>
        <li><strong>Urgency:</strong> ${urgency}</li>
        <li><strong>Expected Resolution Time:</strong> ${resolveIn}</li>
      </ul>
      <br/>
      <p>Regards,<br/>LNMIIT Grievance Team</p>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Ticket ID email sent:", info.response);
    } catch (err) {
        console.error("Error sending ticket ID email:", err);
        throw err;    // re‑throw so the controller’s .catch can pick it up
    }
};
