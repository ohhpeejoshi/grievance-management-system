// src/utils/mail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// you already have this:
export const sendOtpEmail = async (email, otp) => {
    /* … */
};

// new helper for registration confirmation:
export const sendRegistrationEmail = async (email, name) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"LNMIIT Grievance Portal" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to the LNMIIT Grievance Portal!",
        html: `
      <p>Hi ${name},</p>
      <p>Thank you for registering at the LNMIIT Grievance Portal.</p>
      <p>You can now log in and file your grievances:</p>
      <ul>
        <li><a href="${process.env.FRONTEND_URL}/login">Login to Portal</a></li>
      </ul>
      <p>If you did not register, please ignore this email.</p>
      <br>
      <p>Regards,<br/>LNMIIT Team</p>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Registration email sent:", info.response);
    } catch (err) {
        console.error("Error sending registration email:", err);

    }
};
