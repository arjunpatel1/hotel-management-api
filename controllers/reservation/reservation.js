const reservation = require("../../model/schema/reservation");
const mongoose = require("mongoose");
const Room = require("../../model/schema/room");
const moment = require("moment-timezone");
const { ObjectId } = require("mongoose").Types;
const Customer = require("../../model/schema/customer");
const Hotel = require("../../model/schema/hotel");
const { sendEmail } = require("../../db/mail");
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
      totalPayment,
      customers
    } = req.body;
    const finalTotal = totalPayment || totalAmount;


    if (!hotelId || !roomNo || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        error: "Missing required fields (hotelId, roomNo, dates)"
      });
    }

    const hotelObjectId = new mongoose.Types.ObjectId(hotelId);
    const overlappingReservations = await reservation.find({
      roomNo,
      hotelId: hotelObjectId,
      status: { $in: ["active", "pending"] },
      checkInDate: { $lte: new Date(checkOutDate) },
      checkOutDate: { $gte: new Date(checkInDate) }
    });
    if (bookingType !== "shared" && overlappingReservations.length > 0) {
      return res.status(400).json({
        message: "Room already booked"
      });
    }
    if (bookingType === "shared") {
      const room = await Room.findOne({ roomNo, hotelId: hotelObjectId });
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      const usedAdults = overlappingReservations.reduce(
        (sum, r) => sum + Number(r.adults || 0),
        0
      );
      const usedKids = overlappingReservations.reduce(
        (sum, r) => sum + Number(r.kids || 0),
        0
      );

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
      roomRent: Number(req.body.roomRent || 0),
      totalAmount: finalTotal,
      totalPayment: finalTotal, 
      advanceAmount,
      checkInDate,
      checkOutDate,
      hotelId: hotelObjectId,
      createdDate: new Date(),
      status: "pending"
    });

    let customerArray = customers;
    if (typeof customerArray === "string") {
      customerArray = JSON.parse(customerArray);
    }

    if (!Array.isArray(customerArray)) {
      return res.status(400).json({ error: "Invalid customers format" });
    }

    console.log(" Files received:", req.files ? req.files.length : 0);
    console.log(" Customers count:", customerArray.length);
    const guestIdProofs = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file, idx) => {
        const filePath = `uploads/customer/Idproof/${file.filename}`;
        guestIdProofs.push(filePath);
        console.log(`File ${idx}:`, file.filename, "->", filePath);
      });
    }

    console.log(" Total guest ID proofs collected:", guestIdProofs.length);

    const customerIds = await Promise.all(
      customerArray.map(async (customerItem, index) => {
        if (index === 0) {
          let existingCustomer = null;
          if (customerItem.phoneNumber && customerItem.phoneNumber.trim() !== '') {
            existingCustomer = await Customer.findOne({
              phoneNumber: customerItem.phoneNumber
            });
          }

          if (existingCustomer) {
            // Update existing primary customer
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

            // Update ID file if new one is uploaded
            if (req.files && req.files[index]) {
              const newIdFilePath = `uploads/customer/Idproof/${req.files[index].filename}`;
              updateData.idFile = newIdFilePath;
              console.log(` Updating primary customer: New ID file -> ${newIdFilePath}`);
            }

            await Customer.updateOne(
              { _id: existingCustomer._id },
              {
                $set: updateData,
                $inc: { reservations: 1 }
              }
            );

            console.log(`Using existing primary customer: ${existingCustomer._id}`);
            return existingCustomer._id;
          }

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
          if (req.files && req.files[index]) {
            idFilePath = `uploads/customer/Idproof/${req.files[index].filename}`;
          }

          const newPrimaryCustomer = await Customer.create({
            phoneNumber: customerItem.phoneNumber,
            firstName,
            lastName,
            email: customerItem.email,
            idFile: idFilePath,
            reservations: 1,
            createdDate: new Date(),
            hotelId: hotelObjectId
          });

          console.log(`Created primary customer:`, {
            id: newPrimaryCustomer._id,
            name: `${firstName} ${lastName}`,
            phone: customerItem.phoneNumber,
            email: customerItem.email,
            idFile: newPrimaryCustomer.idFile
          });

          return newPrimaryCustomer._id;
        }
        let idFilePath = null;
        if (req.files && req.files[index]) {
          idFilePath = `uploads/customer/Idproof/${req.files[index].filename}`;
          console.log(` Associate member ${index}: Assigned file -> ${idFilePath}`);
        } else {
          console.log(`Associate member ${index}: No ID file uploaded`);
        }
        const associateMember = await Customer.create({
          phoneNumber: "",
          firstName: "Associate Member",
          lastName: `${index}`,
          email: "",
          idFile: idFilePath,
          reservations: 0,
          createdDate: new Date(),
          hotelId: hotelObjectId
        });

        console.log(` Created associate member ${index}:`, {
          id: associateMember._id,
          idFile: associateMember.idFile
        });

        return associateMember._id;
      })
    );

    await reservation.updateOne(
      { _id: newReservation._id },
      {
        customers: customerIds,
        guestIdProofs: guestIdProofs  
      }
    );

    console.log(" Reservation updated with:", {
      customers: customerIds.length,
      guestIdProofs: guestIdProofs.length
    });

    return res.status(200).json({
      message: " Room Reserved Successfully",
      reservation: newReservation
    });

  } catch (err) {
    console.error(" RESERVATION ERROR:", err);
    return res.status(500).json({
      error: "Internal Server Error while reserving room"
    });
  }
};
const getSpecificReservation = async (req, res) => {
  try {
    const data = await reservation
      .findById(req.params.id)
      .populate("customers");
    if (!data) return res.status(404).json({ message: "No Data Found" });

    const processedData = attachCustomerImageUrls(req, data);
    processedData.reason = processedData.stayExtensionReason;
    processedData.extraStayReason = processedData.stayExtensionReason; 
    processedData.charges = processedData.extraStayCharge;
    processedData.extraAmount = processedData.extraStayCharge;

    res.json({ reservationData: processedData });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch reservation" });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const hotelId = req.user.hotelId; 
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
    const hotelIdParam = req.params.hotelId;

    if (!hotelIdParam || !mongoose.Types.ObjectId.isValid(hotelIdParam)) {
      return res.status(400).json({ error: "Invalid or missing hotelId" });
    }

    const hotelId = new mongoose.Types.ObjectId(hotelIdParam);

    const data = await reservation
      .find({
        hotelId,
        status: "active"
      })
      .populate("customers"); 

    res.json({ reservationData: attachCustomerImageUrls(req, data) });
  } catch (err) {
    console.error("Failed to fetch active reservations:", err);
    res.status(400).json({ error: "Failed to fetch active reservations" });
  }
};


const getAllPendingReservations = async (req, res) => {
  try {
    const hotelIdParam = req.params.hotelId;

    if (!hotelIdParam || !mongoose.Types.ObjectId.isValid(hotelIdParam)) {
      return res.status(400).json({ error: "Invalid or missing hotelId" });
    }

    const hotelId = new mongoose.Types.ObjectId(hotelIdParam);

    const data = await reservation.find({
      hotelId,
      status: "pending"
    }).populate("customers");

    res.json({ reservationData: attachCustomerImageUrls(req, data) });
  } catch (err) {
    console.error("Failed to fetch pending reservations:", err);
    res.status(400).json({ error: "Failed to fetch pending reservations" });
  }
};


const getAllCompleteReservation = async (req, res) => {
  try {
    const hotelIdParam = req.params.hotelId;

    if (!hotelIdParam || !mongoose.Types.ObjectId.isValid(hotelIdParam)) {
      return res.status(400).json({ error: "Invalid or missing hotelId" });
    }

    const hotelId = new mongoose.Types.ObjectId(hotelIdParam);

    const data = await reservation.find({
      hotelId,
      status: "checked-out"
    }).populate("customers");

    res.json({ reservationData: attachCustomerImageUrls(req, data) });
  } catch (err) {
    console.error("Failed to fetch completed reservations:", err);
    res.status(400).json({ error: "Failed to fetch completed reservations" });
  }
};


const getAllPendingAndActiveReservation = async (req, res) => {
  try {
    const hotelIdParam = req.params.hotelId;

    if (!hotelIdParam || !mongoose.Types.ObjectId.isValid(hotelIdParam)) {
      return res.status(400).json({ error: "Invalid or missing hotelId" });
    }

    const hotelId = new mongoose.Types.ObjectId(hotelIdParam);

    const data = await reservation.find({
      hotelId,
      status: { $in: ["pending", "active"] }
    })
      .populate("customers");

    res.json({ reservationData: attachCustomerImageUrls(req, data) });
  } catch (err) {
    console.error("Failed to fetch pending and active reservations:", err);
    res.status(400).json({ error: "Failed to fetch reservations" });
  }
};


const getAllActiveAndCompletedReservation = async (req, res) => {
  try {
    const hotelIdParam = req.params.hotelId;

    if (!hotelIdParam || !mongoose.Types.ObjectId.isValid(hotelIdParam)) {
      return res.status(400).json({ error: "Invalid or missing hotelId" });
    }

    const hotelId = new mongoose.Types.ObjectId(hotelIdParam);

    const data = await reservation
      .find({ hotelId, status: { $in: ["pending", "active"] } })
      .populate("customers");

    res.json({ reservationData: attachCustomerImageUrls(req, data) });
  } catch (err) {
    console.error("Failed to fetch active & completed:", err);
    res.status(400).json({ error: "Failed to fetch active & completed" });
  }
};


const getAllActiveReservationCustomers = async (req, res) => {
  try {
    const hotelIdParam = req.params.hotelId;

    if (!hotelIdParam || !mongoose.Types.ObjectId.isValid(hotelIdParam)) {
      return res.status(400).json({ error: "Invalid or missing hotelId" });
    }

    const hotelId = new mongoose.Types.ObjectId(hotelIdParam);

    const data = await reservation
      .find({ hotelId, status: "active" })
      .populate("customers");

    res.json({ customers: attachCustomerImageUrls(req, data) });
  } catch (err) {
    console.error("Failed to fetch customers:", err);
    res.status(400).json({ error: "Failed to fetch customers" });
  }
};



const editreservation = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Ensure totalAmount and totalPayment are synced
    if (updateData.totalPayment && !updateData.totalAmount) {
      updateData.totalAmount = updateData.totalPayment;
    } else if (updateData.totalAmount && !updateData.totalPayment) {
      updateData.totalPayment = updateData.totalAmount;
    }

    const result = await reservation.updateOne(
      { _id: req.params.id },
      { $set: updateData }
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
    const foodItemsRaw = req.body;

    // Generate a unique Order ID for this batch of items
    const batchOrderId = `ORD-${Date.now()}`;

    const foodItems = Array.isArray(foodItemsRaw)
      ? foodItemsRaw.map((item) => ({
        ...item,
        orderId: item.orderId || batchOrderId, 
        createdAt: item.createdAt || new Date()
      }))
      : { ...foodItemsRaw, orderId: foodItemsRaw.orderId || batchOrderId, createdAt: foodItemsRaw.createdAt || new Date() };

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
      { _id: req.params.id, "foodItems._id": foodId },
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
    const foodIdToDelete = req.body.foodId || req.body.data;
    console.log(`Deleting food item(s) with ID: ${foodIdToDelete} from reservation ${req.params.id}`);

    await reservation.updateOne(
      { _id: req.params.id },
      { $pull: { foodItems: { _id: foodIdToDelete } } }
    );
    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error(" Failed to delete food item:", err);
    res.status(400).json({ error: "Delete failed", details: err.message });
  }
};



const deleteReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    console.log(`Delete Request for Reservation ID: ${reservationId}`);

    const data = await reservation.findById(reservationId);
    if (!data) {
      console.log(" Reservation not found");
      return res.status(404).json({ error: "Reservation not found" });
    }

    const currentStatus = (data.status || "").toLowerCase();
    console.log(` Current Status: '${data.status}' (normalized: '${currentStatus}')`);

    // PERMANENT DELETE: If already checked-out
    if (currentStatus === "checked-out") {
      await reservation.deleteOne({ _id: reservationId });
      console.log(" Reservation PERMANENTLY deleted from DB");
      return res.json({ message: "Reservation deleted permanently" });
    }

    // SOFT DELETE: Move to history (Check-out)
    await reservation.updateOne(
      { _id: reservationId },
      { $set: { status: "checked-out" } }
    );
    console.log(" Reservation status updated to 'checked-out'");
    res.json({ message: "Reservation checked out" });

  } catch (err) {
    console.error(" Error in deleteReservation:", err);
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
    // 1. Fetch current reservation to get the OLD charge
    const currentRes = await reservation.findById(req.params.id);
    if (!currentRes) return res.status(404).json({ error: "Reservation not found" });

    const oldCharge = Number(currentRes.extraStayCharge) || 0;
    const newCharge = Number(req.body.charges) || 0;

    // 2. Calculate the difference to add to the total
    const difference = newCharge - oldCharge;

    await reservation.updateOne(
      { _id: req.params.id },
      {
        $set: {
          stayExtensionReason: req.body.reason,
          extraStayCharge: newCharge,
        },
        // 3. Increment the totals by the difference
        $inc: {
          totalAmount: difference,
          totalPayment: difference
        }
      }
    );
    res.json({ message: "Extra stay charges added and totals updated" });
  } catch (err) {
    console.error(err);
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