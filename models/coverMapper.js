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
 * 가림판 설정 저장
 * @param param 사용자 입력 데이터
 * @returns {boolean} 성공여부 반환
 */
async function insertCoverInfo(param) {
  try {
    const { user_id, title, imgUrl, backgroundColor, backgroundOpacity, text, textSize, textColor, ENTDT, ENTTM } = param;

    const [result] = await pool.query(
      `INSERT INTO sys.cover 
      (user_id, title, Img, color, opacity, text, text_size, text_color, ENTDT, ENTTM)
       VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, title, imgUrl, backgroundColor, backgroundOpacity, text, textSize, textColor, ENTDT, ENTTM]
    );

    if (result.affectedRows < 0) return false;
    return true;
  } catch (err) {
    console.error("가림판 설정 저장 중 오류:", err);
    throw err;
  }
}

module.exports = {
  insertCoverInfo,
};
