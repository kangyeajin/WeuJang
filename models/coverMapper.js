// 참고용 예시
const pool = require("../dbconfig.js");

/**
 * 사용자별 가림판 목록 조회
 * @param {string} user_id 사용자 id
 * @returns {Promise<Array>} recordset 반환
 */
async function getUserCoverLists(user_id) {
  try {
    const [rows] = await pool.query(
      "SELECT cover_id, title FROM sys.cover WHERE user_id = ? ORDER BY cover_id",
      [user_id]
    );

    if (rows.length > 0) {
      return rows;
    } else {
      return null; // 해당 ID 없음
    }
  } catch (err) {
    console.error("사용자 가림판 정보 조회 중 오류:", err);
    throw err;
  }
}

/**
 * 가림판 설정 정보 조회
 * @param {string} cover_id 가림판 id
 * @param {string} user_id 사용자 id
 * @returns {Promise<Array>} recordset 반환
 */
async function getCoverInfo(user_id, cover_id) {
  try {
    const [rows] = await pool.query(
      `SELECT cover_id, title, Img, color, opacity, text, text_size, text_color, question_color, answer_color, answer_opacity, ENTDT, ENTTM, UPDDT, UPDTM
        FROM sys.cover
        WHERE cover_id = ? and user_id = ? `,
      [cover_id, user_id]
    );

    if (rows.length > 0) {
      return rows[0];
    } else {
      return null;
    }
  } catch (err) {
    console.error("사용자 가림판 정보 조회 중 오류:", err);
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
    const { user_id, title, imgUrl, backgroundColor, backgroundOpacity, text, textSize, textColor, questionColor, answerColor, answerOpacity, ENTDT, ENTTM } = param;

    const [result] = await pool.query(
      `INSERT INTO sys.cover 
      (user_id, title, Img, color, opacity, text, text_size, text_color, question_color, answer_color, answer_opacity, ENTDT, ENTTM)
       VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, title, imgUrl, backgroundColor, backgroundOpacity, text, textSize, textColor, questionColor, answerColor, answerOpacity, ENTDT, ENTTM]
    );

    if (result.affectedRows < 0) return false;
    return true;
  } catch (err) {
    console.error("가림판 설정 저장 중 오류:", err);
    throw err;
  }
}

/**
 * 가림판 설정 수정
 * @param param 사용자 입력 데이터
 * @returns {boolean} 성공여부 반환
 */
async function updateCoverInfo(param) {
  try {
    const { cover_id, user_id, title, imgUrl, backgroundColor, backgroundOpacity, text, textSize, textColor, questionColor, answerColor, answerOpacity, UPDDT, UPDTM } = param;
    const [result] = await pool.query(
      `UPDATE sys.cover 
      SET title= ?, Img= ?, color= ?, opacity= ?, text= ?, text_size= ?, text_color= ?, question_color= ?, answer_color= ?, answer_opacity= ?, UPDDT= ?, UPDTM= ?
      WHERE cover_id= ? and user_id= ?
      `,
      [title, imgUrl, backgroundColor, backgroundOpacity, text, textSize, textColor, questionColor, answerColor, answerOpacity, UPDDT, UPDTM, cover_id, user_id]
    );

    if (result.affectedRows < 0) return false;
    return true;
  } catch (err) {
    console.error("가림판 설정 수정 중 오류:", err);
    throw err;
  }
}

/**
 * 가림판 설정 삭제
 * @param {string} cover_id 가림판 id
 * @param {string} user_id 사용자 id
 * @returns {boolean} 성공여부 반환
 */
async function DeleteCoverInfo(user_id, cover_id) {
  try {
    const [result] = await pool.query(
      `DELETE FROM sys.cover
      WHERE cover_id= ? and user_id= ?`,
      [cover_id, user_id]
    );

    if (result.affectedRows < 0) return false;
    return true;
  } catch (err) {
    console.error("가림판 설정 삭제 중 오류:", err);
    throw err;
  }
}

/**
 * 사용중인 가림판 정보 조회
 * @param {string} user_id 가림판 id
 * @returns {boolean} 성공여부 반환
 */
async function getSelectedCoverId(user_id) {
  try {
    const [result] = await pool.query(
      `SELECT cover_id 
        FROM sys.user 
        WHERE user_id= ? `,
      [user_id]
    );

    if (result.length > 0) {
      return result[0].cover_id;
    } else {
      return -1;
    }
  } catch (err) {
    console.error("가림판 설정 저장 중 오류:", err);
    throw err;
  }
}

/**
 * 사용자 기본 가림판 정보 수정
 * @param param 기본 정보
 * @returns {boolean} 성공여부 반환
 */
async function updateCoverId(param) {
  try {
    const { user_id, cover_id, UPDDT, UPDTM } = param;
    const [result] = await pool.query(
      `UPDATE sys.user 
        SET cover_id= ? , UPDDT= ? , UPDTM= ? 
        WHERE user_id= ? `,
      [cover_id, UPDDT, UPDTM, user_id]
    );

    if (result.affectedRows < 0) return false;
    return true;
  } catch (err) {
    console.error("가림판 설정 저장 중 오류:", err);
    throw err;
  }
}

module.exports = {
  getUserCoverLists,
  getCoverInfo,
  insertCoverInfo,
  updateCoverInfo,
  DeleteCoverInfo,
  getSelectedCoverId,
  updateCoverId,
};
