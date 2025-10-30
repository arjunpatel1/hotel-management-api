const multer = require('multer')
const fs = require("fs");
const path = require("path");

// const upload = multer({
//     dest: 'uploads/logo/', 
//     fileFilter: (req, file, cb) => {
//       if (file.mimetype.startsWith('image/')) {
//         cb(null, true);
//       } else {
//         cb(new Error('Only image files are allowed!'), false);
//       }
//     },
//   });


//   module.exports = upload


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/logo";
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uploadDir = "uploads/logo";
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

module.exports = upload; 
