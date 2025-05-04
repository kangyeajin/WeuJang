// 참고용 예시
const pool = require("../dbconfig.js");

/**
 * 사용자 노트 정보 조회
 * @param {string} user_id 사용자 id
 * @returns {Promise<Array>} recordset 반환
 */
async function getUserNoteLists(user_id) {
  try {
    const [rows] = await pool.query(
      "SELECT note_id, user_id, title, template, bookmark, sort, randomfg, ENTDT, ENTTM, UPDDT, UPDTM FROM sys.note WHERE user_id = ? ORDER BY sort",
      [user_id]
    );

    if (rows.length > 0) {
      return rows;
    } else {
      return null; // 해당 ID 없음
    }
  } catch (err) {
    console.error("사용자 노트 정보 조회 중 오류:", err);
    throw err;
  }
}

/**
 * 노트 생성
 * @param param 사용자 입력 데이터
 * @returns {boolean} 성공여부 반환
 */
async function insertNoteInfo(param) {
  try {
    const { user_id, title, template, ENTDT, ENTTM } = param;

    // 현재 최대 sort 값 가져오기
    const [rows] = await pool.query("SELECT MAX(sort) AS maxSort FROM sys.note");
    const nextSort = (rows[0].maxSort || 0) + 1;

    const [result] = await pool.query(
      `INSERT INTO sys.note (user_id, title, template, sort, ENTDT, ENTTM)
             VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, title, template, nextSort, ENTDT, ENTTM]
    );

    if (result.affectedRows < 0) return false;
    return true;
  } catch (err) {
    console.error("노트 생성 중 오류:", err);
    throw err;
  }
}

/**
 * 노트별 문제 정보 조회
 * @param {string} note_id 노트 id
 * @returns {Promise<Array>} recordset 반환
 */
async function getUserCardLists(note_id) {
  try {
    const [rows] = await pool.query(
      "SELECT card_id, note_id, question, answer, hint, star, ENTDT, ENTTM, UPDDT, UPDTM FROM sys.card WHERE note_id = ?",
      [note_id]
    );

    if (rows.length > 0) {
      return rows;
    } else {
      return null; // 해당 ID 없음
    }
  } catch (err) {
    console.error("[getUserNoteLists]문제 정보 조회 중 오류:", err);
    throw err;
  }
}

module.exports = {
  getUserNoteLists,
  insertNoteInfo,
  getUserCardLists,
};
