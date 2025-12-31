const express = require("express");
const {
  updateHotelImage,
  getUploadedLogo,
  uploadMultiImage,
  getHotelImages,
  deleteHotelImage,
  uploadGallery,
} = require("./uploadLogo");

const auth = require("../../middelwares/auth");
const upload = require("../../middelwares/multer");
const router = express.Router();

router.post("/uploadLogo/:id", upload.single("logo"), updateHotelImage);
router.post("/upload-images/:id", uploadGallery.array("image"), uploadMultiImage);
router.delete("/hotel/:id", deleteHotelImage);
router.get("/lastUploadedLogo/:id", getUploadedLogo);
router.get("/:id", getHotelImages);

module.exports = router;
