const { getUserInfo, searchSameUserId, insertUserInfo } = require("../models/authMapper");
const { getCoverOption } = require("./coverController");
const { getDate } = require('../utils/date');

const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * 사용가능 아이디 확인
 */
async function chkUserId(user_id) {
    return await searchSameUserId(user_id);
};

/**
 * 회원가입
 */
async function registerUser(req) {
    try {
        const { user_id, password, name, email, birth } = req;
        const { DT: ENTDT, TM: ENTTM } = getDate();
        const creatDTM = `${ENTDT}${ENTTM}`;

        // 비밀번호 암호화
        const hashedPw = await bcrypt.hash(password, saltRounds);

        const param = { user_id, hashedPw, name, email, birth, creatDTM, ENTDT, ENTTM };
        return insertUserInfo(param);

    } catch (error) {
        console.log("error : ", error);
    }
    return false;
}

/**
 * 로그인
 */
async function handleLogin(req, res, username, password) {

    // 가림판 default option 
    var coverSettings = { title: "", opacity: 0.87, color: "#ff0000", text: "", text_size: 16, text_color: "#000000", Img: "" };

    // 테스트용 계정
    if (username === 'admin' && password === '1234') {
        req.session.user = {
            id: "admin",
            name: "관리자",
            email: "admin@mail.com",
            birth: "19990101",
            status: 1,
            coverId: -1,
        };
        return res.status(200).json({ message: "로그인 성공!", redirect: "/main", cover: coverSettings });
    }

    try {
        // 1. DB에서 사용자 정보 조회
        const user = await getUserInfo(username);
        if (user == null)
            return res.status(401).json({ message: "존재하지 않는 계정입니다." });

        // 2. 비밀번호 비교
        if (await chkPw(password, user.password)) {

            // session에 사용자 정보 저장
            req.session.user = {
                id: user.user_id,
                name: user.name,
                email: user.email,
                birth: user.birth,
                status: user.status,
                coverId: user.cover_id,
            };
            console.log(req.session.user);

            // 출석체크

            // 가림판 상세 조회
            if (user.cover_id > -1) {
                coverSettings = await getCoverOption(user.user_id, user.cover_id);
            }
            return res.status(200).json({ message: "로그인 성공!", redirect: "/main", cover: coverSettings });
        }
        return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "서버오류발생 다시 한번 시도해 주세요." });
    }
}

/**
 * 비밀번호 비교
 */
async function chkPw(plainPassword, storedHashedPassword) {
    const match = await bcrypt.compare(plainPassword, storedHashedPassword);
    return match;
}

module.exports = { chkUserId, registerUser, handleLogin };