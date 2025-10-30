const ContactMessage = require("../../model/schema/contactusmsg");
const mongoose = require("mongoose");

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
