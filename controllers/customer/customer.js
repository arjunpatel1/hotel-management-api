


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
    const uploadDir = "uploads/customer/Idproof";
    const fileName = file.originalname;
    const filePath = path.join(uploadDir, fileName);

    if (fs.existsSync(filePath)) {
      const timestamp = Date.now() + Math.floor(Math.random() * 90);
      const uniqueFileName = `${fileName.split(".")[0]}-${timestamp}.${
        fileName.split(".")[1]
      }`;
      cb(null, uniqueFileName);
    } else {
      cb(null, fileName);
    }
  }
});
const upload = multer({ storage });

const addItems = async (req, res) => {
  try {
    req.body.createdDate = new Date();
    const filePath = `uploads/customer/Idproof/${req.files.idFile[0].filename}`;
    req.body.idFile = filePath;

    if (req.files && req.files.idFile2) {
      const filePath2 = `uploads/customer/Idproof/${req.files.idFile2[0].filename}`;
      req.body.idFile2 = filePath2;
    }

    const isCustomerAlreadyExists = await customer.findOne({
      phoneNumber: req.body.phoneNumber
    });
    if (isCustomerAlreadyExists) {
      return res
        .status(400)
        .json({ error: "Please enter a unique phone number" });
    }
    const customerObj = await customer.create(req.body);
    res.status(200).json(customerObj);
  } catch (err) {
    console.error("Failed to add customer:", err);
    res.status(400).json({ error: "Failed to Add customer" });
  }
};

// ======================= DO RESERVATION ONLINE =======================
const doReservationOnline = async (req, res) => {
  const token = req.headers.token;
  const hotelId = new mongoose.Types.ObjectId(req.body.hotelId);
  console.log(req.body, "req.body");

  const isReservationAlreadyExistsOrPending = await reservation.findOne({
    roomNo: req.body.roomNo,
    hotelId: req.body.hotelId,
    $and: [
      { checkInDate: { $lte: parseDateOnly(req.body.checkOutDate) } },
      { checkOutDate: { $gte: parseDateOnly(req.body.checkInDate) } },
      { status: "active" }
    ]
  });

  if (isReservationAlreadyExistsOrPending) {
    return res.status(400).json({
      error: "This room is already reserved on the given check-in date."
    });
  }

  // Customers array expected in req.body.customers (JSON body, not FormData)
  const customers = await Promise.all(
    req.body.customers.map(async (customerItem) => {
      const check = await customer.findOne({
        phoneNumber: customerItem.phoneNumber
      });

      console.log("customrs data check ", check);
      if (check) {
        await customer.updateOne(
          { _id: check._id },
          { $inc: { reservations: 1 } }
        );
        return check._id;
      }

      let customerObj = new customer({
        ...customerItem,
        reservations: 1,
        createdDate: new Date(),
        hotelId: hotelId
      });
      await customerObj.save();
      return customerObj._id;
    })
  );

  // 🔹 Read adults & kids from body (string → number)
  const adults = Number(req.body.adults || 0);
  const kids = Number(req.body.kids || 0);

  // Create reservation
  const reservationObj = new reservation({
    roomNo: req.body.roomNo,
    addBeds: req.body.addBeds,
    noOfBeds: req.body.noOfBeds,
    extraBedsCharge: req.body.extraBedsCharge,
    perBedAmount: req.body.perBedAmount,
    roomType: req.body.roomType,
    checkInDate: parseDateOnly(req.body.checkInDate),
    checkOutDate: parseDateOnly(req.body.checkOutDate),
    advanceAmount: req.body.advanceAmount,
    totalAmount: req.body.totalAmount,
    advancePaymentMethod: req.body.advancePaymentMethod,
    paymentOption: req.body.advancePaymentMethod,
    bookingId: req.body.bookingId,
    hotelId: hotelId,
    adults, // 🔹 saved here
    kids,   // 🔹 saved here
    customers: customers,
    createdDate: new Date()
  });

  await reservationObj.save();

  // Optional: email sending if needed, using hotelModel & sendEmailToCustomers

  return res.status(200).json({
    message: "Reservation successful",
    reservation: reservationObj
  });
};

// ======================= DO RESERVATION OFFLINE =======================
const doReservation = async (req, res) => {
  console.log("request================>>>>>>>>>>>>", req?.body);
  const token = req.headers.token;
  const hotelId = new mongoose.Types.ObjectId(req.body.hotelId);
  console.log(req.body, "offline reservATION");
  try {
    const isReservationAlreadyExistsOrPending = await reservation.findOne({
      roomNo: req.body.roomNo,
      hotelId: req?.body?.hotelId,
      $and: [
        {
          checkInDate: { $lte: req.body.checkOutDate }
        },
        {
          checkOutDate: { $gte: req.body.checkInDate }
        },
        {
          status: "active"
        }
      ]
    });

    if (isReservationAlreadyExistsOrPending) {
      return res.status(400).json({
        error: "This room is already reserved on the given checkIn Date"
      });
    }

    // 🔹 Adults & kids come from FormData body (strings)
    const adults = Number(req.body.adults || 0);
    const kids = Number(req.body.kids || 0);

    /** booking save */
    let reservationObj = new reservation();
    reservationObj.roomNo = req.body.roomNo;
    reservationObj.addBeds = req.body.addBeds;
    reservationObj.noOfBeds = req.body.noOfBeds;
    reservationObj.extraBedsCharge = req.body.extraBedsCharge;
    reservationObj.perBedAmount = req.body.perBedAmount;
    reservationObj.roomType = req.body.roomType;
    reservationObj.checkInDate = req.body.checkInDate;
    reservationObj.checkOutDate = req.body.checkOutDate;
    reservationObj.advanceAmount = req.body.advanceAmount;
    reservationObj.totalAmount = req.body.totalAmount;
    reservationObj.advancePaymentMethod = req.body.advancePaymentMethod;
    reservationObj.paymentOption = req.body.advancePaymentMethod;
    reservationObj.hotelId = hotelId;
    reservationObj.adults = adults; // 🔹 saved here
    reservationObj.kids = kids;     // 🔹 saved here
    reservationObj.createdDate = new Date();
    await reservationObj.save();

    console.log("req.body.customers", req.body.customers);

    // customers is JSON string in FormData → parse
    const customers = await Promise.all(
      JSON.parse(req.body.customers).map(async (customerItem, index) => {
        const check = await customer.findOne({
          phoneNumber: customerItem.phoneNumber
        });

        console.log("customrs data check ", check);
        if (check) {
          await customer.updateOne(
            { _id: check._id },
            { $inc: { reservations: 1 } }
          );
          return check._id;
        }

        const filePath = `uploads/customer/Idproof/${req.files[index].filename}`;
        customerItem.idFile = filePath;

        let customerObj = new customer({
          ...customerItem,
          reservations: 1,
          createdDate: new Date(),
          hotelId: hotelId
        });
        await customerObj.save();
        return customerObj._id;
      })
    );

    const hotelDetails = await hotelModel.findById(req.body.hotelId);
    console.log(hotelDetails.mailReservationButtonStatus);

    if (hotelDetails.mailReservationButtonStatus) {
      await sendEmailToCustomers(token, req?.body, hotelDetails);
    }
    console.log("customers.................", customers);
    await reservation.updateOne({ _id: reservationObj._id }, { customers });

    return res.status(200).json({ reservationObj });
  } catch (err) {
    console.error("Failed to do reservation:", err);
    return res.status(400).json({ error: "Failed to add reservation" });
  }
};

const sendEmailToCustomers = async (token, reservationObj, hotelDetails) => {
  console.log("reservationObjreservationObj", reservationObj);
  try {
    Promise.all(
      JSON.parse(reservationObj?.customers).map((item) => {
        const reservationDetails = `
  <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333;">
    
    <!-- Header Section -->
    <div style="background-color: #4CAF50; color: white; padding: 15px; text-align: center;">
      <h2 style="margin: 0;">Your Reservation Details</h2>
    </div>

    <!-- Body Section -->
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #ddd; padding: 20px; box-sizing: border-box;">
      <p style="font-size: 16px; line-height: 1.6;">Dear Customer,</p>
      <p style="font-size: 16px; line-height: 1.6;">Thank you for choosing <strong>${hotelDetails.name}</strong> for your stay. Below are your reservation details:</p>
      <ul style="font-size: 16px; line-height: 1.6;">
        <li><strong>Room Number:</strong> ${reservationObj.roomNo}</li>
        <li><strong>Room Type:</strong> ${reservationObj.roomType}</li>
        <li><strong>Number of Beds:</strong> ${reservationObj.noOfBeds}</li>
        <li><strong>Additional Beds:</strong> ${reservationObj.addBeds ? reservationObj.addBeds : 0}</li>
        <li><strong>Check-in Date:</strong> ${reservationObj.checkInDate}</li>
        <li><strong>Check-out Date:</strong> ${reservationObj.checkOutDate}</li>
        <li><strong>Advance Amount Paid:</strong> ${reservationObj.advanceAmount}</li>
        <li><strong>Total Amount:</strong> ${reservationObj.totalAmount}</li>
        <li><strong>Payment Method:</strong> ${reservationObj.advancePaymentMethod}</li>
      </ul>
      <p style="font-size: 16px; line-height: 1.6;">We look forward to hosting you. If you have any questions or need assistance, please feel free to contact us.</p>
    </div>

    <!-- Footer Section -->
    <div style="background-color: #f4f4f4; color: #777; text-align: center; padding: 15px;">
      <p style="margin: 0;">Best regards,</p>
      <p style="margin: 0;"><strong>The ${hotelDetails.name} Team</strong></p>
    </div>
  </div>
`;

        return sendEmail(
          item?.email,
          "Reservation Confirmation - Your Booking Details",
          reservationDetails,
          token
        );
      })
    );
  } catch (err) {
    console.error("Failed to do reservation:", err);
  }
};

// ======================= CUSTOMER LIST & CRUD =======================

const getAllItems = async (req, res) => {
  const hotelId = req.params.hotelId;
  console.log("hotelId=>", hotelId);

  try {
    let customerData = await customer.aggregate([
      {
        $match: {
          hotelId: new mongoose.Types.ObjectId(hotelId)
        }
      },
      {
        $addFields: {
          idFile: { $concat: [process.env.BASE_URL, "$idFile"] },
          idFile2: { $concat: [process.env.BASE_URL, "$idFile2"] },
          fullName: {
            $concat: ["$firstName", " ", "$lastName"]
          }
        }
      }
    ]);

    if (!customerData)
      return res.status(404).json({ message: "no Data Found." });
    console.log("customerData ==========>", customerData);
    res.status(200).json({ customerData });
  } catch (error) {
    console.error("Failed to fetch item data:", error);
    res.status(400).json({ error: "Failed to fetch item data" });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customerData = await customer.find();

    if (customerData.length === 0)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ customerData });
  } catch (error) {
    console.error("Failed to fetch customer data:", error);
    res.status(400).json({ error: "Failed to fetch customer data" });
  }
};

const getSpecificCustomer = async (req, res) => {
  const phoneNumber = req.params.phone;
  const hotelId = req.query.hotelId;

  console.log("phoneNumber and hotelId ===>", phoneNumber, "==>", hotelId);

  try {
    let customerData = await customer.aggregate([
      {
        $match: {
          phoneNumber: phoneNumber,
          hotelId: new mongoose.Types.ObjectId(hotelId)
        }
      },
      {
        $addFields: {
          idFile: { $concat: [process.env.BASE_URL, "$idFile"] },
          idFile2: { $concat: [process.env.BASE_URL, "$idFile2"] },
          fullName: {
            $concat: ["$firstName", " ", "$lastName"]
          }
        }
      }
    ]);

    if (customerData.length === 0)
      return res.status(404).json({ message: "No data found." });
    res.status(200).json({ customerData });
  } catch (error) {
    console.error("Failed to fetch customer data:", error);
    res.status(500).json({ error: "Failed to fetch customer data" });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await customer.deleteOne({ phoneNumber: req.params.phone });
    res.status(200).json({ message: "done", item });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

const editShift = async (req, res) => {
  try {
    let result = await customer.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to Update shift:", err);
    res.status(400).json({ error: "Failed to Update shift" });
  }
};

const editcustomer = async (req, res) => {
  try {
    const customerRecord = await customer.findById(req.params.id);
    if (!customerRecord) {
      return res.status(404).json({ error: "Customer not found" });
    }

    console.log(req.files, "req.files");
    if (req.files && req.files.idFile) {
      const filePath = `uploads/customer/Idproof/${req.files.idFile[0].filename}`;
      req.body.idFile = filePath;
    }

    if (req.files && req.files.idFile2) {
      const filePath2 = `uploads/customer/Idproof/${req.files.idFile2[0].filename}`;
      req.body.idFile2 = filePath2;
    }

    console.log(req.body);
    await customer.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );

    res.status(200).json({ message: "Customer updated successfully" });
  } catch (err) {
    console.error("Failed to update customer:", err);
    res.status(400).json({ error: "Failed to update customer" });
  }
};

const reservationHistory = async (req, res) => {
  const { customerObjId } = req.params;
  const { hotelId } = req.query;

  console.log("Customer ObjId ==>", customerObjId);
  console.log("hotelId ==>", hotelId);

  try {
    const customerObjectId = new ObjectId(customerObjId);
    console.log("customerObjectId converted ==>", customerObjectId);

    const hisreservations = await reservation.find({
      customers: customerObjectId,
      hotelId: hotelId
    });

    console.log("Reservations fetched ==>", hisreservations);
    res.status(200).json(hisreservations);
  } catch (error) {
    console.error("Failed to get customer history:", error);
    res.status(500).json({ error: "Failed to get customer history" });
  }
};

module.exports = {
  addItems,
  deleteItem,
  upload,
  getAllItems,
  editShift,
  editcustomer,
  getAllCustomers,
  getSpecificCustomer,
  doReservation,
  reservationHistory,
  doReservationOnline
};
