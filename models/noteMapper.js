// 참고용 예시
const pool = require("../dbconfig.js");

/**
 * 사용자 노트 정보 조회
 * @param {string} user_id 사용자 id
 * @returns {string}
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

module.exports = {
  getUserNoteLists,
};
