const Hotel = require("../../model/schema/hotel");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const galleryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/hotel/gallery";
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname;
    const uploadDir = "uploads/hotel/gallery";
    if (fs.existsSync(path.join(uploadDir, fileName))) {
      const timestamp = Date.now() + Math.floor(Math.random() * 90);
      cb(null, `${fileName.split(".")[0]}-${timestamp}.${fileName.split(".")[1]}`);
    } else {
      cb(null, fileName);
    }
  },
});

const uploadGallery = multer({ storage: galleryStorage });

const getUploadedLogo = async (req, res) => {
  const hotelId = req.params.id;
  try {
    const hotel = await Hotel.find({ hotelId });
    res.status(200).json({
      message: "Last uploaded logo fetched successfully",
      logo: hotel,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateHotelImage = async (req, res) => {
  try {
    const file = req.file;
    const hotelId = req.params.id;

    const updatedHotel = await Hotel.findByIdAndUpdate(
      hotelId,
      {
        hotelImage: `uploads/logo/${file.filename}`,

      },
      { new: true }
    );

    if (!updatedHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json({
      message: "Hotel image updated successfully",
      hotel: updatedHotel,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const uploadMultiImage = async (req, res) => {
  const files = req.files;
  const hotelId = req.params.id;

  if (!hotelId) {
    return res.status(400).json({ message: "hotelId is required." });
  }

  if (!files || files.length === 0) {
    return res.status(400).json({ message: "No files uploaded." });
  }

  const uploadedFiles = files.map(
  (file) => `uploads/hotel/gallery/${file.filename}`
);

  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      hotelId,
      { $push: { images: { $each: uploadedFiles } } },
      { new: true }
    );

    if (!updatedHotel) {
      return res.status(404).json({ message: "Hotel not found." });
    }

    return res.status(200).json({
      message: "Images uploaded and saved successfully.",
      uploadedFiles,
      hotel: updatedHotel,
    });
  } catch (err) {
    console.error("Error updating hotel with images:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getHotelImages = async (req, res) => {
  const hotelId = req.params.id;
  if (!hotelId) {
    return res.status(400).json({ message: "hotelId is required." });
  }

  try {
    const hotel = await Hotel.findById(hotelId).select("images");
    const images = hotel?.images;

    return res.status(200).json({
      message: "Images fetched successfully.",
      images,
    });
  } catch (error) {
    console.error("Error fething hotel images:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteHotelImage = async (req, res) => {
  const hotelId = req.params.id;
  const { index } = req.body;
  if (!hotelId || index === undefined) {
    return res.status(400).json({ message: "hotelId and index are required." });
  }
  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found." });
    }
    if (index < 0 || index >= hotel.images.length) {
      return res.status(400).json({ message: "Invalid image index." });
    }
    hotel.images.splice(index, 1);
    await hotel.save();

    return res.status(200).json({
      message: "Image deleted successfully.",
      remainingImages: hotel.images,
    });
  } catch (error) {
    console.error("Error deleting hotel image:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  updateHotelImage,
  getUploadedLogo,
  uploadMultiImage,
  getHotelImages,
  deleteHotelImage,
  uploadGallery,
};
