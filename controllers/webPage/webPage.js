const multer = require("multer");
const fs = require("fs");
const path = require("path");
const contactInfo = require("../../model/schema/contactUs");
const mongoose = require("mongoose");


const contactUs = async (req, res) => {
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

const getContact = async (req, res) => {
  try {
    let contact = await contactInfo.findOne();

    if (!contact) {
      // Create default contact if none exists
      contact = new contactInfo({
        phone: '+1 (555) 123-4567',
        phoneNote: '24/7 Customer Service',
        email: 'info@luxuryhotel.com',
        emailNote: "We'll respond within 24 hours",
        address: '123 Luxury Street, Premium City, PC 12345, United States',
        frontDeskHours: '24 hours a day, 7 days a week',
        frontDeskNote: 'Always here to assist you',
        departments: {
          reservations: 'reservations@luxuryhotel.com',
          events: 'events@luxuryhotel.com',
          guestServices: 'concierge@luxuryhotel.com',
          billing: 'billing@luxuryhotel.com'
        }
      });
      await contact.save();
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error('Error fetching/creating contact info:', error);
    res.status(500).json({ message: 'Failed to retrieve contact info' });
  }
};

module.exports = {
  contactUs,
  updateContactUs,
  getContactUsById,
  getContact
};

