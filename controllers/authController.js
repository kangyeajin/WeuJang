const { getUserInfo, searchSameUserId, insertUserInfo } = require("../models/authMapper");

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
        const { user_id, password, name, email, birth, coverSet } = req;

        // 비밀번호 형식 체크

        // 비밀번호 암호화
        const hashedPw = await bcrypt.hash(password, saltRounds);

        // 날짜값 자동 생성여부 확인필요
        const now = new Date();
        const creatDTM = now.toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
        const today = now.toISOString().slice(0, 10).replace(/-/g, '');
        const time = now.toTimeString().slice(0, 8).replace(/:/g, '');

        const param = { user_id, hashedPw, name, email, birth, creatDTM, coverSet, today, time };
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

    // 테스트용 계정
    if (username === 'admin' && password === '1234') {
        req.session.user = {
            id: "admin",
            name: "관리자",
            email: "admin@mail.com",
            birth: "19990101",
            status: 1,
        };
        return res.status(200).json({ message: "로그인 성공!", redirect: "/main" });
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
            };
            console.log(req.session.user);

            // 출석체크

            return res.status(200).json({ message: "로그인 성공!", redirect: "/main" });
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