const SingleInvoice = require("../../model/schema/singleinvoice");
const mongoose = require("mongoose");
const Reservation = require("../../model/schema/reservation");
const SeparateLaundryInvoice = require("../../model/schema/separatelaundryinvoice");
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

  const haveRoomGst =
    data.haveRoomGst === true || data.haveRoomGst === "true";

  let taxableRoom = Math.max(0, roomRent + extraCharges - roomDiscount);

  let roomGstAmount = parse(data.roomGstAmount);
  if (!roomGstAmount && haveRoomGst) {
    roomGstAmount = (taxableRoom * roomGstPercentage) / 100;
  }

  const totalRoomAmount = taxableRoom + roomGstAmount;

  /* ================= FOOD ================= */
  const foodAmount = parse(data.foodAmount);
  const foodDiscount = parse(data.foodDiscount);

  const foodGstPercentage = parse(
    data.foodgstpercentage ||
    data.foodGstPercentage ||
    data.foodGSTPercentage ||
    data.FoodGstPercentage
  );

  const haveFoodGst =
    data.haveFoodGst === true || data.haveFoodGst === "true";

  let taxableFood = Math.max(0, foodAmount - foodDiscount);

  let foodGstAmount = parse(data.foodGstAmount);
  if (!foodGstAmount && haveFoodGst) {
    foodGstAmount = (taxableFood * foodGstPercentage) / 100;
  }

  const totalFoodAmount = taxableFood + foodGstAmount;
  let laundryAmount = parseFloat(data.laundryAmount) || 0;
  console.log(" calculateInvoice - Input laundryAmount:", data.laundryAmount, "Parsed:", laundryAmount);

  if (laundryAmount === 0 && data.laundryItems && Array.isArray(data.laundryItems)) {
    laundryAmount = data.laundryItems
      .filter(
        (i) =>
          !i.status || i.status.toLowerCase() === "delivered"
      )
      .reduce(
        (sum, i) =>
          sum +
          parseFloat(i.quantity || 0) *
          parseFloat(i.price || 0),
        0
      );
    console.log(" calculateInvoice - Calculated from laundryItems:", laundryAmount);
  } else if (laundryAmount > 0) {
    console.log(" calculateInvoice - Using provided laundryAmount:", laundryAmount);
  }
  const laundryDiscount = parse(data.laundryDiscount);
  const totalLaundryAmount = Math.max(
    0,
    laundryAmount - laundryDiscount
  );

  console.log(" calculateInvoice - Final values:", {
    laundryAmount,
    laundryDiscount,
    totalLaundryAmount
  });

  const totalFoodRoomLaundryAmount =
    totalRoomAmount + totalFoodAmount + totalLaundryAmount;
  const advanceAmount = parse(data.advanceAmount);
  const pendingAmount = Math.max(
    0,
    totalFoodRoomLaundryAmount - advanceAmount
  );

  /* ================= RETURN ================= */
  return {
    ...data,
    type: "single",

    // GST %
    roomgstpercentage: roomGstPercentage,
    foodgstpercentage: foodGstPercentage,

    // ROOM
    roomGstAmount: Number(roomGstAmount.toFixed(2)),
    totalRoomAmount: Number(totalRoomAmount.toFixed(2)),

    // FOOD
    foodGstAmount: Number(foodGstAmount.toFixed(2)),
    totalFoodAmount: Number(totalFoodAmount.toFixed(2)),


    // LAUNDRY
    laundryAmount: Number(laundryAmount.toFixed(2)),
    laundryDiscount: Number(laundryDiscount.toFixed(2)),
    totalLaundryAmount: Number(totalLaundryAmount.toFixed(2)),


    // TOTAL
    totalFoodAndRoomAmount: Number(
      totalFoodRoomLaundryAmount.toFixed(2)
    ),

    totalAmount: Number(
      totalFoodRoomLaundryAmount.toFixed(2)
    ),

    pendingAmount: Number(pendingAmount.toFixed(2)),
  };
};

const addItems = async (req, res) => {
  try {
    req.body.createdDate = new Date();
    let extraCharges = 0;

    if (req.body.reservationId) {
      const reservation = await Reservation.findById(
        req.body.reservationId
      );

      if (reservation) {
        // Delivered food only
        if (reservation.foodItems) {
          req.body.foodItems = reservation.foodItems.filter(
            (i) =>
              !i.status ||
              i.status.toLowerCase() === "delivered"
          );
        }

        // Delivered laundry only
        if (reservation.laundryItems) {
          req.body.laundryItems = reservation.laundryItems.filter(
            (i) =>
              !i.status || i.status.toLowerCase() === "delivered"
          );
        }


        const extraStay = parseFloat(reservation.extraStayCharge) || 0;
        const extraBed = parseFloat(reservation.extraBedsCharge) || 0;
        extraCharges = extraStay + extraBed;
      }
    }
    console.log(" Backend received laundryAmount:", req.body.laundryAmount, "type:", typeof req.body.laundryAmount);

    if (req.body.reservationId && (req.body.laundryAmount === undefined || req.body.laundryAmount === null)) {
      try {
        const laundryInvoices = await SeparateLaundryInvoice.find({
          reservationId: req.body.reservationId,
        });
        const totalLaundry = laundryInvoices.reduce(
          (sum, inv) => sum + (parseFloat(inv.totalAmount) || 0),
          0
        );
        console.log(" Fetched laundry from DB:", totalLaundry);
        req.body.laundryAmount = totalLaundry;
        req.body.laundryDiscount = req.body.laundryDiscount || 0;
      } catch (laundryErr) {
        console.error("Failed to fetch laundry invoices:", laundryErr);
      }
    } else {
      console.log(" Using frontend-provided laundryAmount:", req.body.laundryAmount);
    }

    const calculatedData = calculateInvoice(req.body, extraCharges);

    const invoice = await SingleInvoice.create(calculatedData);

    if (invoice && req.body.paymentMethod) {
      await Reservation.updateOne(
        { _id: req.body.reservationId },
        {
          $set: {
            paymentOption: req.body.paymentMethod,
            paymentMethod: req.body.paymentMethod,
            advancePaymentMethod: req.body.paymentMethod,
          },
        }
      );
    }

    res.status(200).json(invoice);
  } catch (err) {
    console.error("Add Invoice Error:", err);
    res.status(400).json({ error: "Failed to Add Invoice" });
  }
};

const getSpecificInvoice = async (req, res) => {
  try {
    const reservationId = new mongoose.Types.ObjectId(
      req.params.reservationId
    );

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

    if (!InvoiceData.length)
      return res.status(404).json({ message: "No Data Found" });

    res.status(200).json({ InvoiceData });
  } catch (err) {
    console.error("Fetch Invoice Error:", err);
    res.status(400).json({ error: "Failed to fetch Invoice" });
  }
};
const deleteItem = async (req, res) => {
  try {
    const item = await SingleInvoice.deleteOne({
      _id: req.params.id,
    });
    res.status(200).json({ message: "Deleted", item });
  } catch (err) {
    res.status(404).json({ error: "Delete failed" });
  }
};

const editItem = async (req, res) => {
  try {
    const existing = await SingleInvoice.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ error: "Invoice not found" });

    let extraCharges = 0;

    if (existing.reservationId) {
      const reservation = await Reservation.findById(
        existing.reservationId
      );
      if (reservation) {
        extraCharges =
          (parseFloat(reservation.extraStayCharge) || 0) +
          (parseFloat(reservation.extraBedsCharge) || 0);
      }
    }

    const mergedData = {
      ...existing.toObject(),
      ...req.body,
    };
    console.log(" Edit - req.body.laundryAmount:", req.body.laundryAmount, "mergedData.laundryAmount:", mergedData.laundryAmount);

    if (existing.reservationId &&
      (req.body.laundryAmount === undefined || req.body.laundryAmount === null) &&
      (mergedData.laundryAmount === undefined || mergedData.laundryAmount === null)) {
      try {
        const laundryInvoices = await SeparateLaundryInvoice.find({
          reservationId: existing.reservationId,
        });
        const totalLaundry = laundryInvoices.reduce(
          (sum, inv) => sum + (parseFloat(inv.totalAmount) || 0),
          0
        );
        console.log(" Edit - Fetched laundry from DB:", totalLaundry);
        mergedData.laundryAmount = totalLaundry;
        // Don't overwrite laundryDiscount if it exists in mergedData, but ensure defaults
        if (mergedData.laundryDiscount === undefined) mergedData.laundryDiscount = 0;
      } catch (laundryErr) {
        console.error("Failed to fetch laundry invoices for edit:", laundryErr);
      }
    } else {
      console.log(" Edit - Using existing laundryAmount from payload");
    }

    const calculatedData = calculateInvoice(
      mergedData,
      extraCharges
    );

    delete calculatedData._id;

    await SingleInvoice.updateOne(
      { _id: req.params.id },
      { $set: calculatedData }
    );

    res.status(200).json({ message: "Updated" });
  } catch (err) {
    console.error("Edit Invoice Error:", err);
    res.status(400).json({ error: "Failed to Update Invoice" });
  }
};
module.exports = {
  addItems,
  deleteItem,
  editItem,
  getSpecificInvoice,
};
