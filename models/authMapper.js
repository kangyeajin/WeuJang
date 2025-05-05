// 참고용 예시
const pool = require("../dbconfig.js");

/**
 * 사용자 기본정보 조회
 * @param {string} user_id 사용자 id
 * @returns {string} password
 */
async function getUserInfo(user_id) {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, password, name, email, birth, status FROM sys.USER WHERE user_id = ?',
      [user_id]
    );

    if (rows.length > 0) {
      return rows[0];
    } else {
      return null; // 해당 ID 없음
    }
  } catch (err) {
    console.error('비밀번호 조회 중 오류:', err);
    throw err;
  }
}

/**
 * 아이디 중복여부 확인
 * @param {string} user_id 신규ID
 * @returns {int} 0 : 사용가능 / 그외 : 사용 불가
 */
async function searchSameUserId(user_id) {
  try {
    const [rows] = await pool.query('SELECT user_id FROM sys.USER WHERE user_id = ?', [user_id]);
    return parseInt(rows.length);
  } catch (err) {
    console.error('아이디 중복여부 확인 중 오류:', err);
    throw err;
  }
};

/**
 * 유저 정보 등록
 * @param param 사용자 입력 데이터
 * @returns {boolean} 성공여부 반환
 */
async function insertUserInfo(param) {
  try {
    const { user_id, hashedPw, name, email, birth, creatDTM, coverSet, ENTDT, ENTTM } = param;
    const [result] = await pool.query(
      `INSERT INTO sys.USER (
      user_id, password, name, email, birth, creatDTM, STATUS, coverSet, ENTDT, ENTTM
      ) VALUES (?, ?, ?, ?, ?, ?, '1', ?, ?, ?)`,
      [user_id, hashedPw, name, email, birth, creatDTM, coverSet, ENTDT, ENTTM]);

    if (result.affectedRows < 0) return false;
    return true;
  } catch (err) {
    console.error('유저 정보 등록 중 오류:', err);
    throw err;
  }
};

module.exports = {
  getUserInfo,
  searchSameUserId,
  insertUserInfo,
};
