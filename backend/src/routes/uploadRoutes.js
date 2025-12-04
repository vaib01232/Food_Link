const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const authRoles = require("../middleware/authRoles");

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
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP, GIF`));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

const router = express.Router();

router.post("/image", authMiddleware, authRoles('donor'), (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File size too large. Maximum 10MB." });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ message: err.message || "Invalid file upload" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    const publicUrl = `${backendUrl}/uploads/${req.file.filename}`;
    res.status(201).json({ url: publicUrl, filename: req.file.filename });
  });
});

router.post("/images", authMiddleware, authRoles('donor'), (req, res) => {
  upload.array("images", 10)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File size too large. Maximum 10MB per file." });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ message: "Too many files. Maximum 10 files allowed." });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ message: err.message || "Invalid file upload" });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    const urls = req.files.map((f) => `${backendUrl}/uploads/${f.filename}`);
    res.status(201).json({ urls });
  });
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ message: err.message || "Upload failed" });
  }
  next();
});

module.exports = router;



