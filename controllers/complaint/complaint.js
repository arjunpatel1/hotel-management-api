const complaint = require("../../model/schema/complaint");
const mongoose = require("mongoose");
const hotel = require("../../model/schema/hotel");

const addItems = async (req, res) => {
  try {
    req.body.createdDate = new Date();

    const complaintObject = await complaint.create(req.body);
    if (complaintObject) {
      res.status(200).json(complaintObject);
    } else {
      res.status(400).json({ error: "Failed to Add Complaint" });
    }
  } catch (err) {
    console.error("Failed to add Complaint:", err);
    res.status(400).json({ error: "Failed to Add Complaint" });
  }
};

//view all complaint based on the hotel id api-------------------------
const getAllItems = async (req, res) => {
  const hotelId = req.params.hotelId;
  try {
    const complaintData = await complaint.find({ hotelId });
    if (!complaintData)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ complaintData });
  } catch (error) {
    console.error("Failed to fetch complaint data:", error);
    res.status(400).json({ error: "Failed to fetch complaint data" });
  }
};

// view all complaint

const getAllComplaints = async (req, res) => {
  console.log("------------- in getAllComplaints -----------");
  try {
    const complaintData = await complaint.find();
    console.log("complaintData === >", complaintData);

    if (complaintData.length === 0) {
      return res.status(204).json({ message: "no Data Found." });
    }

    //merged hotel name here ...
    const mergedData = await Promise.all(
      complaintData.map(async (complaint) => {
        const data = await hotel.findById(complaint.hotelId);
        console.log("data ===> ===>", data);
        if (data) {
          return {
            ...complaint._doc,
            hotelName: `${data.name}`,
          };
        } else {
          return complaint;
        }
      })
    );
    console.log("mergedData ===>", mergedData);
    res.status(200).json({ mergedData });
  } catch (error) {
    console.error("Failed to fetch complaint data:", error);
    res.status(400).json({ error: "Failed to fetch complaint data" });
  }
};

//view speciific complaint api-------------------------
const getSpecificComplaint = async (req, res) => {
  const complaintId = new mongoose.Types.ObjectId(req.params.id);
  console.log("complaint id ==>", complaintId);
  try {
    const complaintData = await complaint.findOne({ _id: complaintId });
    console.log("complaintData ==>", complaintData);

    if (!complaintData) {
      return res.status(404).json({ message: "No Data Found." });
    }

    const hotelData = await hotel.findById(complaintData.hotelId);
    console.log("hotelData ===>", hotelData);

    if (hotelData) {
      const mergedData = {
        ...complaintData._doc,
        hotelName: hotelData.name,
        email: hotelData.email,
        contact: hotelData.contact,
        address: hotelData.address,
      };

      console.log("mergedData =========>", mergedData);
      return res.status(200).json({ mergedData });
    } else {
      return res.status(200).json({ complaintData });
    }
  } catch (error) {
    console.error("Failed to fetch complaint data:", error);
    res.status(400).json({ error: "Failed to fetch complaint data" });
  }
};


//delete specific item api----------------
const deleteItem = async (req, res) => {
  try {
    const id = req.params.id.trim();
    console.log("Deleting complaint with ID:", id);
    const item = await complaint.deleteOne({ _id: id });
    console.log("Delete result:", item);

    if (item.deletedCount === 0) {
      return res.status(404).json({ message: "Complaint not found or already deleted." });
    }

    res.status(200).json({ message: "done", item });
  } catch (err) {
    console.error("Error deleting complaint:", err);
    res.status(400).json({ message: "error", err });
  }
};

const editItem = async (req, res) => {
  try {
    let result = await complaint.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to Update complaint:", err);
    res.status(400).json({ error: "Failed to Update complaint" });
  }
};

// edit complaint status
const editComplaintStatus = async (req, res) => {
  const _id = new mongoose.Types.ObjectId(req.params.id);

  try {
    // Fetch the user data
    const complaintData = await complaint.findOne({ _id });

    if (!complaintData) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    const updatedStatusValue = !complaintData.status;

    // Update the user document
    const result = await complaint.updateOne(
      { _id: _id },
      { $set: { status: updatedStatusValue } }
    );

    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to change status :", err);
    res.status(400).json({ error: "Failed to change status" });
  }
};

module.exports = {
  addItems,
  deleteItem,
  getAllItems,
  editItem,
  getSpecificComplaint,
  getAllComplaints,
  editComplaintStatus,
};
