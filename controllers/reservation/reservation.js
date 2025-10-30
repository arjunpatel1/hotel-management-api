const reservation = require("../../model/schema/reservation");
const mongoose = require("mongoose");
const Room = require("../../model/schema/room");
const moment = require("moment-timezone");
const { ObjectId } = require("mongoose").Types;
const customer = require("../../model/schema/customer");
const Hotel = require("../../model/schema/hotel");
// const Reservation = require("../../model/schema/reservation");
const Customer = require("../../model/schema/customer");
const {sendEmail} = require("../../db/mail");

const getAllReservations = async (req, res) => {
  const hotelId = req.params.hotelId;
  try {
    let reservationData = await reservation.aggregate([
      [
        {
          $match: {
            hotelId: new mongoose.Types.ObjectId(hotelId),
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "customerId",
            foreignField: "_id",
            as: "customerDetails",
          },
        },
        {
          $unwind: {
            path: "$customerDetails",
          },
        },
        {
          $addFields: {
            fullName: {
              $concat: [
                "$customerDetails.firstName",
                " ",
                "$customerDetails.lastName",
              ],
            },
            idFile: {
              $concat: [process.env.BASE_URL, "$customerDetails.idFile"],
            },
            totalPayment: {
              $sum: ["$totalAmount", "$advanceAmount"],
            },
            totalDays: {
              $divide: [
                {
                  $subtract: ["$checkOutDate", "$checkInDate"],
                },
                1000 * 60 * 60 * 24,
              ],
            },
            phoneNumber: "$customerDetails.phoneNumber",
          },
        },
        {
          $project: {
            __v: 0,
          },
        },
      ],
    ]);

    if (!reservationData)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ reservationData });
  } catch (error) {
    console.error("Failed to fetch reservation data:", error);
    res.status(400).json({ error: "Failed to fetch reservation data" });
  }
};

// view all reservations to show for admin
const getAllReservationForAdmin = async (req, res) => {
  try {
    const reservationData = await reservation.find();
    if (reservationData.length === 0)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ reservationData });
  } catch (error) {
    console.error("Failed to fetch reservation data:", error);
    res.status(400).json({ error: "Failed to fetch reservation data" });
  }
};

//view all active reservations api-------------------------
const getAllActiveReservations = async (req, res) => {
  const hotelId = req.params.hotelId;
  try {
    let reservationData = await reservation.aggregate([
      [
        {
          $match: {
            hotelId: new mongoose.Types.ObjectId(hotelId),
          },
        },
        {
          $match: {
            status: "active",
          },
        },
        {
          $addFields: {
            firstCustomerId: { $arrayElemAt: ["$customers", 0] },
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "firstCustomerId",
            foreignField: "_id",
            as: "customerDetails",
          },
        },
        {
          $unwind: {
            path: "$customerDetails",
          },
        },
        {
          $addFields: {
            fullName: {
              $concat: [
                "$customerDetails.firstName",
                " ",
                "$customerDetails.lastName",
              ],
            },
            idFile: {
              $concat: [process.env.BASE_URL, "$customerDetails.idFile"],
            },
            totalPayment: {
              $sum: ["$totalAmount", "$advanceAmount"],
            },
            totalDays: {
              $divide: [
                {
                  $subtract: ["$checkOutDate", "$checkInDate"],
                },
                1000 * 60 * 60 * 24,
              ],
            },
            phoneNumber: "$customerDetails.phoneNumber",
          },
        },
        {
          $project: {
            __v: 0,
          },
        },
      ],
    ]);

    if (!reservationData)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ reservationData });
  } catch (error) {
    console.error("Failed to fetch reservation data:", error);
    res.status(400).json({ error: "Failed to fetch reservation data" });
  }
};
//view all active reservations api-------------------------
const getAllActiveReservationCustomers = async (req, res) => {
  const hotelId = req.params.hotelId;
  try {
    let reservationData = await reservation.aggregate([
      [
        {
          $match: {
            hotelId: new mongoose.Types.ObjectId(hotelId),
            status: "active",
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "customers",
            foreignField: "_id",
            as: "customerDetails",
          },
        },
        {
          $addFields: {
            customerDetails: {
              $map: {
                input: "$customerDetails",
                as: "customer",
                in: {
                  $mergeObjects: [
                    "$$customer",
                    {
                      idFile: {
                        $concat: [process.env.BASE_URL, "$$customer.idFile"],
                      },
                      fullName: {
                        $concat: [
                          "$$customer.firstName",
                          " ",
                          "$$customer.lastName",
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            customerDetails: 1,
          },
        },
      ],
    ]);

    const allCustomerDetails = reservationData.flatMap(
      (data) => data.customerDetails
    );

    console.log("==>", allCustomerDetails);
    res.json(allCustomerDetails);
  } catch (error) {
    console.error("Failed to fetch reservation data:", error);
    res.status(400).json({ error: "Failed to fetch reservation data" });
  }
};

const getAllPendingAndActiveReservation = async (req, res) => {
  const hotelId = req.params.hotelId;
  try {
    let reservationData = await reservation.aggregate([
      {
        $match: {
          hotelId: new mongoose.Types.ObjectId(hotelId),
          status: { $in: ["active", "pending"] },
        },
      },
      {
        $addFields: {
          firstCustomerId: { $arrayElemAt: ["$customers", 0] },
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "firstCustomerId",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },
      {
        $addFields: {
          fullName: {
            $concat: [
              "$customerDetails.firstName",
              " ",
              "$customerDetails.lastName",
            ],
          },
          idFile: {
            $concat: [process.env.BASE_URL, "$customerDetails.idFile"],
          },
          totalPayment: {
            $sum: ["$totalAmount", "$advanceAmount"],
          },
          totalDays: {
            $divide: [
              { $subtract: ["$checkOutDate", "$checkInDate"] },
              1000 * 60 * 60 * 24,
            ],
          },
          phoneNumber: "$customerDetails.phoneNumber",
        },
      },
      {
        $project: {
          __v: 0,
          firstCustomerId: 0, // Exclude the intermediate field
        },
      },
    ]);

    if (!reservationData)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ reservationData });
  } catch (error) {
    console.error("Failed to fetch reservation data:", error);
    res.status(400).json({ error: "Failed to fetch reservation data" });
  }
};
//view all active and completed reservations api-------------------------
const getAllActiveAndCompletedReservation = async (req, res) => {
  const hotelId = req.params.hotelId;
  try {
    let reservationData = await reservation.aggregate([
      [
        {
          $match: {
            hotelId: new mongoose.Types.ObjectId(hotelId),
          },
        },
        {
          $addFields: {
            firstCustomerId: { $arrayElemAt: ["$customers", 0] },
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "firstCustomerId",
            foreignField: "_id",
            as: "customerDetails",
          },
        },
        {
          $unwind: {
            path: "$customerDetails",
          },
        },
        {
          $addFields: {
            fullName: {
              $concat: [
                "$customerDetails.firstName",
                " ",
                "$customerDetails.lastName",
              ],
            },
            idFile: {
              $concat: [process.env.BASE_URL, "$customerDetails.idFile"],
            },
            totalPayment: {
              $sum: ["$totalAmount", "$advanceAmount"],
            },
            totalDays: {
              $divide: [
                {
                  $subtract: ["$checkOutDate", "$checkInDate"],
                },
                1000 * 60 * 60 * 24,
              ],
            },
            phoneNumber: "$customerDetails.phoneNumber",
          },
        },
        {
          $project: {
            __v: 0,
          },
        },
      ],
    ]);

    if (!reservationData)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ reservationData });
  } catch (error) {
    console.error("Failed to fetch reservation data:", error);
    res.status(400).json({ error: "Failed to fetch reservation data" });
  }
};

//view all pending reservations api-------------------------
const getAllPendingReservations = async (req, res) => {
  const hotelId = req.params.hotelId;
  try {
    let reservationData = await reservation.aggregate([
      [
        {
          $match: {
            hotelId: new mongoose.Types.ObjectId(hotelId),
            status: "pending",
          },
        },
        {
          $addFields: {
            firstCustomerId: { $arrayElemAt: ["$customers", 0] },
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "firstCustomerId",
            foreignField: "_id",
            as: "customerDetails",
          },
        },
        {
          $unwind: {
            path: "$customerDetails",
          },
        },
        {
          $addFields: {
            fullName: {
              $concat: [
                "$customerDetails.firstName",
                " ",
                "$customerDetails.lastName",
              ],
            },
            idFile: {
              $concat: [process.env.BASE_URL, "$customerDetails.idFile"],
            },
            totalPayment: {
              $sum: ["$totalAmount", "$advanceAmount"],
            },
            totalDays: {
              $divide: [
                {
                  $subtract: ["$checkOutDate", "$checkInDate"],
                },
                1000 * 60 * 60 * 24,
              ],
            },
            phoneNumber: "$customerDetails.phoneNumber",
          },
        },
        {
          $project: {
            __v: 0,
          },
        },
      ],
    ]);

    if (!reservationData)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ reservationData });
  } catch (error) {
    console.error("Failed to fetch reservation data:", error);
    res.status(400).json({ error: "Failed to fetch reservation data" });
  }
};
//view all completed reservations api-------------------------
const getAllCompleteReservation = async (req, res) => {
  const hotelId = req.params.hotelId;
  try {
    let reservationData = await reservation.aggregate([
      [
        {
          $match: {
            hotelId: new mongoose.Types.ObjectId(hotelId),
          },
        },
        {
          $match: {
            status: "checked-out",
          },
        },
        {
          $lookup: {
            from: "invoices",
            localField: "hotelId",
            foreignField: "hotelId",
            as: "invoiceInformation",
          },
        },
        {
          $addFields: {
            firstCustomerId: { $arrayElemAt: ["$customers", 0] },
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "firstCustomerId",
            foreignField: "_id",
            as: "customerDetails",
          },
        },
        {
          $unwind: {
            path: "$customerDetails",
          },
        },
        {
          $addFields: {
            fullName: {
              $concat: [
                "$customerDetails.firstName",
                " ",
                "$customerDetails.lastName",
              ],
            },
            idFile: {
              $concat: [process.env.BASE_URL, "$customerDetails.idFile"],
            },
            totalPayment: {
              $sum: ["$totalAmount", "$advanceAmount"],
            },
            totalDays: {
              $divide: [
                {
                  $subtract: ["$checkOutDate", "$checkInDate"],
                },
                1000 * 60 * 60 * 24,
              ],
            },
            phoneNumber: "$customerDetails.phoneNumber",
          },
        },
        {
          $project: {
            __v: 0,
          },
        },
      ],
    ]);

    if (!reservationData)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ reservationData });
  } catch (error) {
    console.error("Failed to fetch reservation data:", error);
    res.status(400).json({ error: "Failed to fetch reservation data" });
  }
};
//view specific reservation api-------------------------
const getSpecificReservation = async (req, res) => {
  try {
    let reservationData = await reservation.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $addFields: {
          firstCustomerId: { $arrayElemAt: ["$customers", 0] },
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "firstCustomerId",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: {
          path: "$customerDetails",
        },
      },
      {
        $addFields: {
          fullName: {
            $concat: [
              "$customerDetails.firstName",
              " ",
              "$customerDetails.lastName",
            ],
          },
          idFile: {
            $concat: [process.env.BASE_URL, "$customerDetails.idFile"],
          },
          totalPayment: {
            $sum: ["$totalAmount", "$advanceAmount"],
          },
          totalDays: {
            $cond: {
              if: {
                $eq: ["$checkOutDate", "$checkInDate"],
              },
              then: 1,
              else: {
                $divide: [
                  { $subtract: ["$checkOutDate", "$checkInDate"] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          __v: 0,
        },
      },
    ]);

    if (!reservationData || reservationData.length === 0)
      return res.status(404).json({ message: "No Data Found." });
    res.status(200).json({ reservationData });
  } catch (error) {
    console.error("Failed to fetch reservation data:", error);
    res.status(400).json({ error: "Failed to fetch reservation data" });
  }
};

//delete specific item api----------------
const deleteReservation = async (req, res) => {
  const hotelId = new mongoose.Types.ObjectId(req.body.hotelId);
  const reservationId = new mongoose.Types.ObjectId(req.params.id);
  const token = req.headers.token;
  try {
    const isReservationDeleted = await reservation.updateOne(
      {
        _id: reservationId,
      },
      {
        $set: {
          status: "checked-out",
          FinalCheckOutTime: req.body.FinalCheckOutTime,
          paymentOption: req.body.paymentOption,
        },
      }
    );

    if (isReservationDeleted) {
      console.log(
        "room No--------------------------------------------------",
        req.body.roomNo
      );
      let updateRoom = await Room.updateOne(
        { roomNo: req.body.roomNo, hotelId },
        {
          $set: {
            bookingStatus: "false",
            checkIn: null,
            checkOut: null,
          },
        }
      );
        // Fetch hotel details
    const reservationDetail = await reservation.findById(reservationId);
    if (!reservationDetail) {
          throw new Error("Reservation not found");
    }
    
        console.log("Reservation details:", reservationDetail);
    const hoteldetails = await Hotel.findById(hotelId);
    if (!hoteldetails) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    const customerIds = reservationDetail.customers;
    const customers = await Customer.find({ _id: { $in: customerIds } });
    const recipientEmails = customers.map((customer) => customer.email);

    console.log("Recipient emails:", recipientEmails);

    // Send check-in emails if the feature is enabled
    if (hoteldetails.mailCheckOutButtonStatus) {
      await sendEmailToCustomersOnCheckOut(
        token,
        req.body.FinalCheckOutTime,
        hoteldetails.name,
        recipientEmails
      );
    }
    console.log("Hotel details:", hoteldetails);

      console.log(updateRoom);
      res.status(200).json({ message: "done", isReservationDeleted });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "error", err });
  }
};

const sendEmailToCustomersOnCheckOut = async (
  token,
  checkOutTime,
  hotelName,
  recipientEmails
) => {
  try {
    const emailContent = `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333;">
    
      <!-- Header Section -->
      <div style="background-color: #4CAF50; color: white; padding: 15px; text-align: center;">
        <h2 style="margin: 0;">Thank You for Staying with Us!</h2>
      </div>
  
      <!-- Body Section -->
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #ddd; padding: 20px; box-sizing: border-box;">
        <p style="font-size: 16px; line-height: 1.6;">Dear Guest,</p>
        <p style="font-size: 16px; line-height: 1.6;">We sincerely thank you for choosing <strong>${hotelName}</strong> for your recent stay.</p>
        <p style="font-size: 16px; line-height: 1.6;">Your check-out has been successfully completed on <strong>${checkOutTime}</strong>.</p>
        <p style="font-size: 16px; line-height: 1.6;">We hope your stay was pleasant. Should you need any assistance or wish to provide feedback, please <a href="mailto:support@${hotelName.toLowerCase().replace(/\s/g, '')}.com" style="color: #4CAF50; text-decoration: none;">contact us</a>.</p>
        <p style="font-size: 16px; line-height: 1.6;">We look forward to welcoming you back in the future.</p>
      </div>
  
      <!-- Footer Section -->
      <div style="background-color: #f4f4f4; color: #777; text-align: center; padding: 15px;">
        <p style="margin: 0;">Warm regards,</p>
        <p style="margin: 0;"><strong>The ${hotelName} Team</strong></p>
      </div>
      
    </div>
  `;
  
  
  


    await Promise.all(
      recipientEmails.map((email) =>
        sendEmail(
          email,
          `Thank You for Staying at ${hotelName} - Check-Out Confirmation`,
          emailContent,
          token
        )
      )
    );

    console.log("Check-out emails sent!");
  } catch (error) {
    console.error("Error sending check-out emails:", error);
  }
};

//chekcin specific room api----------------

const checkIn = async (req, res) => {
  const hotelId = new mongoose.Types.ObjectId(req.body.hotelId);
  const reservationId = new mongoose.Types.ObjectId(req.params.id);
  const token = req.headers.token;

  try {
    // Fetch hotel details
    const hoteldetails = await Hotel.findById(hotelId);
    if (!hoteldetails) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    console.log("Hotel details:", hoteldetails);

    // Check if room is already reserved
    const isRoomAlreadyReserved = await reservation.find({
      roomNo: req.body.roomNo,
      hotelId,
    });

    const activeReservation = isRoomAlreadyReserved.find(
      (res) => res.status === "active"
    );
    if (activeReservation) {
      return res.status(409).json({ error: "Room already reserved" });
    }

    // Set check-in details
    const finalCheckedInISO = new Date().toISOString();
    const isCheckedIn = await reservation.updateOne(
      { _id: reservationId },
      {
        $set: {
          status: "active",
          FinalCheckInTime: req.body.FinalCheckInTime,
          finalcheckedin: finalCheckedInISO,
        },
      }
    );
    if (!isCheckedIn.modifiedCount) {
      throw new Error("Failed to update reservation status");
    }

    // Fetch updated reservation details
    const reservationDetail = await reservation.findById(reservationId);
    if (!reservationDetail) {
      throw new Error("Reservation not found");
    }

    console.log("Reservation details:", reservationDetail);

    // Fetch customer details
    const customerIds = reservationDetail.customers;
    const customers = await Customer.find({ _id: { $in: customerIds } });
    const recipientEmails = customers.map((customer) => customer.email);

    console.log("Recipient emails:", recipientEmails);

    // Send check-in emails if the feature is enabled
    if (hoteldetails.mailCheckInButtonStatus) {
      await sendEmailToCustomersOnCheckIn(
        token,
        req.body.FinalCheckInTime,
        hoteldetails.name,
        recipientEmails
      );
    }

    // Update room status
    const updateRoom = await Room.updateOne(
      { roomNo: req.body.roomNo, hotelId },
      {
        $set: {
          bookingStatus: "active",
          checkIn: req.body.checkInDate,
          checkOut: req.body.checkOutDate,
        },
      }
    );
    if (!updateRoom.modifiedCount) {
      throw new Error("Failed to update room status");
    }

    return res.status(200).json({ message: "Check-in successful" });
  } catch (err) {
    console.error("Error during check-in:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const sendEmailToCustomersOnCheckIn = async (
  token,
  checkInTime,
  hotelName,
  recipientEmails
) => {
  try {
    const emailContent = `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333;">
      
      <!-- Header Section -->
      <div style="background-color: #4CAF50; color: white; padding: 15px; text-align: center;">
        <h2 style="margin: 0;">Welcome to ${hotelName}!</h2>
      </div>
  
      <!-- Body Section -->
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #ddd; padding: 20px; box-sizing: border-box;">
        <p style="font-size: 16px; line-height: 1.6;">Dear Guest,</p>
        <p style="font-size: 16px; line-height: 1.6;">We are pleased to inform you that your check-in was successfully completed at <strong>${checkInTime}</strong>.</p>
        <p style="font-size: 16px; line-height: 1.6;">If you need any assistance during your stay, feel free to contact our front desk.</p>
        <p style="font-size: 16px; line-height: 1.6;">Thank you for choosing <strong>${hotelName}</strong>. Enjoy your stay!</p>
      </div>
  
      <!-- Footer Section -->
      <div style="background-color: #f4f4f4; color: #777; text-align: center; padding: 15px;">
        <p style="margin: 0;">Best regards,</p>
        <p style="margin: 0;"><strong>The ${hotelName} Team</strong></p>
      </div>
    
    </div>
  `;
  

    await Promise.all(
      recipientEmails.map((email) =>
        sendEmail(
          email,
          `Welcome to ${hotelName} - Check-In Confirmation`,
          emailContent,
          token
        )
      )
    );

    console.log("Check-in emails sent!");
  } catch (error) {
    console.error("Error sending check-in emails:", error);
  }
};

const editreservation = async (req, res) => {
  console.log(
    "in reservation edit ------------->editreservation ------------->"
  );
  console.log("editreservation req.params.id ==>", req.params.id);
  console.log("editreservation req.body ==>", req.body);

  try {
    let result = await reservation.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to Update reservation:", err);
    res.status(400).json({ error: "Failed to Update reservation" });
  }
};

const editFoodItems = async (req, res) => {
  try {
    const foodItems = req.body;
    console.log(foodItems.length, "food items to add");

    if (!Array.isArray(foodItems) || foodItems.length === 0) {
      return res.status(400).json({ error: "No food items to add provided" });
    }
    for (const item of foodItems) {
      const existingItem = await reservation.findOne({
        _id: req.params.id,
        "foodItems.name": item.name,
      });

      if (existingItem) {
        await reservation.updateOne(
          {
            _id: req.params.id,
            "foodItems.name": item.name,
          },
          {
            $inc: { "foodItems.$.quantity": item.quantity },
          }
        );
      } else {
        await reservation.updateOne(
          { _id: new mongoose.Types.ObjectId(req.params.id) },
          {
            $push: {
              foodItems: {
                id: new mongoose.Types.ObjectId(item.id),
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              },
            },
          }
        );
      }
    }

    res.status(200).json({ message: "Food items updated successfully" });
  } catch (err) {
    console.error("Failed to update food items:", err);
    res.status(400).json({ error: "Failed to update food items" });
  }
};

// function for editing food quantity----------------------------------------------
const updateFoodQuantity = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;
    const id = new mongoose.Types.ObjectId(foodId);

    // Find the reservation document
    const reservationDoc = await reservation.findOne({ _id: req.params.id });

    if (!reservationDoc) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    const isQuantityUpdated = await reservation.updateOne(
      {
        _id: req.params.id,
        "foodItems.id": id,
      },
      {
        $set: { "foodItems.$.quantity": quantity },
      }
    );

    res
      .status(200)
      .json({ isQuantityUpdated, message: "Quantity updated successfully" });
  } catch (err) {
    console.error("Failed to update quantity:", err);
    res.status(400).json({ error: "Failed to update quantity" });
  }
};
//  for getting all the food items for a specific organisation
const getFoodItems = async (req, res) => {
  console.log(req.params);
  try {
    let foodItemsData = await reservation.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
        },
      },

      {
        $unwind: {
          path: "$foodItems",
        },
      },
      {
        $lookup: {
          from: "restaurants",
          localField: "foodItems.id",
          foreignField: "_id",
          as: "foodData",
        },
      },
      {
        $unwind: {
          path: "$foodData",
        },
      },
      {
        $group: {
          _id: "$_id",
          foodData: { $push: "$foodData" },
          foodItems: { $push: "$foodItems" },
        },
      },
      {
        $project: {
          _id: 1,
          foodItems: {
            $map: {
              input: "$foodItems",
              as: "item",
              in: {
                id: "$$item.id",
                name: "$$item.name",
                price: "$$item.price",
                quantity: "$$item.quantity",
                itemInformation: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$foodData",
                        as: "food",
                        cond: { $eq: ["$$food._id", "$$item.id"] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          foodItems: {
            $map: {
              input: "$foodItems",
              as: "item",
              in: {
                id: "$$item.id",
                name: "$$item.name",
                price: "$$item.price",
                quantity: "$$item.quantity",
                totalAmountFood: {
                  $multiply: ["$$item.price", "$$item.quantity"],
                },
                itemImage: {
                  $concat: [
                    process.env.BASE_URL,
                    "$$item.itemInformation.itemImage",
                  ],
                },
              },
            },
          },
        },
      },
    ]);

    if (foodItemsData.length === 0)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ foodItemsData });
  } catch (error) {
    console.error("Failed to fetch item data:", error);
    res.status(400).json({ error: "Failed to fetch item data" });
  }
};

//function to delete food items
//delete specific item api----------------
const deleteFoodItems = async (req, res) => {
  const reservationId = req.params.id;
  const itemIdToDelete = new mongoose.Types.ObjectId(req.body.data);

  try {
    console.log(
      "---------------------------------------------------------------------"
    );
    console.log("Reservation ID:", reservationId);
    console.log("Item ID to delete:", itemIdToDelete);
    console.log(
      "---------------------------------------------------------------------"
    );
    const result = await reservation.updateOne(
      { _id: reservationId },
      { $pull: { foodItems: { id: itemIdToDelete } } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Item deleted successfully" });
    } else {
      res.status(404).json({ message: "Item not found or already deleted" });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to delete item data" });
  }
};
const dailyReport = async (req, res) => {
  console.log("In dailyReport data ==>", req.params);

  try {
    let matchedData = [];

    const hotelId = new ObjectId(req.params.id);

    const startTimeIST = req?.params?.start;
    const endTimeIST = req?.params?.end;
    const paymentMode = req?.params?.mode;

    const startTimeMoment = moment(startTimeIST, "YYYY-MM-DD HH:mm:ss");
    const endTimeMoment = moment(endTimeIST, "YYYY-MM-DD HH:mm:ss");

    const startTime = parseInt(startTimeMoment.format("YYMMDDHHmm"));
    const endTime = parseInt(endTimeMoment.format("YYMMDDHHmm"));

    console.log("Start Time (HHMM):", startTime);
    console.log("End Time (HHMM):", endTime);

    let paymentModes = [];

    console.log("paymentmode============>>>>>", paymentMode);

    switch (paymentMode) {
      case "all":
        paymentModes = [
          "Cash",
          "Card",
          "UPI",
          "Net Banking",
          "mvola",
          "credit",
        ];
        break;
      case "upi":
        paymentModes = ["UPI"];
        break;
      case "card":
        paymentModes = ["Card"];
        break;
      case "netbanking":
        paymentModes = ["Net Banking"];
        break;
      case "cash":
        paymentModes = ["Cash"];
      case "mvola":
        paymentModes = ["mvola"];
      case "credit":
        paymentModes = ["credit"];
        break;
    }

    if (paymentMode == "mvola") {
      paymentModes = ["mvola"];
    }

    console.log("paymentModes=============>>>", paymentModes);

    const data = await reservation
      .find({
        hotelId: hotelId,
        paymentOption: { $in: paymentModes },
      })
      .lean();

    console.log("Data here ==>", data);

    if (data && data.length > 0) {
      for (let item of data) {
        console.log("item.finalcheckedin:", item.finalcheckedin);
        if (item.finalcheckedin) {
          const checkInDate = moment.utc(item.finalcheckedin);
          const checkInDateIST = checkInDate.tz("Asia/Kolkata");
          const checkInTime = parseInt(checkInDateIST.format("YYMMDDHHmm"));
          if (checkInTime >= startTime && checkInTime <= endTime) {
            let customerId = item?.customers[0];
            const customerData = await customer
              .findOne({ _id: customerId })
              .lean();
            console.log("customerData", customerData);
            matchedData.push({ ...item, customerData: customerData });
          }
        }
      }
      console.log("Matched Data:", matchedData);
    }

    res.status(200).json({ message: "Successfully found data", matchedData });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to fetch reservation data" });
  }
};

const addExtraStayCharges = async (req, res) => {
  let reservationId = new mongoose.Types.ObjectId(req.params.id);
  console.log("id in addExtraStayCharges : ", reservationId);
  console.log("req.body addExtraStayCharges ====> ", req.body);

  try {
    const isReservationUpdate = await reservation.updateOne(
      {
        _id: reservationId,
      },
      {
        $set: {
          stayExtensionReason: req.body.reason,
          extraStayCharge: req.body.charges,
        },
      }
    );
    console.log("isReservationUpdate : ", isReservationUpdate);
    res.status(200).json({
      message: "Reservation Update Successfully !!",
      isReservationUpdate,
    });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ error: "Failed to add extra chages on this reservation !!" });
  }
};

module.exports = {
  deleteReservation,
  editreservation,
  getSpecificReservation,
  getAllReservations,
  editFoodItems,
  getFoodItems,
  deleteFoodItems,
  updateFoodQuantity,
  checkIn,
  getAllActiveReservations,
  getAllPendingReservations,
  getAllCompleteReservation,
  getAllReservationForAdmin,
  getAllPendingAndActiveReservation,
  getAllActiveAndCompletedReservation,
  getAllActiveReservationCustomers,
  dailyReport,

  addExtraStayCharges,
};
