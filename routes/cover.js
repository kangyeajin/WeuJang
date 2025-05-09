const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
    createCover,
} = require("../controllers/coverController");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// 이미지 업로드
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // 반환할 URL (프론트에서 접근 가능한 경로)
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

// 업로드한 이미지 삭제 
// DELETE /api/user/:id/image

// 가림판 설정 저장
router.post('/saveSettings', async (req, res) => {
    // req.body.user_id = req.session.user.id;
    // 로긴 귀찮아서 임시로 고정
    req.body.user_id = "admin";
    // console.log(req.body);

    try {
        if (await createCover(req.body)) {
            res.send("가림판 설정이 등록되었습니다.");
        }
        else {
            res.status(500).send("가림판 설정 등록 중 오류가 발생했습니다.\r\n다시 시도해주세요.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("서버 오류");
    }

});


module.exports = router;