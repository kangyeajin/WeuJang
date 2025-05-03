const express = require("express");
const router = express.Router();
const {
    getUserNoteLists,
    createNote,

} = require("../controllers/noteController");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// 회원가입
router.post("/register", async (req, res) => {
    if (await registerUser(req.body)) res.send("회원가입이 완료되었습니다.");
    else
        res
            .status(500)
            .send("회원가입 중 오류가 발생했습니다.\r\n다시 시도해주세요.");
});

// 노트 생성
router.post("/add", async (req, res) => {
    try {
        req.body.user_id = req.session.user.id;
        if (await createNote(req.body)) {
            res.send("수첩이 생성되었습니다.");
        }
        else {
            res.status(500).send("수첩 등록 중 오류가 발생했습니다.\r\n다시 시도해주세요.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("서버 오류");
    }
});

module.exports = router;