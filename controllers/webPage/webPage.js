const multer = require("multer");
const fs = require("fs");
const path = require("path");
const contactInfo = require("../../model/schema/contactUs");
const mongoose = require("mongoose");


const contactUs =  async (req, res) => {
  try {
    const contact = new contactInfo(req.body);
    const saved = await contact.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error saving contact info:', error);
    res.status(500).json({ message: 'Failed to save contact info' });
  }
};

const updateContactUs = async (req, res) => {
  try {
    const contactId = req.params.id;

    // Destructure fields from the request body
    const {
      phone,
      email,
      address,
      frontDeskHours,
      description,
      departments
    } = req.body;

    console.log("d============>", departments)
    // Update using $set with destructured fields
    const updated = await contactInfo.findByIdAndUpdate(
      contactId,
      {
        $set: {
          phone,
          email,
          address,
          frontDeskHours,
          description,
          departments
        }
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Contact info not found' });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating contact info:', error);
    res.status(500).json({ message: 'Failed to update contact info' });
  }
};



const getContactUsById = async (req, res) => {
  try {
    const contactId = req.params.id;
    const contact = await contactInfo.findById(contactId);

    if (!contact) {
      return res.status(404).json({ message: 'Contact info not found' });
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({ message: 'Failed to retrieve contact info' });
  }
};

module.exports = {
  contactUs,
  updateContactUs,
  getContactUsById
};

