const OnlineTransaction = require("../../model/schema/OnlineTransaction");
const payment = require("../../model/schema/payment");

const getTotalPayment = async (req, res) => {
  try {
    let allData = await payment.aggregate([
      {
        $lookup: {
          from: "hotels",
          localField: "createdBy",
          foreignField: "_id",
          as: "hotelInformation",
        },
      },
      {
        $unwind: {
          path: "$hotelInformation",
        },
      },
      {
        $addFields: {
          hotelName: "$hotelInformation.name",
          packageName: "$title",
          duration: "$days",
          startDate: "$createdOn",
          endDate: {
            $add: ["$createdOn", { $multiply: ["$days", 24, 60, 60, 1000] }],
          },
        },
      },
      {
        $project: {
          hotelName: 1,
          amount: 1,
          packageName: 1,
          duration: 1,
          startDate: 1,
          endDate: 1,
          status: 1,
          type : 1,
          hotelId: "$createdBy",
        },
      },
    ]);

    const updatedPayments = [];

    for (let paymentsItem of allData) {
      console.log(paymentsItem);
      const endDate = new Date(paymentsItem.endDate);
      const currentDate = new Date();

      const difference = endDate - currentDate;

      let status;
      if (difference <= 0) {
        status = "expired";
      } else if (difference <= 2 * 24 * 60 * 60 * 1000) {
        status = "expiresSoon";
      } else {
        status = paymentsItem.status;
      }

      // Update payment status in the database
      await payment.updateOne({ _id: paymentsItem._id }, { $set: { status } });

      // Create a new object with the updated properties
      const updatedPayment = {
        ...paymentsItem,
        status: status,
      };
      updatedPayments.push(updatedPayment);
    }
    const totalRecords = updatedPayments.length;
    res.send({ paymentsData: updatedPayments, count: totalRecords });
  } catch (error) {
    console.error("Error while fetching payments data:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

const getPayment = async (req, res) => {
  try {
    const query = req.query;
    query.deleted = false;

    // Fetch payments data
    let allData = await payment.find({
      deleted: false,
      createdBy: req.query.createdBy,
    });

    // Calculate end date for each payment and update status
    const updatedPayments = [];
    for (let paymentsItem of allData) {
      const startDate = new Date(paymentsItem.createdOn);
      const endDate = new Date(
        startDate.getTime() + paymentsItem.days * 24 * 60 * 60 * 1000
      );
      const currentDate = new Date();

      const difference = endDate - currentDate;

      let status;
      if (difference <= 0) {
        status = "expired";
      } else if (difference <= 2 * 24 * 60 * 60 * 1000) {
        status = "expiresSoon";
      } else {
        status = paymentsItem.status;
      }
      // Update payment status in the database
      await payment.updateOne({ _id: paymentsItem._id }, { $set: { status } });

      // Create a new object with the updated properties
      const updatedPayment = {
        ...paymentsItem.toObject(),
        endDate: endDate.toISOString(),
        status: status,
      };

      // Add the updated payment to the array
      updatedPayments.push(updatedPayment);
    }

    const totalRecords = updatedPayments.length;
    res.send({ paymentsData: updatedPayments, count: totalRecords });
  } catch (error) {
    console.error("Error while fetching payments data:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

const add = async (req, res) => {
  try {
    if(req.body.isAdmin){
      req.body.type   = 'assign'
    }
    const payments = new payment(req.body);
    await payments.save();
    res.status(201).json({ payments, message: "Payments saved successfully" });
  } catch (err) {
    console.error("Failed to create Payments:", err);
    res.status(500).json({ error: "Failed to create Payments" });
  }
};

const edit = async (req, res) => {
  try {
    let result = await payment.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json({ result, message: "Payments updated successfully" });
  } catch (err) {
    console.error("Failed to Update Payments:", err);
    res.status(400).json({ error: "Failed to Update Payments" });
  }
};

const deleteData = async (req, res) => {
  try {
    let payments = await payment.findByIdAndUpdate(
      { _id: req.params.id },
      { deleted: true }
    );
    res
      .status(200)
      .json({ message: "payments deleted successfully", payments });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};
const createOnlineTransaction = async (req, res) => {
  try {
    const transaction = new OnlineTransaction(req.body);
    await transaction.save();

    res.status(201).json({
      transaction
    });
  } catch (err) {
    console.error('Transaction save failed:', err);
    res.status(500).json({
      message: 'Failed to save transaction',
      error: err.message
    });
  }
};

module.exports = { getPayment, getTotalPayment, add, edit, deleteData,createOnlineTransaction };
