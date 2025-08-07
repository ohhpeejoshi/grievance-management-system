import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Helper function to create a standardized, styled email template
const createStyledEmail = (subject, contentHtml) => {
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
            .otp-code { font-size: 28px; font-weight: bold; color: #D9531E; text-align: center; margin: 25px 0; padding: 15px; background-color: #fdf2e9; border-radius: 5px; letter-spacing: 3px; }
            .email-footer { background-color: #f8f8f8; padding: 20px; font-size: 14px; color: #888888; text-align: center; border-top: 1px solid #e0e0e0; }
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


export const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const subject = "Your One-Time Password for LNMIIT Portal";
    const content = `
        <h2>Verification Required</h2>
        <p>Dear User,</p>
        <p>To proceed with your request, please use the following One-Time Password (OTP). This code is valid for 60 seconds.</p>
        <div class="otp-code">${otp}</div>
        <p>If you did not request this code, you can safely ignore this email. Do not share this OTP with anyone.</p>
        <p>Thank you,<br>The LNMIIT Team</p>
    `;
    const html = createStyledEmail(subject, content);

    const mailOptions = {
        from: `"LNMIIT Grievance Portal" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("OTP email sent:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send OTP email");
    }
};