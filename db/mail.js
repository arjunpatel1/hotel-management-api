const nodemailer = require("nodemailer");
const getJWTPayload = require("../core/helper");
const { findSmtpDetails } = require("../controllers/hotel/hotel");

// Function to send an email
const sendEmail = async (to, subject, text, token) => {
  const payload = await getJWTPayload(token);
  const HotelId = payload?.HotelId;
  const smtpDetails = await findSmtpDetails(HotelId);
  try {
    // Create a transporter using the SMTP settings for Outlook
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: smtpDetails.mail,
        pass: smtpDetails.key,
      },
    });
    // user: "jairajlakher018@gmail.com",
    // pass: "cmzdorvvyarzphux",

    const mailOptions = {
      from: "jairajlakher018@gmail.com",
      to: to,
      subject: subject,
      html: text,   
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info.response;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};

module.exports = { sendEmail };
