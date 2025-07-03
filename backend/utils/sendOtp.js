import axios from "axios";
import dotenv from "dotenv"

dotenv.config();

export const sendOtpSMS = async (mobileNumber, otp) => {
    const message = `Your OTP for login is ${otp}. Do not share it with anyone.`;

    const data = {
        route: "v3",
        sender_id: "TXTIND",
        message,
        language: "english",
        numbers: mobileNumber,
    };

    try {
        const res = await axios.post("https://www.fast2sms.com/dev/bulkV2", data, {
            headers: {
                authorization: process.env.FAST2SMS_API_KEY,
            },
        });
        return res.data;
    } catch (err) {
        console.error("SMS send error:", err.response?.data || err.message);
        throw new Error("Failed to send OTP");
    }
};
