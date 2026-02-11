const ContactMessage = require("../../model/schema/contactusmsg");
const mongoose = require("mongoose");

const { findSmtpDetails } = require("../hotel/hotel");
const nodemailer = require("nodemailer");

const addContactMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message, hotelId } =
      req.body;

    const newMessage = new ContactMessage({
      firstName: firstName,
      lastName: lastName,
      emailAddress: email,
      phoneNumber: phone,
      subject: subject,
      message: message,
      hotelId: hotelId,
    });

    await newMessage.save();

    // --- EMAIL SENDING LOGIC ---
    try {
      if (hotelId) {
        const smtpDetails = await findSmtpDetails(hotelId);

        if (
          smtpDetails &&
          smtpDetails.mail &&
          smtpDetails.key &&
          smtpDetails.mail.trim() !== "" &&
          smtpDetails.key.trim() !== ""
        ) {
          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: smtpDetails.mail,
              pass: smtpDetails.key,
            },
          });

          const mailOptions = {
            from: smtpDetails.mail,
            to: smtpDetails.mail, // Send TO the hotel admin
            replyTo: email, // Reply to the customer
            subject: `New Inquiry: ${subject} - ${firstName} ${lastName}`,
            html: `
              <h3>New Contact Us Message</h3>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <br/>
              <p><strong>Message:</strong></p>
              <p>${message}</p>
            `,
          };

          const info = await transporter.sendMail(mailOptions);
          console.log("✅ Inquiry email sent to admin:", info.messageId);
        } else {
          console.warn("⚠️ SMTP details missing or incomplete for hotel:", hotelId);
        }
      }
    } catch (emailError) {
      console.error("❌ Failed to send inquiry email:", emailError);
      // We don't block the response if email fails, as the msg is saved in DB
    }
    // ---------------------------

    res
      .status(201)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json({ error: "Failed to send message" });
  }
};

const getAllMessages = async (req, res) => {
  const hotelId = req.params.hotelId;

  try {
    const objectHotelId = new mongoose.Types.ObjectId(hotelId);
    const messages = await ContactMessage.find({ hotelId: hotelId });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

const deleteUserData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Contact ID is required." });
    }

    const deletedUser = await ContactMessage.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", data: deletedUser });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

module.exports = { addContactMessage, getAllMessages, deleteUserData };
