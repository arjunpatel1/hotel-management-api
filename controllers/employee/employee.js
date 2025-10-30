const multer = require("multer");
const fs = require("fs");
const path = require("path");
const employee = require("../../model/schema/employee");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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

const addItems = async (req, res) => {
  console.log("req.body Data.... ==>",req.body);
  try {
   
    req.body.createdDate = new Date();

    const filePath = `uploads/employee/Idproof/${req.files.idFile[0].filename}`;
    req.body.idFile = filePath;

    if (req.files && req.files.idFile2) {
      const filePath2 = `uploads/employee/Idproof/${req.files.idFile2[0].filename}`;
      req.body.idFile2 = filePath2;
    }

     const hashedPassword = await bcrypt.hash(req.body.password, 10);
     req.body.password = hashedPassword;

    const employeeObj = await employee.create(req.body);

    res.status(200).json(employeeObj);
  } catch (err) {
    console.error("Failed to add employee:", err);
    res.status(400).json({ error: "Failed to Add employee" });
  }
};

//view all empployee api-------------------------
const getAllItems = async (req, res) => {
  const hotelId = req.params.hotelId;
  try {
    let employeeData = await employee.aggregate([
      {
        $match: {
          hotelId: new mongoose.Types.ObjectId(hotelId),
        },
      },
      {
        $addFields: {
          idFile: { $concat: [process.env.BASE_URL, "$idFile"] },
          idFile2: { $concat: [process.env.BASE_URL, "$idFile2"] },
          fullName: {
            $concat: ["$firstName", " ", "$lastName"],
          },
        },
      },
    ]);

    console.log("employeeData ==>",employeeData);

    if (!employeeData)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ employeeData });
  } catch (error) {
    console.error("Failed to fetch item data:", error);
    res.status(400).json({ error: "Failed to fetch item data" });
  }
};
//view specific employee data api-------------------------
const getSpecificEmployee = async (req, res) => {
  try {
    let employeeData = await employee.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $addFields: {
          idFile: { $concat: [process.env.BASE_URL, "$idFile"] },
          idFile2: { $concat: [process.env.BASE_URL, "$idFile2"] },
          fullName: {
            $concat: ["$firstName", " ", "$lastName"],
          },
        },
      },
    ]);

    if (!employeeData)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ employeeData });
  } catch (error) {
    console.error("Failed to fetch item data:", error);
    res.status(400).json({ error: "Failed to fetch item data" });
  }
};

//delete specific item api----------------
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
    let result = await employee.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to Update shift:", err);
    res.status(400).json({ error: "Failed to Update shift" });
  }
};

// const editEmployee = async (req, res) => {
//   console.log("req file aari he ====>", req.files);
//   try {
//     if (req.files) {

//       if (req.files && req.files.idFile) {
//         const filePath = `uploads/employee/Idproof/${req.files.idFile[0].filename}`;
//         console.log("filePath ==>",filePath);
//         req.body.idFile = filePath;
//       }

//       if (req.files && req.files.idFile2) {
//         const filePath2 = `uploads/employee/Idproof/${req.files.idFile2[0].filename}`;
//         console.log("filePath2 ==>",filePath2);
//         req.body.idFile2 = filePath2;
//       }

//       const employeeRecord = await employee.findById(req.params.id);

//       console.log("employeeRecord ==>",employeeRecord);

//       if (employeeRecord && employeeRecord.idFile) {
//         const oldFilePath = employeeRecord.idFile;

//         let result = await employee.updateOne(
//           { _id: req.params.id },
//           { $set: req.body }
//         );

//         // Delete the older file from the server
//         fs.unlink(oldFilePath, (err) => {
//           if (err) {
//             console.error("Failed to delete old file:", err);
//           } else {
//             console.log("Old file deleted successfully");
//           }
//         });
//       }
//     } else {
//       console.log("not have a file");
//     }

//     res.status(200).json({ message: "Employee updated successfully" });
//   } catch (err) {
//     console.error("Failed to update employee:", err);
//     res.status(400).json({ error: "Failed to update employee" });
//   }
// };


const editEmployee = async (req, res) => {
  console.log("req file aari he ====>", req.files);
  try {
    const employeeRecord = await employee.findById(req.params.id);
    console.log("employeeRecord ==>", employeeRecord);

    let idFilePath = employeeRecord?.idFile;
    console.log("idFilePath =>", idFilePath);

    let idFile2Path = employeeRecord?.idFile2;
    console.log("idFile2Path =>", idFile2Path);

    if (req.files) {
      if (req.files.idFile && req.files.idFile.length > 0) {
        idFilePath = `uploads/employee/Idproof/${req.files.idFile[0].filename}`;
        console.log("new idFilePath ==>", idFilePath);
        req.body.idFile = idFilePath;
      }

      if (req.files.idFile2 && req.files.idFile2.length > 0) {
        idFile2Path = `uploads/employee/Idproof/${req.files.idFile2[0].filename}`;
        console.log("new idFile2Path ==>", idFile2Path);
        req.body.idFile2 = idFile2Path;
      }
    }

    const updateData = { $set: req.body };
    const result = await employee.updateOne({ _id: req.params.id }, updateData);

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
    console.log("in try");
    const updatedEmployee = await employee.findByIdAndUpdate(
      req.params.id,
      { permissions: req.body.permissions },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    console.log("Updated Employee:", updatedEmployee);
    res.status(200).json({ message: "Permissions updated successfully", employee: updatedEmployee });
  } catch (error) {
    console.log("Found Error", error);
    res.status(500).json({ message: "An error occurred while updating permissions", error: error.message });
  }
};


const changePasswordForStaff = async (req, res) => {
  console.log("----------------- changePasswordForStaff -------------------req.body ==>", req.body);
  try {
    console.log("in try changePasswordForStaff...");
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log("hashedPassword =>", hashedPassword);

    const result = await employee.updateOne(
      { email: req.body.email },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );
    console.log("result =>", result);
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to change password :", err);
    res.status(400).json({ error: "Failed to change password" });
  }
}




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
};
