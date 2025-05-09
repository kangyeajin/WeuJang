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
 * @param {string} page 페이지 번호
 * @param {string} page limit 페이지당 30개씩 조회
 * @returns {Promise<Array>} recordset 반환
 */
async function getUserCardLists(note_id, page, limit) {
  try {
    const offset = (page - 1) * limit;  // 페이지 마다 시작 위치 계산
    const rownumStart = offset; // 예: page = 2 → offset = 30 → rownumStart = 30

    const [rows] = await pool.query(
      `SELECT 
     @rownum := @rownum + 1 AS num,
     c.card_id, c.note_id, c.question, c.answer, c.hint, c.star,
     c.ENTDT, c.ENTTM, c.UPDDT, c.UPDTM, c.wrongCnt, c.bookmark
   FROM 
     (SELECT * FROM sys.card WHERE note_id = ? LIMIT ? OFFSET ?) c,
     (SELECT @rownum := ?) r`,
      [note_id, limit, offset, rownumStart]
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

/**
 * 문제 등록
 * @param param 사용자 입력 데이터
 * @returns {boolean} 성공여부 반환
 */
async function insertCard(param) {
  try {
    const { note_id, cleanQuestion, cleanAnswer, cleanHint, star, ENTDT, ENTTM } = param;
    const [result] = await pool.query(
      `INSERT INTO card (note_id, question, answer, hint, star, ENTDT, ENTTM)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [note_id, cleanQuestion, cleanAnswer, cleanHint, star, ENTDT, ENTTM]
    );

    if (result.affectedRows < 0) return false;
    return true;
  } catch (err) {
    console.error("문제 등록 중 오류:", err);
    throw err;
  }
}

/**
 * 문제 일괄 등록
 * @param {Map} param 사용자 입력 데이터
 * @returns {boolean} 성공여부 반환
 */
async function insertCards(param) {
  try {
  const [result] = await pool.query(
    `INSERT INTO card (note_id, question, answer, hint, star, ENTDT, ENTTM)
    VALUES ? `, [param]);

    if (result.affectedRows < 0) return false;
      return true;
  } catch (err) {
    console.error("문제 등록 중 오류:", err);
    throw err;
  }
}

/**
 * 틀린 횟수 업데이트
 * @param param 사용자 입력 데이터
 * @returns {boolean} 성공여부 반환
 */
async function updateWrongCnt(param) {
  try {
    const { card_id, wrongCnt } = param;
    const [result] = await pool.query(
      `UPDATE card SET wrongCnt  = ? WHERE card_id = ?`,
      [wrongCnt, card_id]
    );

    if (result.affectedRows < 1) return false;

    // 업데이트된 wrongCnt 값을 다시 조회
    const [rows] = await pool.query(
      `SELECT wrongCnt FROM card WHERE card_id = ?`,
      [card_id]
    );

    // 조회된 값 반환
    return (rows[0]?.wrongCnt !== undefined && rows[0]?.wrongCnt !== null) ? rows[0].wrongCnt : false;
  } catch (err) {
    console.error("틀린 횟수 업데이트 중 오류:", err);
    throw err;
  }
}

/**
 * 사용자 노트 정보 조회
 * @param {string} user_id 사용자 id
 * @param {string} note_id 노트 id
 * @returns {Promise<Array>} recordset 반환
 */
async function getUserNoteInfo(param) {
  try {
    const { user_id, note_id } = param;
    const [rows] = await pool.query(
      `SELECT note_id, user_id, title, template, bookmark, sort, randomfg, ENTDT, ENTTM, UPDDT, UPDTM FROM sys.note 
      WHERE user_id = ? and note_id = ? ORDER BY sort`,
      [user_id, note_id]
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
 * 노트 북마크 내역 조회
 * @param {string} user_id 사용자 id
 * @param {string} note_id 노트 id
 * @returns {Promise<Array>} recordset 반환
 */
async function getNoteBookMark(param) {
  try {
    const { user_id, note_id } = param;
    const [rows] = await pool.query(
      `SELECT a.card_id,a.note_id, a.question, a.answer, a.hint, a.star, a.ENTDT, a.ENTTM,a.bookmark 
        FROM sys.card a
        left join sys.note b on a.note_id = b.note_id
      WHERE b.user_id = ? and a.note_id = ? and a.bookmark = 1 `,
      [user_id, note_id]
    );

    if (rows.length > 0) {
      return rows;
    } else {
      return null; // 해당 ID 없음
    }
  } catch (err) {
    console.error("노트 북마크 내역 조회 중 오류:", err);
    throw err;
  }
}

module.exports = {
  getUserNoteLists,
  insertNoteInfo,
  getUserCardLists,
  insertCard,
  insertCards,
  updateWrongCnt,
  getUserNoteInfo,
  getNoteBookMark,
};
