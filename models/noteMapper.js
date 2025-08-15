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
      `SELECT n.note_id, n.user_id, n.title, n.template, n.bookmark, n.sort, n.randomfg, n.ENTDT, n.ENTTM, n.UPDDT, n.UPDTM 
        ,(
          SELECT COUNT(*) 
          FROM sys.card c 
          WHERE c.note_id = n.note_id
        ) AS card_count
        FROM sys.note n
      WHERE n.user_id = ? ORDER BY n.sort desc`,
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
    const { note_id, cleanQuestion, cleanAnswer, cleanHint, ENTDT, ENTTM } = param;
    const [result] = await pool.query(
      `INSERT INTO card (note_id, question, answer, hint, ENTDT, ENTTM)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [note_id, cleanQuestion, cleanAnswer, cleanHint, ENTDT, ENTTM]
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
      `INSERT INTO card (note_id, question, answer, hint, star, bookmark, ENTDT, ENTTM)
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
 * @returns {wrongCnt} 틀린 횟수
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
    return rows[0].wrongCnt;
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
 * 카드 북마크 내역 조회
 * @param {string} user_id 사용자 id
 * @param {string} note_id 노트 id
 * @returns {Promise<Array>} recordset 반환
 */
async function getCardBookMark(param) {
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

/**
 * 노트 북마크 업데이트
 * @param {string} card_id 카드 id
 * @param {string} user_id 사용자 id
 * @param {string} bookmark 북마크여부
 * @returns {bookmark} 북마크 설정값 반환
 */
async function setCardBookMark(param) {
  try {
    const { card_id, bookmark } = param;
    const [result] = await pool.query(
      `UPDATE card SET bookmark  = ? WHERE card_id = ?`,
      [bookmark, card_id]
    );

    if (result.affectedRows < 1) return false;

    // 업데이트된 bookmark 값을 다시 조회
    const [rows] = await pool.query(
      `SELECT bookmark FROM card WHERE card_id = ?`,
      [card_id]
    );

    // 조회된 값 반환
    return rows[0].bookmark;
  } catch (err) {
    console.error("북마크 업데이트 중 오류:", err);
    throw err;
  }
}

/**
 * 카드 삭제
 * @param {string} card_id 카드 id
 * @returns {bookmark} 북마크 설정값 반환
 */
async function deleteCard(param) {
  try {
    const { card_id } = param;
    const [result] = await pool.query(
      `delete from card where card_id = ?`,
      [card_id]
    );

    if (result.affectedRows < 1) return false;

    // 조회된 값 반환
    return true;
  } catch (err) {
    console.error("카드 삭제 중 오류:", err);
    throw err;
  }
}

/**
 * 카드 수정
 * @param {string} card_id 카드 id
 * @param {string} question 문제
 * @param {string} answer 답
 * @returns {bookmark} 북마크 설정값 반환
 */
async function updateCard(param) {
  try {
    const { card_id, question, answer, hint, UPDDT, UPDTM } = param;
    const [result] = await pool.query(
      `update card set question= ?, answer= ?, hint = ?, UPDDT= ?, UPDTM= ? where card_id = ?`,
      [question, answer, hint, UPDDT, UPDTM, card_id]
    );

    if (result.affectedRows < 1) return false;

    // 업데이트된 bookmark 값을 다시 조회
    const [rows] = await pool.query(
      `SELECT note_id, question, answer, hint, star FROM card WHERE card_id = ?`,
      [card_id]
    );

    // 조회된 값 반환
    return rows;
  } catch (err) {
    console.error("카드 수정 중 오류:", err);
    throw err;
  }
}

/**
 * 노트 수정
 * @param {string} user_id 사용자 id
 * @param {string} note_id 노트 id
 * @param {string} title 제목
 * @param {string} template 템플릿
 * @returns {bookmark} 북마크 설정값 반환
 */
async function updateNote(param) {
  try {
    const { user_id, note_id, title, template, UPDDT, UPDTM } = param;

    // 동적으로 쿼리 구성
    let setClauses = [];
    let params = [];

    // 필드가 있는 경우에만 SET 절에 추가
    if (title !== undefined && title !== null) {
      setClauses.push("title = ?");
      params.push(title);
    }
    if (template !== undefined && template !== null) {
      setClauses.push("template = ?");
      params.push(template);
    }

    // 공통적으로 항상 업데이트되는 항목
    setClauses.push("UPDDT = ?", "UPDTM = ?");
    params.push(UPDDT, UPDTM);

    // WHERE 절
    params.push(note_id, user_id);

    // 최종 쿼리
    const sql = `
      UPDATE sys.note
      SET ${setClauses.join(', ')}
      WHERE note_id = ? AND user_id = ?`;

    const [result] = await pool.query(sql, params);

    if (result.affectedRows < 1) return false;
    return true;
  } catch (err) {
    console.error("카드 수정 중 오류:", err);
    throw err;
  }
}


/**
 * 노트 삭제
 * @param {string} user_id 사용자 id
 * @param {string} note_id 노트 id
 */
async function deleteNote(param) {
  try {
    const { user_id, note_id } = param;
    const [result] = await pool.query(
      `delete from note where note_id = ? and user_id = ?`,
      [note_id, user_id]
    );

    if (result.affectedRows < 1) { return false;}
    else {
      // 카드 삭제
      const [noteResult] = await pool.query(
        `delete from card where note_id = ?`,
        [note_id]
      );

      if (noteResult.affectedRows < 1) return false;
    }

    // 조회된 값 반환
    return true;
  } catch (err) {
    console.error("노트 삭제 중 오류:", err);
    throw err;
  }
}

/**
 * 모의고사 문제 랜덤 조회
 * @param {Promise<Array>} notes 노트 id
 * @param {string} cardNum 문제 개수
 * @returns {Promise<Array>} recordset 반환
 */
async function selExamCards(param) {
  try {
    const { cardNum, notes } = param;
    if (!Array.isArray(notes) || notes.length === 0) {
      throw new Error("note_id는 필수값 입니다.");
    }

    const placeholders = notes.map(() => '?').join(','); // ?, ?, ?
    const sql = `
      SELECT *
      FROM card
      WHERE note_id IN (${placeholders})
      ORDER BY RAND()
      LIMIT ?
    `;
    const [rows] = await pool.query(sql, [...notes, Number(cardNum)]);
    return rows.length > 0 ? rows : null;
  } catch (err) {
    console.error("모의고사 문제 랜덤 조회 중 오류:", err);
    throw err;
  }
}
/**
 * 모의고사 결과저장
 * @param {string} user_id 사용자 id
 * @param {string} notes 노트 id
 * @param {string} try_count 시도횟수
 * @param {string} total_count 문제 개수
 * @param {string} entdt 등록일자
 * @param {string} enttm 등록시간
 * @returns {boolean} 성공여부 반환
 */
async function instExamResult(param) {
  try {
    const { user_id, cardNum, notes, failCnt, ENTDT, ENTTM} = param;

    // note_id → title 변환
    const [rows] = await pool.query(
      `
        SELECT GROUP_CONCAT(title SEPARATOR '/') AS titles
        FROM sys.note
        WHERE note_id IN (?)
      `,
      [notes.split(',')]
    );
    const noteTitles = rows[0]?.titles || '';

    const [result] = await pool.query(
      `INSERT INTO sys.studylog (user_id, note_id, try_count, total_count, entdt, enttm)
             VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, noteTitles, failCnt, cardNum, ENTDT, ENTTM]
    );

    if (result.affectedRows <= 0) return false;

    // 학습여부 UPDATE
    const [updateResult] = await pool.query(
      `UPDATE sys.user_att SET studyFg = 1 WHERE user_id = ? and loginDt = ?`,
      [user_id, ENTDT]
    );

    if (updateResult.affectedRows <= 0) {
      console.warn("user_att 업데이트 실패 또는 영향 없음");
    }

    return true;
  } catch (err) {
    console.error("모의고사 결과저장 중 오류:", err);
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
  getCardBookMark,
  setCardBookMark,
  deleteCard,
  updateCard,
  updateNote,
  deleteNote,
  selExamCards,
  instExamResult,
};
