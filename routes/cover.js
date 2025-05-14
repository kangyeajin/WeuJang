const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
    getCoverLists,
    getCoverOption,
    createCover,
    updateCover,
    setUserCoverId,
} = require("../controllers/coverController");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

/* 가림판 기본 설정 */
const defaultCoverOpt = { title: "", opacity: 0.87, color: "#ff0000", text: "", text_size: 16, text_color: "#000000", Img: "" };

/* 가림판 화면 이동 */
router.get(`/edit`, async (req, res) => {
    const cover_id = req.query?.coverId || '';
    const user_id = req.session.user?.id || "admin";

    // 기본 가림판 설정 적용 - 생성
    var coverSettings = defaultCoverOpt;
    var page = { mode: "create", coverId: cover_id };

    // 사용자가 선택한 가림판 설정 적용 - 편집
    if (cover_id) {
        const Info = await getCoverOption(user_id, cover_id);
        if (Info != null) coverSettings = Info;
        page.mode = "update";
    }

    console.log(coverSettings);

    res.render(`cover/edit`, {
        layout: "main",
        title: "가림판 꾸미기",
        cover: coverSettings,
        page: page,
        cssFile: `/css/cover/edit.css`,
        jsFile: `/js/cover/edit.js`,
    });
});

/* 가림판 목록 화면 이동 */
router.get(`/list`, async (req, res) => {
    // 로긴 귀찮아서 임시로 고정
    const user_id = req.session.user?.id || "admin"

    // 현재 사용중인 cover_id 값 가져오기 
    const cover_id = req.session.user?.coverId || -1;
    console.log("cover_id : ", cover_id);

    // 가림판 리스트 
    const coverList = await getCoverLists(user_id);

    res.render(`cover/list`, {
        layout: "main",
        title: "가림판 선택",
        covers: coverList || [],
        selectedCoverId: cover_id,
        cssFile: `/css/cover/list.css`,
        jsFile: `/js/cover/list.js`,
    });
});

// 이미지 파일 저장 위치
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads'),
    filename: (req, file, cb) => {
        const user_id = req.session.user?.id || "admin";
        const ext = path.extname(file.originalname); // 확장자 추출
        const baseName = path.basename(file.originalname, ext);

        // 파일명을 안전한 형태로 변환 (영문 + 타임스탬프)
        const safeName = baseName.replace(/[^a-z0-9]/gi, '_'); // 한글 등 제거
        cb(null, `${Date.now()}-${user_id}-${safeName}${ext}`);
    }
});

const upload = multer({ storage });

// 이미지 업로드
router.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // 도메인 등록 전까지는 개발 서버의 IP 주소 및 포트 포함한 http://121.166.19.3:5001/uploads/_.jpg 형식으로 DB에 저장되도록 함
    const protocol = req.protocol;
    const host = req.headers.host;
    // 반환할 URL (프론트에서 접근 가능한 경로)
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({ url: imageUrl });
});

// 업로드한 이미지 삭제 
router.post(`/delete-image`, (req, res) => {
    const filename = req.body.filename;
    if (!filename) return res.status(400).json({ error: "파일명이 없습니다" });

    const filepath = path.join(__dirname, "../public/uploads", `${filename}`);

    fs.unlink(filepath, (err) => {
        if (err) {
            console.error("파일 삭제 실패:", err);
            return res.status(500).json({ error: "파일 삭제 실패" });
        }
        res.json({ success: true });
    });
});

// 가림판 기본값 변경 및 적용 
router.post('/change', async (req, res) => {
    const user_id = req.session.user?.id || "admin";
    const cover_id = req.body.cover_id;
    console.log({ user_id, cover_id });
    try {
        // user 테이블의 기본 가림판(cover_id) 변경
        if (await setUserCoverId({ user_id, cover_id })) {

            //session 수정
            req.session.user.coverId = cover_id;

            // 기본 가림판 설정 적용
            if (cover_id == "-1") {
                return res.json(defaultCoverOpt);
            }

            // 사용자가 선택한 가림판 설정 적용
            const Info = await getCoverOption(user_id, cover_id);
            if (Info != null) {
                res.json(Info);
            }
            else {
                res.status(500).json({ message: "가림판 설정을 불러오는데 실패했습니다." });
            }
        }
        else {
            res.status(500).json({ message: "가림판 설정에 실패했습니다." });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "서버오류" });
    }
});

// 가림판 조회 및 적용
router.post('/options', async (req, res) => {
    const user_id = req.session.user?.id || "admin";
    const cover_id = req.body.cover_id;
    try {
        // 기본 가림판 설정 적용
        if (cover_id == "-1") {
            return res.json(defaultCoverOpt);
        }
        // 가림판 상세 조회
        const Info = await getCoverOption(user_id, cover_id);
        if (Info != null) {
            res.json(Info);
        }
        else {
            res.status(500).json({ message: "가림판 설정을 불러오는데 실패했습니다." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "서버오류" });
    }
});

// 가림판 설정 저장
router.post('/saveSettings', async (req, res) => {
    // 로긴 귀찮아서 임시로 고정
    req.body.user_id = req.session.user?.id || "admin";

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

// 가림판 설정 저장
router.post('/updateSettings', async (req, res) => {
    // 로긴 귀찮아서 임시로 고정
    req.body.user_id = req.session.user?.id || "admin";

    try {
        if (await updateCover(req.body)) {
            res.send("가림판 설정이 수정되었습니다.");
        }
        else {
            res.status(500).send("가림판 설정 수정 중 오류가 발생했습니다.\r\n다시 시도해주세요.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("서버 오류");
    }
});


module.exports = router;