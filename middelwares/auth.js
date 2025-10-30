const jwt = require("jsonwebtoken");
// import Hotel from '../model/schema/hotel.js'
const Hotel = require("../model/schema/hotel.js");
const Employee = require("../model/schema/employee.js");

const auth = async (req, res, next) => {
  const token = req.headers.token;
  if (!token) {
    res.status(401).json({ message: "Authentication failed , Token missing" });
  }
  try {
    const decode = jwt.verify(token, "secret_key");
    req.user = decode;

    const { HotelId } = decode;

    let hotelID = HotelId;
    const userData = await Employee.findOne({ _id: HotelId }).lean();
    if (userData) {
      hotelID = userData?.hotelId;
    }
    const hotel = await Hotel.findOne({ _id: hotelID });
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    if (!hotel?.status) {
      return res
        .status(401)
        .json({ hotelstatus: hotel?.status, message: "Authentication failed" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Authentication failed. Invalid token." });
  }
};

module.exports = auth;
