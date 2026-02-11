const Room = require("../../model/schema/room");
const multer = require("multer");
const fs = require("fs");
const express = require("express");
const path = require("path");
const app = express();
const Reservation = require("../../model/schema/reservation");
const mongoose = require("mongoose");



//===================== MULTER STORAGE =====================//

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = "uploads/rooms";
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  },
});

exports.upload = multer({ storage });

//===================== ADD ROOM =====================//

exports.add = async (req, res) => {
  try {
    let {
      roomNo,
      floor,
      hotelId,
      description,
      capacity,
      childrenCapacity,
      status,
      amenities,
      pricingOptions
    } = req.body;

    if (!roomNo || !floor || !hotelId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Parse pricingOptions
    const parsedPricing =
      typeof pricingOptions === "string"
        ? JSON.parse(pricingOptions)
        : pricingOptions;

    if (!parsedPricing || !parsedPricing.length) {
      return res.status(400).json({ error: "Pricing options required" });
    }

    const primary = parsedPricing.find(p => p.isPrimary);
    if (!primary) {
      return res.status(400).json({ error: "Primary price required" });
    }

    const slug = roomNo.replace(/\s+/g, "").toLowerCase();

    const exists = await Room.findOne({ room_slug: slug, hotelId });
    if (exists) {
      return res.status(400).json({ error: "Room already exists" });
    }

    const parsedAmenities = amenities ? JSON.parse(amenities) : [];
    const image = req.file ? req.file.path : null;

    const room = new Room({
      roomNo,
      room_slug: slug,
      hotelId,

      // 🔁 backward compatibility
      roomType: primary.roomType,
      bookingType: primary.bookingType,
      amount: primary.price,

      // 🆕 new structure
      pricingOptions: parsedPricing,

      floor,
      description,
      capacity,
      childrenCapacity,
      status,
      amenities: parsedAmenities,
      image,
    });

    await room.save();
    return res.status(200).json({ message: "Room added", room });

  } catch (err) {
    console.error("ADD ROOM ERROR:", err);
    return res.status(500).json({ error: "Failed to create room" });
  }
};



//===================== GET ALL ROOMS =====================//

exports.getAll = async (req, res) => {
  try {
    // const rooms = await Room.find({ hotelId: req.params.hotelId });
    const hotelId = new mongoose.Types.ObjectId(req.params.hotelId);

    const rooms = await Room.find({ hotelId });

    const reservations = await Reservation.find({
      hotelId: req.params.hotelId,
      status: { $in: ["active", "pending"] }
    });


    const normalized = rooms.map((room) => {
      const roomReservations = reservations.filter(
        (r) => r.roomNo === room.roomNo
      );

      const usedAdults = roomReservations.reduce(
        (sum, r) => sum + Number(r.adults || 0),
        0
      );

      const usedKids = roomReservations.reduce(
        (sum, r) => sum + Number(r.kids || 0),
        0
      );

      let status = "Available";

      const primary = room.pricingOptions?.find(p => p.isPrimary);
      const bookingType = primary?.bookingType?.toLowerCase();

      if (bookingType === "shared") {
        if (usedAdults === 0 && usedKids === 0) {
          status = "Available";
        } else if (
          usedAdults >= room.capacity &&
          usedKids >= room.childrenCapacity
        ) {
          status = "Booked";
        } else {
          status = "Partially Available";
        }
      } else {
        // Individual / Double / Non-shared
        if (roomReservations.length > 0) {
          status = "Booked";
        }
      }


      return {
        ...room.toObject(),
        status,
        usedAdults,
        usedKids
      };
    });

    return res.json(normalized);

  } catch {
    return res.status(500).json({ error: "Failed to get rooms" });
  }
};

//===================== GET ALL ROOMS (ADMIN) =====================//
// Get all rooms from ALL hotels - for admin dashboard
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({});
    return res.json(rooms);
  } catch {
    return res.status(500).json({ error: "Failed to get all rooms" });
  }
};


//===================== UPDATE ROOM =====================//

exports.update = async (req, res) => {
  try {
    let {
      roomNo,
      roomType,
      bookingType,
      floor,
      amount,
      description,
      capacity,
      childrenCapacity,
      status,
      amenities,
      hotelId
    } = req.body;

    const slug = roomNo.replace(/\s+/g, "").toLowerCase();

    const exists = await Room.findOne({
      _id: { $ne: req.params.id },
      room_slug: slug,
      hotelId,
    });

    if (exists)
      return res.status(400).json({ error: "Room number already exists" });

    // Amenities parsing fix
    const amenitiesArray = Array.isArray(amenities)
      ? amenities
      : JSON.parse(amenities || "[]");

    const updateData = {
      roomNo,
      room_slug: slug,
      roomType,
      bookingType,
      floor,
      amount,
      description,
      capacity,
      childrenCapacity,
      status,
      amenities: amenitiesArray,
    };

    if (req.file) updateData.image = req.file.path;

    const updated = await Room.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.log("UPDATE ROOM ERROR:", err);
    return res.status(500).json({ error: "Failed to update room" });
  }
};

//===================== DELETE ROOM =====================//

exports.delete = async (req, res) => {
  console.log("🔥 DELETE API HIT WITH ID:", req.params.id);
  try {
    await Room.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete room" });
  }
};

exports.updatePrimaryPricing = async (req, res) => {
  try {
    const { pricingIndex } = req.body;
    const roomId = req.params.id;

    if (pricingIndex === undefined) {
      return res.status(400).json({ error: "Pricing index required" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (!room.pricingOptions || !room.pricingOptions.length) {
      return res.status(400).json({ error: "No pricing options found" });
    }

    // 🔁 Update primary flags
    room.pricingOptions = room.pricingOptions.map((p, i) => ({
      ...p.toObject(),
      isPrimary: i === pricingIndex
    }));

    // 🔄 Sync old fields
    const primary = room.pricingOptions[pricingIndex];
    room.roomType = primary.roomType;
    room.bookingType = primary.bookingType;
    room.amount = primary.price;

    await room.save();

    return res.status(200).json({
      message: "Primary pricing updated",
      room
    });

  } catch (err) {
    console.error("UPDATE PRIMARY PRICING ERROR:", err);
    return res.status(500).json({ error: "Failed to update primary pricing" });
  }
};

