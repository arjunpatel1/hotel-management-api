


const reservation = require("../../model/schema/reservation");
const mongoose = require("mongoose");
const Room = require("../../model/schema/room");
const moment = require("moment-timezone");
const { ObjectId } = require("mongoose").Types;
const Customer = require("../../model/schema/customer");
const Hotel = require("../../model/schema/hotel");
const { sendEmail } = require("../../db/mail");

// Convert stored file paths (e.g., 'uploads/...') into absolute URLs the frontend can use
const makeAbsoluteUrl = (req, filePath) => {
  if (!filePath) return filePath;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
  const normalized = filePath.startsWith("/") ? filePath.substring(1) : filePath;
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const attachCustomerImageUrls = (req, reservationData) => {
  if (!reservationData) return reservationData;

  const transformCustomer = (c) => {
    if (!c) return c;
    // convert Mongoose document to plain object if needed
    const customer = c.toObject ? c.toObject() : { ...c };
    customer.idFile = makeAbsoluteUrl(req, customer.idFile);
    customer.idFile2 = makeAbsoluteUrl(req, customer.idFile2);
    return customer;
  };

  const transformReservation = (r) => {
    const resObj = r.toObject ? r.toObject() : { ...r };
    if (resObj.customers && Array.isArray(resObj.customers)) {
      resObj.customers = resObj.customers.map(transformCustomer);
    }
    return resObj;
  };

  if (Array.isArray(reservationData)) {
    return reservationData.map(transformReservation);
  }

  return transformReservation(reservationData);
};


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

    // 🔍 Find overlapping reservations for same room & dates
const overlappingReservations = await reservation.find({
  roomNo,
  hotelId: hotelObjectId,
  status: { $in: ["active", "pending"] },
  checkInDate: { $lte: new Date(checkOutDate) },
  checkOutDate: { $gte: new Date(checkInDate) }
});

// ❌ Block only for NON-shared rooms
if (bookingType !== "shared" && overlappingReservations.length > 0) {
  return res.status(400).json({
     message: "Room already booked"
  });
}

// ✅ STEP 2 — Capacity check for SHARED rooms
if (bookingType === "shared") {
  const room = await Room.findOne({
    roomNo,
    hotelId: hotelObjectId
  });

  const usedAdults = overlappingReservations.reduce(
    (sum, r) => sum + Number(r.adults || 0),
    0
  );

  const usedKids = overlappingReservations.reduce(
    (sum, r) => sum + Number(r.kids || 0),
    0
  );

// ✅ SHARED ROOM — FINAL & CORRECT extra bed logic
if (bookingType === "shared") {
  const room = await Room.findOne({ roomNo, hotelId: hotelObjectId });
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  // Already occupied
  const usedAdults = overlappingReservations.reduce(
    (sum, r) => sum + Number(r.adults || 0),
    0
  );
  const usedKids = overlappingReservations.reduce(
    (sum, r) => sum + Number(r.kids || 0),
    0
  );

  // Remaining capacity PER TYPE
  const remainingAdults = Math.max(
    Number(room.capacity || 0) - usedAdults,
    0
  );

  const remainingKids = Math.max(
    Number(room.childrenCapacity || 0) - usedKids,
    0
  );

  const enteredAdults = Number(adults || 0);
  const enteredKids = Number(kids || 0);

  // 🔥 FIX
  const extraAdultBeds = Math.max(
    enteredAdults - remainingAdults,
    0
  );

  const extraKidBeds = Math.max(
    enteredKids - remainingKids,
    0
  );

  const totalExtraBeds = extraAdultBeds + extraKidBeds;

  req.body.addBeds = totalExtraBeds > 0;
  req.body.noOfBeds = totalExtraBeds;
}



}



  const newReservation = await reservation.create({
  roomNo,
  roomType,
  bookingType,
  floor,

  adults,
  kids,

   addBeds: req.body.addBeds || false,
  noOfBeds: req.body.noOfBeds || 0,
  extraBedsCharge: Number(req.body.extraBedsCharge || 0),

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

    // await Room.updateOne(
    //   { roomNo: roomNo, hotelId: hotelObjectId },
    //   { $set: { bookingStatus: true, status: "Booked" } }
    // );

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
    const data = await reservation.findById(req.params.id).populate("customers");
    if (!data) return res.status(404).json({ message: "No Data Found" });
    res.json({ reservationData: attachCustomerImageUrls(req, data) });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch reservation" });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const hotelId = req.user.hotelId; // ✅ FROM AUTH

    const data = await reservation.find({
      hotelId: new mongoose.Types.ObjectId(hotelId)
    }).populate("customers");

    res.json({ reservationData: attachCustomerImageUrls(req, data) });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch reservations" });
  }
};



const getAllReservationForAdmin = async (req, res) => {
  try {
    const data = await reservation.find().populate("customers");
    res.json({ reservationData: attachCustomerImageUrls(req, data) });
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

    res.json({ reservationData: attachCustomerImageUrls(req, data) });
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
    }).populate("customers");

    res.json({ reservationData: attachCustomerImageUrls(req, data) });
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
    }).populate("customers");

    res.json({ reservationData: attachCustomerImageUrls(req, data) });
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

  res.json({ reservationData: attachCustomerImageUrls(req, data) });
};

 
const getAllActiveAndCompletedReservation = async (req, res) => {
  try {
    const hotelId = new mongoose.Types.ObjectId(req.params.hotelId);

    const data = await reservation
  .find({ hotelId, status: { $in: ["pending", "active"] } })
  .populate("customers");

    res.json({ reservationData: attachCustomerImageUrls(req, data) });
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

    res.json({ customers: attachCustomerImageUrls(req, data) });
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
    const items = (data.foodItems || []).map((it) => {
      const item = it.toObject ? it.toObject() : { ...it };
      if (item.image) item.image = makeAbsoluteUrl(req, item.image);
      return item;
    });
    res.json({ foodItemsData: items });
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
    const data = await reservation.find().populate("customers");
    res.json({ matchedData: attachCustomerImageUrls(req, data) });
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
