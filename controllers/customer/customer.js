


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
  }
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
      phoneNumber: req.body.phoneNumber
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

    let customerArray =
      typeof req.body.customers === "string"
        ? JSON.parse(req.body.customers)
        : req.body.customers;

    if (!Array.isArray(customerArray)) {
      return res.status(400).json({ error: "Invalid customers format" });
    }

    console.log("📁 Files received:", req.files ? req.files.length : 0);
    console.log("👥 Customers count:", customerArray.length);

    // ✅ Process ONLY PRIMARY CUSTOMER (index 0)
    let primaryCustomerId = null;
    const guestIdProofs = [];

    // Process primary customer (first in array)
    if (customerArray.length > 0) {
      const customerItem = customerArray[0];

      let existingCustomer = null;
      if (customerItem.phoneNumber && customerItem.phoneNumber.trim() !== '') {
        existingCustomer = await customer.findOne({
          phoneNumber: customerItem.phoneNumber
        });
      }

      if (existingCustomer) {
        let firstName = existingCustomer.firstName;
        let lastName = existingCustomer.lastName;

        if (customerItem.firstName) {
          firstName = customerItem.firstName;
          lastName = customerItem.lastName || "";
        } else if (customerItem.name) {
          const parts = customerItem.name.trim().split(" ");
          firstName = parts[0];
          lastName = parts.slice(1).join(" ");
        }

        let updateData = {
          firstName,
          lastName,
          email: customerItem.email || existingCustomer.email
        };

        if (req.files && req.files[0]) {
          const newIdFilePath = `uploads/customer/Idproof/${req.files[0].filename}`;
          updateData.idFile = newIdFilePath;
          guestIdProofs.push(newIdFilePath);
          console.log(`🔄 Updating primary customer: New ID file -> ${newIdFilePath}`);
        } else if (existingCustomer.idFile) {
          guestIdProofs.push(existingCustomer.idFile);
        }

        await customer.updateOne(
          { _id: existingCustomer._id },
          {
            $set: updateData,
            $inc: { reservations: 1 }
          }
        );

        console.log(`✅ Using existing primary customer: ${existingCustomer._id}`);
        primaryCustomerId = existingCustomer._id;
      } else {
        // Create new primary customer
        let firstName = "";
        let lastName = "";

        if (customerItem.firstName) {
          firstName = customerItem.firstName;
          lastName = customerItem.lastName || "";
        } else if (customerItem.name) {
          const parts = customerItem.name.trim().split(" ");
          firstName = parts[0];
          lastName = parts.slice(1).join(" ");
        }

        let idFilePath = null;
        if (req.files && req.files[0]) {
          idFilePath = `uploads/customer/Idproof/${req.files[0].filename}`;
          guestIdProofs.push(idFilePath);
        }

        const newPrimaryCustomer = await customer.create({
          phoneNumber: customerItem.phoneNumber,
          firstName,
          lastName,
          email: customerItem.email,
          idFile: idFilePath,
          reservations: 1,
          createdDate: new Date(),
          hotelId: hotelId
        });

        console.log(`💾 Created primary customer:`, {
          id: newPrimaryCustomer._id,
          name: `${firstName} ${lastName}`,
          phone: customerItem.phoneNumber,
          email: customerItem.email
        });

        primaryCustomerId = newPrimaryCustomer._id;
      }
    }

    // 👥 Process ASSOCIATE MEMBERS - Only store ID proofs, NO customer records
    for (let index = 1; index < customerArray.length; index++) {
      if (req.files && req.files[index]) {
        const idFilePath = `uploads/customer/Idproof/${req.files[index].filename}`;
        guestIdProofs.push(idFilePath);
        console.log(`✅ Associate member ${index}: ID proof stored -> ${idFilePath}`);
      } else {
        console.log(`⚠️ Associate member ${index}: No ID file uploaded`);
      }
    }

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
      customers: [primaryCustomerId], // Only primary customer ID
      guestIdProofs: guestIdProofs, // All ID proofs (primary + associates)
      status: "pending",
      createdDate: new Date(),
    });

    await reservationObj.save();

    console.log("✅ Online reservation created with:", {
      primaryCustomer: primaryCustomerId,
      totalGuests: customerArray.length,
      guestIdProofs: guestIdProofs.length
    });

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

    let customerArray =
      typeof req.body.customers === "string"
        ? JSON.parse(req.body.customers)
        : req.body.customers;

    if (!Array.isArray(customerArray)) {
      return res.status(400).json({ error: "Invalid customers format" });
    }

    console.log("📁 Files received:", req.files ? req.files.length : 0);
    console.log("👥 Customers count:", customerArray.length);

    // ✅ Process ONLY PRIMARY CUSTOMER (index 0)
    let primaryCustomerId = null;
    const guestIdProofs = [];

    // Process primary customer (first in array)
    if (customerArray.length > 0) {
      const customerItem = customerArray[0];

      let existingCustomer = null;
      if (customerItem.phoneNumber && customerItem.phoneNumber.trim() !== '') {
        existingCustomer = await customer.findOne({
          phoneNumber: customerItem.phoneNumber
        });
      }

      if (existingCustomer) {
        let firstName = existingCustomer.firstName;
        let lastName = existingCustomer.lastName;

        if (customerItem.firstName) {
          firstName = customerItem.firstName;
          lastName = customerItem.lastName || "";
        } else if (customerItem.name) {
          const parts = customerItem.name.trim().split(" ");
          firstName = parts[0];
          lastName = parts.slice(1).join(" ");
        }

        let updateData = {
          firstName,
          lastName,
          email: customerItem.email || existingCustomer.email
        };

        if (req.files && req.files[0]) {
          const newIdFilePath = `uploads/customer/Idproof/${req.files[0].filename}`;
          updateData.idFile = newIdFilePath;
          guestIdProofs.push(newIdFilePath);
          console.log(`🔄 Updating primary customer: New ID file -> ${newIdFilePath}`);
        } else if (existingCustomer.idFile) {
          guestIdProofs.push(existingCustomer.idFile);
        }

        await customer.updateOne(
          { _id: existingCustomer._id },
          {
            $set: updateData,
            $inc: { reservations: 1 }
          }
        );

        console.log(`✅ Using existing primary customer: ${existingCustomer._id}`);
        primaryCustomerId = existingCustomer._id;
      } else {
        // Create new primary customer
        let firstName = "";
        let lastName = "";

        if (customerItem.firstName) {
          firstName = customerItem.firstName;
          lastName = customerItem.lastName || "";
        } else if (customerItem.name) {
          const parts = customerItem.name.trim().split(" ");
          firstName = parts[0];
          lastName = parts.slice(1).join(" ");
        }

        let idFilePath = null;
        if (req.files && req.files[0]) {
          idFilePath = `uploads/customer/Idproof/${req.files[0].filename}`;
          guestIdProofs.push(idFilePath);
        }

        const newPrimaryCustomer = await customer.create({
          phoneNumber: customerItem.phoneNumber,
          firstName,
          lastName,
          email: customerItem.email,
          idFile: idFilePath,
          reservations: 1,
          createdDate: new Date(),
          hotelId: hotelId
        });

        console.log(`💾 Created primary customer:`, {
          id: newPrimaryCustomer._id,
          name: `${firstName} ${lastName}`,
          phone: customerItem.phoneNumber,
          email: customerItem.email
        });

        primaryCustomerId = newPrimaryCustomer._id;
      }
    }

    // 👥 Process ASSOCIATE MEMBERS - Only store ID proofs, NO customer records
    for (let index = 1; index < customerArray.length; index++) {
      if (req.files && req.files[index]) {
        const idFilePath = `uploads/customer/Idproof/${req.files[index].filename}`;
        guestIdProofs.push(idFilePath);
        console.log(`✅ Associate member ${index}: ID proof stored -> ${idFilePath}`);
      } else {
        console.log(`⚠️ Associate member ${index}: No ID file uploaded`);
      }
    }

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
      customers: [primaryCustomerId], // Only primary customer ID
      guestIdProofs: guestIdProofs, // All ID proofs (primary + associates)
      status: "pending",
      createdDate: new Date(),
    });

    await reservationObj.save();

    console.log("✅ Offline reservation created with:", {
      primaryCustomer: primaryCustomerId,
      totalGuests: customerArray.length,
      guestIdProofs: guestIdProofs.length
    });

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
    // Validate customerObjId before creating ObjectId
    if (!customerObjId || !mongoose.Types.ObjectId.isValid(customerObjId)) {
      return res.status(400).json({
        error: "Invalid or missing customer ID"
      });
    }

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
    try {
      const phoneNumber = req.params.phone;

      // Validate phone number
      if (!phoneNumber || phoneNumber.trim() === '') {
        return res.status(400).json({
          error: "Phone number is required"
        });
      }

      // Check if customer exists
      const customerExists = await customer.findOne({ phoneNumber });

      if (!customerExists) {
        return res.status(404).json({
          error: "Customer not found"
        });
      }

      // Check if customer has any active reservations
      const activeReservations = await reservation.find({
        customers: customerExists._id,
        status: { $in: ["pending", "active"] }
      });

      if (activeReservations && activeReservations.length > 0) {
        return res.status(400).json({
          error: "Cannot delete customer with active or pending reservations. Please check out or cancel their reservations first.",
          activeReservationsCount: activeReservations.length
        });
      }

      // Delete the customer
      const result = await customer.deleteOne({ phoneNumber });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          error: "Failed to delete customer"
        });
      }

      res.status(200).json({
        message: "Customer deleted successfully",
        deletedCount: result.deletedCount
      });
    } catch (err) {
      console.error("Failed to delete customer:", err);
      res.status(500).json({
        error: "Failed to delete customer",
        details: err.message
      });
    }
  },
  upload,
  getAllItems: async (req, res) => {
    try {
      const hotelId = req.params.hotelId;
      console.log(`🔍 Fetching customers for Hotel ID: ${hotelId}`);

      // Validate hotelId before creating ObjectId
      if (!hotelId || !mongoose.Types.ObjectId.isValid(hotelId)) {
        console.error("❌ Invalid Hotel ID provided:", hotelId);
        return res.status(400).json({
          error: "Invalid or missing hotelId parameter"
        });
      }

      const customerData = await customer.find({
        hotelId: new mongoose.Types.ObjectId(hotelId),
      }).lean();

      console.log(`✅ Found ${customerData.length} customers in database`);

      // For each customer, find reservations where they are the primary customer
      const customersWithReservations = await Promise.all(
        customerData.map(async (cust) => {
          try {
            // Find reservations where this customer is the first in the customers array (primary booker)
            const primaryReservations = await reservation.find({
              hotelId: new mongoose.Types.ObjectId(hotelId),
              customers: { $elemMatch: { $eq: cust._id } }
            }).lean();

            // Filter to only include reservations where customer is at index 0 (primary)
            // Note: With new logic, customers array usually only has 1 item, so checking index 0 is safe
            const primaryBookings = primaryReservations.filter(res =>
              res.customers && res.customers.length > 0 && res.customers[0].toString() === cust._id.toString()
            );

            // Combine first and last name for fullName
            const fullName = `${cust.firstName || ''} ${cust.lastName || ''}`.trim();

            return {
              ...cust,
              fullName: fullName || 'N/A',
              primaryReservationsCount: primaryBookings.length,
              primaryReservations: primaryBookings
            };
          } catch (err) {
            console.error(`⚠️ Error processing customer ${cust._id}:`, err);
            return {
              ...cust,
              fullName: `${cust.firstName || ''} ${cust.lastName || ''}`.trim(),
              primaryReservationsCount: 0,
              primaryReservations: []
            };
          }
        })
      );

      console.log(`✅ Returning ${customersWithReservations.length} processed customers`);
      res.status(200).json({ customerData: customersWithReservations });
    } catch (error) {
      console.error("❌ Failed to get customers:", error);
      res.status(500).json({ error: "Failed to get customers" });
    }
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
