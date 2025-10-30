const multer = require("multer");
const fs = require("fs");
const path = require("path");
const visitors = require("../../model/schema/visitors");
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/visitors/Idproof";
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uploadDir = "uploads/visitors/Idproof";
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
  },
});
const upload = multer({ storage });

const addVisitors = async (req, res) => {
  try {
    const filePath = `uploads/visitors/Idproof/${req.file.filename}`;
    req.body.idFile = filePath;
    req.body.reservationId = new mongoose.Types.ObjectId(
      req.body.reservationId
    );
    req.body.hotelId = new mongoose.Types.ObjectId(req.body.hotelId);
    const visitorsObj = await visitors.create(req.body);
    console.log(visitorsObj);
    res.status(200).json(visitorsObj);
  } catch (err) {
    console.error("Failed to add visitors:", err);
    res.status(400).json({ error: "Failed to Add visitors" });
  }
};

//view all visitors api-------------------------
const getAllVisitors = async (req, res) => {
  try {
    const hotelId = new mongoose.Types.ObjectId(req.params.hotelId);
    const visitorsData = await visitors.find({ hotelId });

    if (visitorsData.length === 0)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ visitorsData });
  } catch (error) {
    console.error("Failed to fetch visitors data:", error);
    res.status(400).json({ error: "Failed to fetch visitors data" });
  }
};
const getSpecificvisitors = async (req, res) => {
  const phoneNumber = req.params.phone;
  const hotelId = new mongoose.Types.ObjectId(req.query.hotelId);
  console.log(phoneNumber, "---------------->", hotelId);

  try {
    let visitorsData = await visitors.aggregate([
      {
        $match: {
          phoneNumber: phoneNumber,
          hotelId: hotelId,
        },
      },
      {
        $addFields: {
          idFile: { $concat: [process.env.BASE_URL, "$idFile"] },
          fullName: {
            $concat: ["$firstName", " ", "$lastName"],
          },
        },
      },
    ]);

    if (visitorsData.length === 0)
      return res.status(404).json({ message: "No data found." });
    res.status(200).json({ visitorsData });
  } catch (error) {
    console.error("Failed to fetch visitors data:", error);
    res.status(500).json({ error: "Failed to fetch visitors data" });
  }
};

//delete specific item api----------------
const deleteItem = async (req, res) => {
  try {
    const item = await visitors.deleteOne({ phoneNumber: req.params.phone });
    res.status(200).json({ message: "done", item });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "error", err });
  }
};

const editvisitors = async (req, res) => {
  try {
    if (req.file) {
      const filePath = `uploads/visitors/Idproof/${req.file.filename}`;
      req.body.idFile = filePath;

      const visitorsRecord = await visitors.findById(req.params.id);
      if (visitorsRecord && visitorsRecord.idFile) {
        const oldFilePath = visitorsRecord.idFile;

        let result = await visitors.updateOne(
          { _id: req.params.id },
          { $set: req.body }
        );

        // Delete the older file from the server
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error("Failed to delete old file:", err);
          } else {
            console.log("Old file deleted successfully");
          }
        });
      }
    } else {
      let result = await visitors.updateOne(
        { _id: req.params.id },
        {
          $set: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            idCardType: req.body.idCardType,
            idcardNumber: req.body.idcardNumber,
            address: req.body.address,
          },
        }
      );

      console.log("not have a file");
    }

    // Respond with success message
    res.status(200).json({ message: "visitors updated successfully" });
  } catch (err) {
    console.error("Failed to Update visitors:", err);
    res.status(400).json({ error: "Failed to Update visitors" });
  }
};

module.exports = {
  addVisitors,
  deleteItem,
  upload,
  editvisitors,
  getAllVisitors,
  getSpecificvisitors,
};
