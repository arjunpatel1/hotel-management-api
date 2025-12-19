const reservation = require("../../model/schema/reservation");
const mongoose = require("mongoose");
const Room = require("../../model/schema/room");
const moment = require("moment-timezone");
const { ObjectId } = require("mongoose").Types;
const Customer = require("../../model/schema/customer");
const Hotel = require("../../model/schema/hotel");
const { sendEmail } = require("../../db/mail");


const doReservation = async (req, res) => {
  try {
    const {
  hotelId,
  roomNo,
  roomType,
  bookingType,
  floor,
  adults,
  kids,
  checkInDate,
  checkOutDate,
  advanceAmount,
  totalAmount,
  customers
} = req.body;
 

    if (!hotelId || !roomNo || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        error: "Missing required fields (hotelId, roomNo, dates)"
      });
    }

    const hotelObjectId = new mongoose.Types.ObjectId(hotelId);

    const alreadyBooked = await reservation.findOne({
      roomNo,
      hotelId: hotelObjectId,
      status: "active",
      checkInDate: { $lte: new Date(checkOutDate) },
      checkOutDate: { $gte: new Date(checkInDate) }
    });

    if (alreadyBooked) {
      return res.status(400).json({
        error: "Room is already booked for selected dates"
      });
    }

    const newReservation = await reservation.create({
  roomNo,
  roomType,
  bookingType,
  floor,

  adults,
  kids,

  totalAmount,
  totalPayment: totalAmount, // ✅ for table
  advanceAmount,

  checkInDate,
  checkOutDate,

  hotelId: hotelObjectId,
  createdDate: new Date(),
  status: "active"
});

    let customerArray = customers;
    if (typeof customerArray === "string") {
      customerArray = JSON.parse(customerArray);
    }

    if (!Array.isArray(customerArray)) {
      return res.status(400).json({ error: "Invalid customers format" });
    }

    const customerIds = await Promise.all(
      customerArray.map(async (customerItem, index) => {
        const existingCustomer = await Customer.findOne({
          phoneNumber: customerItem.phoneNumber
        });

        if (existingCustomer) {
  let firstName = existingCustomer.firstName;
  let lastName = existingCustomer.lastName;

  // ✅ Handle new frontend format
  if (customerItem.firstName) {
    firstName = customerItem.firstName;
    lastName = customerItem.lastName || "";
  }
  // ✅ Handle old frontend format
  else if (customerItem.name) {
    const parts = customerItem.name.trim().split(" ");
    firstName = parts[0];
    lastName = parts.slice(1).join(" ");
  }

  await Customer.updateOne(
    { _id: existingCustomer._id },
    {
      $set: {
        firstName,
        lastName
      },
      $inc: { reservations: 1 }
    }
  );

  return existingCustomer._id;
}


        let idFilePath = null;
        if (req.files && req.files[index]) {
          idFilePath = `uploads/customer/Idproof/${req.files[index].filename}`;
        }

       let firstName = "";
let lastName = "";

if (customerItem.firstName) {
  // ✅ NEW frontend format
  firstName = customerItem.firstName;
  lastName = customerItem.lastName || "";
} else if (customerItem.name) {
  // ✅ OLD frontend format
  const parts = customerItem.name.trim().split(" ");
  firstName = parts[0];
  lastName = parts.slice(1).join(" ");
}


     const newCustomer = await Customer.create({
      phoneNumber: customerItem.phoneNumber,
      firstName,
      lastName,
      email: customerItem.email,
      idFile: idFilePath,
      reservations: 1,
      createdDate: new Date(),
      hotelId: hotelObjectId
    });



        return newCustomer._id;
      })
    );

    await reservation.updateOne(
      { _id: newReservation._id },
      { customers: customerIds }
    );

    await Room.updateOne(
      { roomNo: roomNo, hotelId: hotelObjectId },
      { $set: { bookingStatus: true, status: "Booked" } }
    );

    return res.status(200).json({
      message: "✅ Room Reserved Successfully",
      reservation: newReservation
    });

  } catch (err) {
    console.error("🔥 RESERVATION ERROR:", err);
    return res.status(500).json({
      error: "Internal Server Error while reserving room"
    });
  }
};


const getSpecificReservation = async (req, res) => {
  try {
    const data = await reservation.findById(req.params.id);
    if (!data) return res.status(404).json({ message: "No Data Found" });
    res.json({ reservationData: data });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch reservation" });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const hotelId = req.user.hotelId; // ✅ FROM AUTH

    const data = await reservation.find({
      hotelId: new mongoose.Types.ObjectId(hotelId)
    });

    res.json({ reservationData: data });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch reservations" });
  }
};



const getAllReservationForAdmin = async (req, res) => {
  try {
    const data = await reservation.find();
    res.json({ reservationData: data });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch reservations" });
  }
};

const getAllActiveReservations = async (req, res) => {
  try {
    const hotelId = new mongoose.Types.ObjectId(req.params.hotelId);

    const data = await reservation
      .find({
        hotelId,
        status: "active"
      })
      .populate("customers"); // ✅ THIS IS THE KEY

    res.json({ reservationData: data });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch active reservations" });
  }
};


const getAllPendingReservations = async (req, res) => {
  try {
    const hotelId = new mongoose.Types.ObjectId(req.params.hotelId);

    const data = await reservation.find({
      hotelId,
      status: "pending"
    });

    res.json({ reservationData: data });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch pending reservations" });
  }
};


const getAllCompleteReservation = async (req, res) => {
  try {
    const hotelId = new mongoose.Types.ObjectId(req.params.hotelId);

    const data = await reservation.find({
      hotelId,
      status: "checked-out"
    });

    res.json({ reservationData: data });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch completed reservations" });
  }
};


const getAllPendingAndActiveReservation = async (req, res) => {
  const hotelId = new mongoose.Types.ObjectId(req.params.hotelId);

  const data = await reservation.find({
    hotelId,
    status: { $in: ["pending", "active"] }
  })
  .populate("customers"); 

  res.json({ reservationData: data });
};

 
const getAllActiveAndCompletedReservation = async (req, res) => {
  try {
    const hotelId = new mongoose.Types.ObjectId(req.params.hotelId);

    const data = await reservation
  .find({ hotelId, status: { $in: ["pending", "active"] } })
  .populate("customers");

    res.json({ reservationData: data });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch active & completed" });
  }
};


const getAllActiveReservationCustomers = async (req, res) => {
  try {
    const hotelId = new mongoose.Types.ObjectId(req.params.hotelId);

    const data = await reservation
      .find({ hotelId, status: "active" })
      .populate("customers");

    res.json({ customers: data });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch customers" });
  }
};



const editreservation = async (req, res) => {
  try {
    const result = await reservation.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: "Failed to update reservation" });
  }
};

const checkIn = async (req, res) => {
  try {
    const hotelId = new mongoose.Types.ObjectId(req.body.hotelId);

    await reservation.updateOne(
      { _id: req.params.id },
      { $set: { status: "active", FinalCheckInTime: req.body.FinalCheckInTime } }
    );

    await Room.updateOne(
      { roomNo: req.body.roomNo, hotelId },
      { $set: { bookingStatus: true } }
    );

    res.json({ message: "Check-in successful" });
  } catch (err) {
    res.status(500).json({ error: "Check-in failed" });
  }
};



const editFoodItems = async (req, res) => {
  try {
    const foodItems = req.body;
    await reservation.updateOne(
      { _id: req.params.id },
      { $push: { foodItems: { $each: foodItems } } }
    );
    res.json({ message: "Food items updated" });
  } catch (err) {
    res.status(400).json({ error: "Food update failed" });
  }
};

const updateFoodQuantity = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;
    await reservation.updateOne(
      { _id: req.params.id, "foodItems.id": foodId },
      { $set: { "foodItems.$.quantity": quantity } }
    );
    res.json({ message: "Quantity updated" });
  } catch (err) {
    res.status(400).json({ error: "Quantity update failed" });
  }
};

const getFoodItems = async (req, res) => {
  try {
    const data = await reservation.findById(req.params.id);
    res.json({ foodItemsData: data.foodItems });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch food items" });
  }
};

const deleteFoodItems = async (req, res) => {
  try {
    await reservation.updateOne(
      { _id: req.params.id },
      { $pull: { foodItems: { id: req.body.data } } }
    );
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(400).json({ error: "Delete failed" });
  }
};



const deleteReservation = async (req, res) => {
  try {
    await reservation.updateOne(
      { _id: req.params.id },
      { $set: { status: "checked-out" } }
    );
    res.json({ message: "Reservation checked out" });
  } catch (err) {
    res.status(400).json({ error: "Delete failed" });
  }
};

const dailyReport = async (req, res) => {
  try {
    const data = await reservation.find();
    res.json({ matchedData: data });
  } catch (err) {
    res.status(400).json({ error: "Report error" });
  }
};

const addExtraStayCharges = async (req, res) => {
  try {
    await reservation.updateOne(
      { _id: req.params.id },
      {
        $set: {
          stayExtensionReason: req.body.reason,
          extraStayCharge: req.body.charges,
        },
      }
    );
    res.json({ message: "Extra stay charges added" });
  } catch (err) {
    res.status(400).json({ error: "Extra charge update failed" });
  }
};


module.exports = {
  doReservation,

  getSpecificReservation,
  getAllReservations,
  getAllReservationForAdmin,
  getAllActiveReservations,
  getAllPendingReservations,
  getAllCompleteReservation,
  getAllPendingAndActiveReservation,
  getAllActiveAndCompletedReservation,
  getAllActiveReservationCustomers,

  editreservation,
  checkIn,
  editFoodItems,
  updateFoodQuantity,
  getFoodItems,
  deleteFoodItems,

  deleteReservation,
  dailyReport,
  addExtraStayCharges
};
