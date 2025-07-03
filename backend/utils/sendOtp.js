import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendOtpEmail = async (email, otp) => {
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
        subject: "Your OTP for Login",
        html: `<p>Your OTP for login is: <strong>${otp}</strong></p><p>Do not share this OTP with anyone.</p>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("OTP email sent:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send OTP email");
    }
};
