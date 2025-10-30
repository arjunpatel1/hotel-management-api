const Room = require("../../model/schema/room");
const EmailHistory = require("../../model/schema/email");
const PhoneCall = require("../../model/schema/phoneCall");
const Task = require("../../model/schema/task");
const MeetingHistory = require("../../model/schema/meeting");
const DocumentSchema = require("../../model/schema/document");
const reservation = require("../../model/schema/reservation");
const multer = require('multer')
const fs = require("fs");
const path = require("path");
const { parseDateOnly } = require("../../core/dateUtils");

const index = async (req, res) => {
  const query = req.query;
  query.deleted = false;

  // let result = await Room.find(query);

  let allData = await Room.find(query)
    .populate({
      path: "createBy",
      match: { deleted: false }, // Populate only if createBy.deleted is false
    })
    .exec();

  const result = allData.filter((item) => item.createBy !== null);
  res.send(result);
};

//Api for fetching all Rooms based on the hotel id--------------------------
const getAllRooms = async (req, res) => {
  const hotelId = req.params.hotelId;
  try {
    const allRooms = await Room.find({ hotelId });

    res.status(200).json(allRooms);
  } catch (err) {
    console.error("Failed to Fetch Room :", err);
    res.status(400).json({ error: "Failed to Fetch Room " });
  }
};
// View All Room which are vacant .
const getAllVacantRooms = async (req, res) => {
  const { hotelId, roomType } = req.params;
  
  try {
   
    const query = { 
      hotelId, 
      bookingStatus: false 
    };
    
    if (roomType) {
      query.roomType = roomType;
    }

    const vacantRooms = await Room.find(query);

    res.status(200).json(vacantRooms);
  } catch (err) {
    console.error("Failed to Fetch Vacant Rooms:", err);
    res.status(500).json({ error: "Failed to Fetch Vacant Rooms" }); 
  }
};

const getAllAvailableRooms = async (req, res) => {
  const { hotelId } = req.params;
  const { checkIn, checkOut, adult , childrenCapacity} = req.query;
 
  if (!hotelId || !checkIn || !checkOut || !adult) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }
 
  const checkInDate = parseDateOnly(checkIn);
  
  const checkOutDate = parseDateOnly(checkOut);
  
  const adultCount = parseInt(adult, 10);
  const childrenCount = parseInt(childrenCapacity, 10);
 
  try {
   
    const roomQuery = {
      hotelId,
      capacity: { $gte: adultCount },
      childrenCapacity : { $gte: childrenCount },
    };
 
 
    const allEligibleRooms = await Room.find(roomQuery);

   
    const overlappingReservations = await reservation.find({
      hotelId,
      $or: [
        {
          checkInDate: { $lt: checkOutDate },
          checkOutDate: { $gt: checkInDate },
        },
      ],
    });
    
   
    const bookedRoomNumbers = overlappingReservations.map(r => r.roomNo);
 
   
    const vacantRooms = allEligibleRooms.filter(room => !bookedRoomNumbers.includes(room.roomNo));
 
    res.status(200).json(vacantRooms);
  } catch (err) {
    console.error("Failed to fetch vacant rooms:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
 


const getAllRoomsForAdmin = async (req, res) => {
  try {
    const allRooms = await Room.find();
    res.status(200).json(allRooms);
  } catch (err) {
    console.error("Failed to Fetch Room :", err);
    res.status(400).json({ error: "Failed to Fetch Room " });
  }
};
//Api for customer of the booked room --------------------------
const reservedRoomCustomerData = async (req, res) => {
  const roomNo = Number(req.params.roomNo);

  console.log(typeof roomNo, "------------------------------------------->");
  try {
    const pipeline = [
      { $match: { roomNo: roomNo, status: "active" } },
      {
        $project: {
          _id: 0,
          reservationId: "$_id",
        },
      },
    ];

    const result = await reservation.aggregate(pipeline);

    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to Fetch reservation id  :", err);
    res.status(400).json({ error: "Failed to Fetch reservation id" });
  }
};

//Api for fetching specific user Rooms--------------------------
const getUserRooms = async (req, res) => {
  const createBy = req.params;
  try {
    const allRooms = await Room.find(createBy);

    res.status(200).json(allRooms);
  } catch (err) {
    console.error("Failed to Fetch Room :", err);
    res.status(400).json({ error: "Failed to Fetch Room " });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/rooms/images";
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uploadDir = "uploads/rooms/images";
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

const add = async (req, res) => {
  // try {
    const { roomNo, roomType, hotelId, amount, description, capacity, amenities ,childrenCapacity } = req.body;     
    
    if (!roomNo || !roomType || !hotelId) {
      return res.status(400).json({ error: "Room number, type, and hotel ID are required" });
    }

    const trimmedRoomNo = roomNo.trim();
    const roomSlug = trimmedRoomNo.replace(/\s+/g, '').toLowerCase();
    
    const existingRoom = await Room.findOne({ 
      hotelId, 
      room_slug: roomSlug 
    });
    
    if (existingRoom) {
      return res.status(400).json({ error: "Room already exists" });
    }

    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        images.push({
          path: file.path,
          filename: file.filename,
          mimetype: file.mimetype
        });
      }
    }
    const imagePaths = req.files.map(file => file.path); 


    const roomData = {
      roomNo: trimmedRoomNo,
      room_slug: roomSlug,
      roomType,
      hotelId,
      amount: parseFloat(amount) || 0,
      description: description || '',
      capacity: parseInt(capacity) || 1,
      childrenCapacity: parseInt(capacity) || 1,
      amenities: Array.isArray(amenities) ? amenities : JSON.parse(amenities || '[]'),
      images: imagePaths,
      createdDate: new Date(),
      bookingStatus: false,
      checkIn: null,
      checkOut: null
    };

    const room = new Room(roomData);
    await room.save();

    res.status(200).json(room);
  // } catch (err) {
  //   console.error("Failed to create Room:", err);
  //   res.status(400).json({ error: "Failed to create Room" });
  // }
};



const edit = async (req, res) => {
  // try {
    const { roomNo, roomType, hotelId, amount, description, capacity, amenities } = req.body;
    
    if (!roomNo || !roomType || !hotelId) {
      return res.status(400).json({ 
        success: false,
        error: "Room number, type, and hotel ID are required" 
      });
    }

    // 2. Process room number and create slug
    const trimmedRoomNo = roomNo.toString().trim();
    const roomSlug = trimmedRoomNo.replace(/\s+/g, '-').toLowerCase();

    // 3. Check for duplicate room number (excluding current room)
    const existingRoom = await Room.findOne({
      _id: { $ne: req.params.id },
      hotelId,
      $or: [
        { roomNo: trimmedRoomNo },
        { room_slug: roomSlug }
      ]
    });

    if (existingRoom) {
      return res.status(400).json({ 
        success: false,
        error: "Room with this number already exists" 
      });
    }

    // 4. Process images - keep existing if no new ones uploaded
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      // Use new images
      imagePaths = req.files.map(file => file.path);
    } else {
      // Keep existing images
      const currentRoom = await Room.findById(req.params.id);
      imagePaths = currentRoom?.images || [];
    }

    // 5. Prepare update data
    const updateData = {
      roomNo: trimmedRoomNo,
      room_slug: roomSlug,
      roomType,
      hotelId,
      amount: parseFloat(amount) || 0,
      description: description || '',
      capacity: parseInt(capacity) || 1,
      amenities: Array.isArray(amenities) ? amenities : JSON.parse(amenities || '[]'),
      images: imagePaths,
      updatedDate: new Date()
    };

    // 6. Update room
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ 
        success: false,
        error: "Room not found" 
      });
    }
    res.status(200).json(updatedRoom);
  // } catch (err) {
  //   console.error("Failed to Update Room:", err);
  //   res.status(400).json({ error: "Failed to Update Room" });
  // }
};

const editRoomStatus = async (req, res) => {
  try {
    let result = await Room.updateOne(
      { roomNo: req.params.roomNo },
      { $set: req.body }
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to Update Room:", err);
    res.status(400).json({ error: "Failed to Update Room" });
  }
};

const view = async (req, res) => {
  let Room = await Room.findOne({ _id: req.params.id });
  if (!Room) return res.status(404).json({ message: "no Data Found." });
  let Email = await EmailHistory.aggregate([
    { $match: { createByRoom: Room._id } },
    {
      $lookup: {
        from: "Rooms",
        localField: "createByRoom",
        foreignField: "_id",
        as: "createByrefRoom",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$createByRef", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$createByrefRoom", preserveNullAndEmptyArrays: true } },
    { $match: { "users.deleted": false } },
    {
      $addFields: {
        senderName: { $concat: ["$users.firstName", " ", "$users.lastName"] },
        deleted: {
          $cond: [
            { $eq: ["$createByRef.deleted", false] },
            "$createByRef.deleted",
            { $ifNull: ["$createByrefRoom.deleted", false] },
          ],
        },
        createByName: {
          $cond: {
            if: "$createByRef",
            then: {
              $concat: [
                "$createByRef.title",
                " ",
                "$createByRef.firstName",
                " ",
                "$createByRef.lastName",
              ],
            },
            else: { $concat: ["$createByrefRoom.RoomName"] },
          },
        },
      },
    },
    {
      $project: {
        createByRef: 0,
        createByrefRoom: 0,
        users: 0,
      },
    },
  ]);

  let phoneCall = await PhoneCall.aggregate([
    { $match: { createByRoom: Room._id } },
    {
      $lookup: {
        from: "Rooms",
        localField: "createByRoom",
        foreignField: "_id",
        as: "createByrefRoom",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$createByrefRoom", preserveNullAndEmptyArrays: true } },
    { $match: { "users.deleted": false } },
    {
      $addFields: {
        senderName: { $concat: ["$users.firstName", " ", "$users.lastName"] },
        deleted: "$createByrefRoom.deleted",
        createByName: "$createByrefRoom.RoomName",
      },
    },
    { $project: { createByrefRoom: 0, users: 0 } },
  ]);

  let task = await Task.aggregate([
    { $match: { assignmentToRoom: Room._id } },
    {
      $lookup: {
        from: "Room",
        localField: "assignmentToRoom",
        foreignField: "_id",
        as: "Room",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createBy",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$Room", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        assignmentToName: Room.RoomName,
        createByName: "$users.username",
      },
    },
    { $project: { Room: 0, users: 0 } },
  ]);

  let meeting = await MeetingHistory.aggregate([
    {
      $match: {
        $expr: {
          $and: [{ $in: [Room._id, "$attendesRoom"] }],
        },
      },
    },
    {
      $lookup: {
        from: "Room",
        localField: "assignmentToRoom",
        foreignField: "_id",
        as: "Room",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        attendesArray: "$Room.RoomEmail",
        createdByName: "$users.username",
      },
    },
    {
      $project: {
        users: 0,
      },
    },
  ]);

  const Document = await DocumentSchema.aggregate([
    { $unwind: "$file" },
    { $match: { "file.deleted": false, "file.linkRoom": Room._id } },
    {
      $lookup: {
        from: "users",
        localField: "createBy",
        foreignField: "_id",
        as: "creatorInfo",
      },
    },
    { $unwind: { path: "$creatorInfo", preserveNullAndEmptyArrays: true } },
    { $match: { "creatorInfo.deleted": false } },
    {
      $group: {
        _id: "$_id",
        folderName: { $first: "$folderName" },
        createByName: {
          $first: {
            $concat: ["$creatorInfo.firstName", " ", "$creatorInfo.lastName"],
          },
        },
        files: { $push: "$file" },
      },
    },
    { $project: { creatorInfo: 0 } },
  ]);

  res.status(200).json({ Room, Email, phoneCall, task, meeting, Document });
};

const deleteData = async (req, res) => {
  try {
    const room = await Room.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "done", room });
  } catch (err) {
    res.status(404).json({ message: "error", err });
    console.log(err);
  }
};

const deleteMany = async (req, res) => {
  try {
    const Room = await Room.updateMany(
      { _id: { $in: req.body } },
      { $set: { deleted: true } }
    );
    res.status(200).json({ message: "done", Room });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

const exportRoom = async (req, res) => { };

module.exports = {
  index,
  add,
  getUserRooms,
  getAllRooms,
  view,
  edit,
  deleteData,
  deleteMany,
  exportRoom,
  editRoomStatus,
  reservedRoomCustomerData,
  getAllRoomsForAdmin,
  getAllVacantRooms,
  getAllAvailableRooms,
  upload
};
