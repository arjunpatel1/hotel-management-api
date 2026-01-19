const SingleInvoice = require("../../model/schema/singleinvoice");
const mongoose = require("mongoose");
const Reservation = require("../../model/schema/reservation");

const calculateInvoice = (data, extraCharges = 0) => {
  const parse = (val) => parseFloat(val) || 0;

  const roomRent = parse(data.roomRent);
  const roomDiscount = parse(data.roomDiscount);

  const roomGstPercentage = parse(
    data.roomgstpercentage ||
    data.roomGstPercentage ||
    data.roomGSTPercentage ||
    data.RoomGstPercentage
  );

  const haveRoomGst = data.haveRoomGst === true || data.haveRoomGst === "true";

  console.log("--- Calculation Start ---");
  console.log("Room Rent:", roomRent);
  console.log("Extra Charges:", extraCharges);
  console.log("Room Discount:", roomDiscount);
  console.log("GST %:", roomGstPercentage);
  console.log("Has GST:", haveRoomGst);

  let taxableRoom = Math.max(0, (roomRent + extraCharges) - roomDiscount);
  console.log("Taxable Room Amount:", taxableRoom);

  let roomGstAmount = parse(data.roomGstAmount);  
  if (!roomGstAmount && haveRoomGst) {
    roomGstAmount = (taxableRoom * roomGstPercentage) / 100;
  }
  console.log("Room GST Amount (from frontend or calculated):", roomGstAmount);

  let totalRoomAmount = taxableRoom + roomGstAmount;

  const foodAmount = parse(data.foodAmount);
  const foodDiscount = parse(data.foodDiscount);

  const foodGstPercentage = parse(
    data.foodgstpercentage ||
    data.foodGstPercentage ||
    data.foodGSTPercentage ||
    data.FoodGstPercentage
  );

  const haveFoodGst = data.haveFoodGst === true || data.haveFoodGst === "true";

  let taxableFood = Math.max(0, foodAmount - foodDiscount);

  let foodGstAmount = parse(data.foodGstAmount);  
  if (!foodGstAmount && haveFoodGst) {
    foodGstAmount = (taxableFood * foodGstPercentage) / 100;
  }

  let totalFoodAmount = taxableFood + foodGstAmount;

  const totalFoodAndRoomAmount = totalRoomAmount + totalFoodAmount;
  const advanceAmount = parse(data.advanceAmount);
  const pendingAmount = Math.max(0, totalFoodAndRoomAmount - advanceAmount);

  console.log("Advance:", advanceAmount);
  console.log("Pending:", pendingAmount);
  console.log("--- Calculation End ---");

  return {
    ...data,
    roomgstpercentage: roomGstPercentage,
    foodgstpercentage: foodGstPercentage,
    roomGstAmount: parseFloat(roomGstAmount.toFixed(2)),
    totalRoomAmount: parseFloat(totalRoomAmount.toFixed(2)),
    foodGstAmount: parseFloat(foodGstAmount.toFixed(2)),
    totalFoodAmount: parseFloat(totalFoodAmount.toFixed(2)),
    totalFoodAndRoomAmount: parseFloat(totalFoodAndRoomAmount.toFixed(2)),
    pendingAmount: parseFloat(pendingAmount.toFixed(2)),
  };
};

const addItems = async (req, res) => {
  try {
    console.log("body data =>", req.body);

    req.body.createdDate = new Date();
    let extraCharges = 0;

    if (req.body.reservationId) {
      const reservation = await Reservation.findById(req.body.reservationId);
      if (reservation) {
        if (reservation.foodItems) {
          const filteredFoodItems = reservation.foodItems.filter(
            (item) => !item.status || item.status.toLowerCase() === "delivered"
          );
          req.body.foodItems = filteredFoodItems;
        }
        const extraStay = parseFloat(reservation.extraStayCharge) || 0;
        const extraBed = parseFloat(reservation.extraBedsCharge) || 0;
        extraCharges = extraStay + extraBed;
        console.log(`Fetched Extra Charges for Add: Stay=${extraStay}, Bed=${extraBed}, Total=${extraCharges}`);
      }
    }

    const calculatedData = calculateInvoice(req.body, extraCharges);

    const InvoiceObject = await SingleInvoice.create(calculatedData);

    if (InvoiceObject && req.body.reservationId && req.body.paymentMethod) {
      await Reservation.updateOne(
        { _id: req.body.reservationId },
        { $set: { paymentOption: req.body.paymentMethod } }
      );
    }

    if (InvoiceObject) {
      res.status(200).json(InvoiceObject);
    } else {
      res.status(400).json({ error: "Failed to Add Invoice" });
    }
  } catch (err) {
    console.error("Failed to add Invoice:", err);
    res.status(400).json({ error: "Failed to Add Invoice" });
  }
};

const getSpecificInvoice = async (req, res) => {
  const reservationId = new mongoose.Types.ObjectId(req.params.reservationId);
  try {
    const InvoiceData = await SingleInvoice.aggregate([
      { $match: { reservationId } },
      {
        $lookup: {
          from: "reservations",
          localField: "reservationId",
          foreignField: "_id",
          as: "reservation",
        },
      },
      {
        $addFields: {
          FinalCheckInTime: {
            $arrayElemAt: ["$reservation.FinalCheckInTime", 0],
          },
          FinalCheckOutTime: {
            $arrayElemAt: ["$reservation.FinalCheckOutTime", 0],
          },
          paymentOption: {
            $arrayElemAt: ["$reservation.paymentOption", 0],
          },
          advancePaymentMethod: {
            $arrayElemAt: ["$reservation.advancePaymentMethod", 0],
          },
          extraBedsCharge: {
            $arrayElemAt: ["$reservation.extraBedsCharge", 0],
          },
          extraStayCharge: {
            $arrayElemAt: ["$reservation.extraStayCharge", 0],
          },
        },
      },
      { $unset: "reservation" },
    ]);
    if (InvoiceData.length === 0)
      return res.status(404).json({ message: "no Data Found." });

    console.log("InvoiceData ====>", InvoiceData);
    res.status(200).json({ InvoiceData });
  } catch (error) {
    console.error("Failed to fetch Invoice data:", error);
    res.status(400).json({ error: "Failed to fetch Invoice data" });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await SingleInvoice.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "done", item });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

const editItem = async (req, res) => {
  try {
    const existing = await SingleInvoice.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    let extraCharges = 0;
    if (existing.reservationId) {
      const reservation = await Reservation.findById(existing.reservationId);
      if (reservation) {
        const extraStay = parseFloat(reservation.extraStayCharge) || 0;
        const extraBed = parseFloat(reservation.extraBedsCharge) || 0;
        extraCharges = extraStay + extraBed;
        console.log(`Fetched Extra Charges for Edit: Stay=${extraStay}, Bed=${extraBed}, Total=${extraCharges}`);
      } else {
        console.log("Reservation not found for ID:", existing.reservationId);
      }
    }

    const mergedData = { ...existing.toObject(), ...req.body };
    console.log("Merged Data for Recalculation:", {
      roomRent: mergedData.roomRent,
      advanceAmount: mergedData.advanceAmount,
      roomDiscount: mergedData.roomDiscount
    });

    const calculatedData = calculateInvoice(mergedData, extraCharges);

    delete calculatedData._id;

    let result = await SingleInvoice.updateOne(
      { _id: req.params.id },
      { $set: calculatedData }
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to Update Invoice:", err);
    res.status(400).json({ error: "Failed to Update Invoice" });
  }
};

module.exports = {
  addItems,
  deleteItem,
  editItem,
  getSpecificInvoice,
};
