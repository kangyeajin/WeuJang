const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // 반환할 URL (프론트에서 접근 가능한 경로)
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});


module.exports = router;