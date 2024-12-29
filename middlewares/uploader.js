const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "public/files",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const cleanFileName = file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueSuffix + "_" + cleanFileName);
  },
});

const uploader = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const supportedImage = /png|jpg|jpeg|pdf/;
    const extension = path.extname(file.originalname);

    if (supportedImage.test(extension)) {
      cb(null, true);
    } else {
      cb(new Error("Must be png/jpg/jpeg/pdf file"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = uploader;
