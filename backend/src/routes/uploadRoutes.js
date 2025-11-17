const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const authRoles = require("../middleware/authRoles");

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || "";
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Invalid file type"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

const router = express.Router();

// Upload single image
router.post("/image", authMiddleware, authRoles('donor'), upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  // Return full URL with backend base URL
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
  const publicUrl = `${backendUrl}/uploads/${req.file.filename}`;
  res.status(201).json({ url: publicUrl, filename: req.file.filename });
});

// Upload multiple images
router.post("/images", authMiddleware, authRoles('donor'), upload.array("images", 5), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No files uploaded" });
  // Return full URLs with backend base URL
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
  const urls = req.files.map((f) => `${backendUrl}/uploads/${f.filename}`);
  res.status(201).json({ urls });
});

module.exports = router;



