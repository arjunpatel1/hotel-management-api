const express = require("express");
const db = require("./db/config");
const route = require("./controllers/route");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use('/logo', express.static('uploads/logo'));
// Set up CORS
app.use("/api/uploads", express.static("uploads"));


app.use(express.urlencoded({ extended: true }));
//API Routes
app.use("/api", route);

app.get("/", async (req, res) => {
  res.send("Welcome to my world...");
});


const server = app.listen(process.env.PORT, () => {
  console.log(`Server is listening on : ${process.env.PORT}`);
});

// Connect to MongoDB
const DATABASE_URL = process.env.DB_URL || "mongodb://127.0.0.1:27017";
// const DATABASE_URL = 'mongodb://127.0.0.1:27017'
const DATABASE = process.env.DB || "HotelManagement";

db(DATABASE_URL, DATABASE);
