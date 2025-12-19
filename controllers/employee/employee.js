
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const employee = require("../../model/schema/employee");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000/api/";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/employee/Idproof";
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uploadDir = "uploads/employee/Idproof";
    const fileName = file.originalname;
    const filePath = path.join(uploadDir, fileName);

    if (fs.existsSync(filePath)) {
      const timestamp = Date.now() + Math.floor(Math.random() * 90);
      const base = fileName.split(".")[0];
      const ext = fileName.split(".")[1];
      const uniqueFileName = `${base}-${timestamp}.${ext}`;
      cb(null, uniqueFileName);
    } else {
      cb(null, fileName);
    }
  }
});

const upload = multer({ storage });

const addItems = async (req, res) => {
  console.log("req.body Data.... ==>", req.body);
  try {
    req.body.createdDate = new Date();

    // ensure default status when not provided
    if (!req.body.status || req.body.status === "") {
      req.body.status = "Pending";
    }

    // <-- NEW: ensure bank fields exist (frontend should send these names)
    req.body.bankAccountNumber =
      req.body.bankAccountNumber ||
      req.body.bankAccount ||
      req.body.bank_account ||
      req.body.accountNumber ||
      req.body.account_number ||
      "";
    req.body.ifscCode =
      req.body.ifscCode ||
      req.body.ifsc ||
      req.body.IFSC ||
      req.body.ifsc_code ||
      "";

    if (req.files && req.files.idFile && req.files.idFile[0]) {
      const filePath = `uploads/employee/Idproof/${req.files.idFile[0].filename}`;
      req.body.idFile = filePath;
    }

    if (req.files && req.files.idFile2 && req.files.idFile2[0]) {
      const filePath2 = `uploads/employee/Idproof/${req.files.idFile2[0].filename}`;
      req.body.idFile2 = filePath2;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;

    // create using req.body (now contains bank fields)
    const employeeObj = await employee.create(req.body);

    res.status(200).json(employeeObj);
  } catch (err) {
    console.error("Failed to add employee:", err);
    res.status(400).json({ error: "Failed to Add employee" });
  }
};

const getAllItems = async (req, res) => {
  const hotelId = req.params.hotelId;
  try {
    const employeeData = await employee.aggregate([
      {
        $match: {
          hotelId: new mongoose.Types.ObjectId(hotelId)
        }
      },
      {
        $addFields: {
          idFile: {
            $cond: [
              { $or: [{ $eq: ["$idFile", null] }, { $eq: ["$idFile", ""] }] },
              null,
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$idFile",
                      regex: /^uploads\//
                    }
                  },
                  { $concat: [BASE_URL, "$idFile"] },
                  {
                    $concat: [BASE_URL, "uploads/employee/Idproof/", "$idFile"]
                  }
                ]
              }
            ]
          },
          idFile2: {
            $cond: [
              { $or: [{ $eq: ["$idFile2", null] }, { $eq: ["$idFile2", ""] }] },
              null,
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$idFile2",
                      regex: /^uploads\//
                    }
                  },
                  { $concat: [BASE_URL, "$idFile2"] },
                  {
                    $concat: [BASE_URL, "uploads/employee/Idproof/", "$idFile2"]
                  }
                ]
              }
            ]
          },
          fullName: {
            $concat: ["$firstName", " ", "$lastName"]
          }
        }
      }
    ]);

    console.log("employeeData ==>", employeeData);

    if (!employeeData) return res.status(404).json({ message: "no Data Found." });

    // employeeData will already contain bankAccountNumber & ifscCode from schema
    res.status(200).json({ employeeData });
  } catch (error) {
    console.error("Failed to fetch item data:", error);
    res.status(400).json({ error: "Failed to fetch item data" });
  }
};

const getSpecificEmployee = async (req, res) => {
  try {
    const employeeData = await employee.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id)
        }
      },
      {
        $addFields: {
          idFile: {
            $cond: [
              { $or: [{ $eq: ["$idFile", null] }, { $eq: ["$idFile", ""] }] },
              null,
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$idFile",
                      regex: /^uploads\//
                    }
                  },
                  { $concat: [BASE_URL, "$idFile"] },
                  {
                    $concat: [BASE_URL, "uploads/employee/Idproof/", "$idFile"]
                  }
                ]
              }
            ]
          },
          idFile2: {
            $cond: [
              { $or: [{ $eq: ["$idFile2", null] }, { $eq: ["$idFile2", ""] }] },
              null,
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$idFile2",
                      regex: /^uploads\//
                    }
                  },
                  { $concat: [BASE_URL, "$idFile2"] },
                  {
                    $concat: [BASE_URL, "uploads/employee/Idproof/", "$idFile2"]
                  }
                ]
              }
            ]
          },
          fullName: {
            $concat: ["$firstName", " ", "$lastName"]
          }
        }
      }
    ]);

    if (!employeeData) return res.status(404).json({ message: "no Data Found." });

    // employeeData[0] will have bankAccountNumber & ifscCode if saved
    res.status(200).json({ employeeData });
  } catch (error) {
    console.error("Failed to fetch item data:", error);
    res.status(400).json({ error: "Failed to fetch item data" });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await employee.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "done", item });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

const editShift = async (req, res) => {
  try {
    const result = await employee.updateOne({ _id: req.params.id }, { $set: req.body });
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to Update shift:", err);
    res.status(400).json({ error: "Failed to Update shift" });
  }
};

const editEmployee = async (req, res) => {
  console.log("req file aari he ====>", req.files);
  try {
    const employeeRecord = await employee.findById(req.params.id);
    console.log("employeeRecord ==>", employeeRecord);

    let idFilePath = employeeRecord?.idFile;
    let idFile2Path = employeeRecord?.idFile2;

    if (req.files) {
      if (req.files.idFile && req.files.idFile.length > 0) {
        idFilePath = `uploads/employee/Idproof/${req.files.idFile[0].filename}`;
        req.body.idFile = idFilePath;
      }

      if (req.files.idFile2 && req.files.idFile2.length > 0) {
        idFile2Path = `uploads/employee/Idproof/${req.files.idFile2[0].filename}`;
        req.body.idFile2 = idFile2Path;
      }
    }

    // <-- NEW: Accept bank fields from req.body (already present if frontend sends them)
    req.body.bankAccountNumber =
      req.body.bankAccountNumber ||
      req.body.bankAccount ||
      req.body.bank_account ||
      req.body.accountNumber ||
      req.body.account_number ||
      employeeRecord?.bankAccountNumber ||
      "";
    req.body.ifscCode =
      req.body.ifscCode ||
      req.body.ifsc ||
      req.body.IFSC ||
      req.body.ifsc_code ||
      employeeRecord?.ifscCode ||
      "";

    const updateData = { $set: req.body };
    await employee.updateOne({ _id: req.params.id }, updateData);

    res.status(200).json({ message: "Employee updated successfully" });
  } catch (err) {
    console.error("Failed to update employee:", err);
    res.status(400).json({ error: "Failed to update employee" });
  }
};

const addPermissions = async (req, res) => {
  console.log("--------------------- in addPermissions -----------------");
  console.log("req.params.id =>", req.params.id);
  console.log("req.body =>", req.body);

  try {
    const updatedEmployee = await employee.findByIdAndUpdate(
      req.params.id,
      { permissions: req.body.permissions },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    console.log("Updated Employee:", updatedEmployee);
    res.status(200).json({
      message: "Permissions updated successfully",
      employee: updatedEmployee
    });
  } catch (error) {
    console.log("Found Error", error);
    res.status(500).json({
      message: "An error occurred while updating permissions",
      error: error.message
    });
  }
};

const changePasswordForStaff = async (req, res) => {
  console.log(
    "----------------- changePasswordForStaff -------------------req.body ==>",
    req.body
  );
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const result = await employee.updateOne(
      { email: req.body.email },
      {
        $set: {
          password: hashedPassword
        }
      }
    );
    console.log("result =>", result);
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to change password :", err);
    res.status(400).json({ error: "Failed to change password" });
  }
};

const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Employee login attempt =>", email);

    const emp = await employee.findOne({ email });

    if (!emp) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, emp.password || "");
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const status = (emp.status || "").toLowerCase();

    if (status !== "active") {
      return res.status(403).json({
        message: "Your account is not active. Please contact the administrator."
      });
    }

    return res.status(200).json({
      message: "Login successful",
      employee: {
        _id: emp._id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        status: emp.status,
        role: emp.role,
        hotelId: emp.hotelId
      }
    });
  } catch (err) {
    console.error("Employee login error:", err);
    return res.status(500).json({ message: "Server error while logging in" });
  }
};

module.exports = {
  addItems,
  deleteItem,
  upload,
  getAllItems,
  editShift,
  editEmployee,
  getSpecificEmployee,
  addPermissions,
  changePasswordForStaff,
  loginEmployee
};
