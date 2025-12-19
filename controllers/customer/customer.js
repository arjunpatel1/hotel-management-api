const multer = require("multer");
const fs = require("fs");
const path = require("path");
const customer = require("../../model/schema/customer");
const mongoose = require("mongoose");
const reservation = require("../../model/schema/reservation");
const Room = require("../../model/schema/room");
const { sendEmail } = require("../../db/mail");
const hotelModel = require("../../model/schema/hotel");
const { parseDateOnly } = require("../../core/dateUtils");

const { ObjectId } = require("mongoose").Types;


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/customer/Idproof";
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname;
    const uploadDir = "uploads/customer/Idproof";
    const filePath = path.join(uploadDir, fileName);

    if (fs.existsSync(filePath)) {
      const timestamp = Date.now();
      const uniqueFileName = `${fileName.split(".")[0]}-${timestamp}.${fileName.split(".")[1]}`;
      cb(null, uniqueFileName);
    } else {
      cb(null, fileName);
    }
  },
});
const upload = multer({ storage });


const addItems = async (req, res) => {
  try {
    req.body.createdDate = new Date();

    if (req.files?.idFile) {
      req.body.idFile = `uploads/customer/Idproof/${req.files.idFile[0].filename}`;
    }

    if (req.files?.idFile2) {
      req.body.idFile2 = `uploads/customer/Idproof/${req.files.idFile2[0].filename}`;
    }

    const isCustomerAlreadyExists = await customer.findOne({
      phoneNumber: req.body.phoneNumber,
    });

    if (isCustomerAlreadyExists) {
      return res.status(400).json({
        error: "Please enter a unique phone number",
      });
    }

    const customerObj = await customer.create(req.body);
    res.status(200).json(customerObj);
  } catch (err) {
    console.error("Failed to add customer:", err);
    res.status(400).json({ error: "Failed to Add customer" });
  }
};


const safeBoolean = (val) => val === true || val === "true";
const safeNumber = (val) =>
  val === undefined || val === "undefined" || val === ""
    ? 0
    : Number(val);


const doReservationOnline = async (req, res) => {
  console.log("ONLINE RESERVATION =>", req.body);

  try {
    const hotelId = new mongoose.Types.ObjectId(req.body.hotelId);

    const alreadyReserved = await reservation.findOne({
      roomNo: req.body.roomNo,
      hotelId,
      $and: [
        { checkInDate: { $lte: parseDateOnly(req.body.checkOutDate) } },
        { checkOutDate: { $gte: parseDateOnly(req.body.checkInDate) } },
        { status: "active" },
      ],
    });

    if (alreadyReserved) {
      return res.status(400).json({
        error: "This room is already reserved for the selected dates",
      });
    }

    const customers =
      typeof req.body.customers === "string"
        ? JSON.parse(req.body.customers)
        : req.body.customers;

    const reservationObj = new reservation({
      roomNo: req.body.roomNo,
      addBeds: safeBoolean(req.body.addBeds),
      noOfBeds: safeNumber(req.body.noOfBeds),
      extraBedsCharge: safeNumber(req.body.extraBedsCharge),
      perBedAmount: safeNumber(req.body.perBedAmount),
      roomType: req.body.roomType,
      checkInDate: parseDateOnly(req.body.checkInDate),
      checkOutDate: parseDateOnly(req.body.checkOutDate),
      advanceAmount: safeNumber(req.body.advanceAmount),
      totalAmount: safeNumber(req.body.totalAmount),
      advancePaymentMethod: req.body.advancePaymentMethod,
      paymentOption: req.body.advancePaymentMethod,
      bookingId: req.body.bookingId,
      hotelId,
      customers,
      status: "pending",
      createdDate: new Date(),
    });

    await reservationObj.save();

    return res.status(200).json({
      message: "Online Reservation Successful",
      reservation: reservationObj,
    });
  } catch (err) {
    console.error("FAILED ONLINE RESERVATION:", err);
    return res.status(500).json({ error: err.message });
  }
};


const doReservation = async (req, res) => {
  console.log("OFFLINE RESERVATION =>", req.body);

  try {
    const hotelId = new mongoose.Types.ObjectId(req.body.hotelId);

    const alreadyBooked = await reservation.findOne({
      roomNo: req.body.roomNo,
      hotelId,
      $and: [
        { checkInDate: { $lte: req.body.checkOutDate } },
        { checkOutDate: { $gte: req.body.checkInDate } },
        { status: "active" },
      ],
    });

    if (alreadyBooked) {
      return res.status(400).json({
        error: "This room is already reserved on the given date",
      });
    }

    const customers =
      typeof req.body.customers === "string"
        ? JSON.parse(req.body.customers)
        : req.body.customers;

    const reservationObj = new reservation({
      roomNo: req.body.roomNo,
      addBeds: safeBoolean(req.body.addBeds),
      noOfBeds: safeNumber(req.body.noOfBeds),
      extraBedsCharge: safeNumber(req.body.extraBedsCharge),
      perBedAmount: safeNumber(req.body.perBedAmount),
      roomType: req.body.roomType,
      checkInDate: req.body.checkInDate,
      checkOutDate: req.body.checkOutDate,
      advanceAmount: safeNumber(req.body.advanceAmount),
      totalAmount: safeNumber(req.body.totalAmount),
      advancePaymentMethod: req.body.advancePaymentMethod,
      paymentOption: req.body.advancePaymentMethod,
      hotelId,
      customers,
      status: "pending",
      createdDate: new Date(),
    });

    await reservationObj.save();

    return res.status(200).json({
      message: "Offline Reservation Created Successfully",
      reservation: reservationObj,
    });
  } catch (err) {
    console.error("FAILED OFFLINE RESERVATION:", err);
    return res.status(500).json({ error: err.message });
  }
};


const reservationHistory = async (req, res) => {
  const { customerObjId } = req.params;
  const { hotelId } = req.query;

  try {
    const customerObjectId = new ObjectId(customerObjId);

    const hisreservations = await reservation.find({
      customers: customerObjectId,
      hotelId,
    });

    res.status(200).json(hisreservations);
  } catch (error) {
    console.error("Failed to get customer history:", error);
    res.status(500).json({ error: "Failed to get customer history" });
  }
};


module.exports = {
  addItems,
  deleteItem: async (req, res) => {
    const item = await customer.deleteOne({ phoneNumber: req.params.phone });
    res.status(200).json({ message: "done", item });
  },
  upload,
  getAllItems: async (req, res) => {
    const hotelId = req.params.hotelId;
    const customerData = await customer.find({
      hotelId: new mongoose.Types.ObjectId(hotelId),
    });
    res.status(200).json({ customerData });
  },
  editShift: async (req, res) => {
    const result = await customer.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json(result);
  },
  editcustomer: async (req, res) => {
    await customer.updateOne({ _id: req.params.id }, { $set: req.body });
    res.status(200).json({ message: "Customer updated successfully" });
  },
  getAllCustomers: async (req, res) => {
    const customerData = await customer.find();
    res.status(200).json({ customerData });
  },
  getSpecificCustomer: async (req, res) => {
    const phoneNumber = req.params.phone;
    const hotelId = req.query.hotelId;

    const customerData = await customer.find({
      phoneNumber,
      hotelId,
    });

    res.status(200).json({ customerData });
  },
  doReservation,
  reservationHistory,
  doReservationOnline,
};
