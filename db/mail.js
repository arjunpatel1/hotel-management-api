

const nodemailer = require("nodemailer");
const getJWTPayload = require("../core/helper");
const { findSmtpDetails } = require("../controllers/hotel/hotel");


const sendEmail = async (to, subject, text, token) => {
  try {
    
    const payload = await getJWTPayload(token);
    const HotelId = payload?.HotelId;

    if (!HotelId) {
      console.warn("sendEmail: No HotelId in token, skipping email.");
      return null;
    }

    const smtpDetails = await findSmtpDetails(HotelId);

    if (
      !smtpDetails ||
      !smtpDetails.mail ||
      !smtpDetails.key ||
      smtpDetails.mail.trim() === "" ||
      smtpDetails.key.trim() === ""
    ) {
      console.warn(
        "sendEmail: SMTP details missing for hotel",
        HotelId.toString(),
        "=> skipping email."
      );
      return null; 
    }

   
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, 
      auth: {
        user: smtpDetails.mail,
        pass: smtpDetails.key, 
      },
    });

   
    const mailOptions = {
      from: smtpDetails.mail, 
      to,
      subject,
      html: text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId || info.response);
    return info;
  } catch (error) {
   
    console.error("❌ Failed to send email:", error.message || error);
    return null;
  }
};

module.exports = { sendEmail };
