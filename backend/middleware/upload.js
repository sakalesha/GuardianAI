import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/", "video/"];
  if (allowed.some((type) => file.mimetype.startsWith(type))) cb(null, true);
  else cb(new Error("Invalid file type! Only image/video allowed"), false);
};

export const upload = multer({ storage, fileFilter });
