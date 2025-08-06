// 참고용 예시
const pool = require("../dbconfig.js");

/**
 * 출석 기록 조회(월별)
 * @param {string} user_id 사용자 id
 * @param {string} yyyyMM 조회 연월
 */
async function selAttInfo(param) {
  try {
    const { user_id, yyyyMM } = param;
    const [rows] = await pool.query(
      `SELECT user_id, loginDt, studyFg
        FROM sys.user_att WHERE user_id = ? and loginDt LIKE CONCAT(?, '%')
       ORDER BY loginDt`,
      [user_id, yyyyMM]
    );

    if (rows.length > 0) {
      return rows;
    } else {
      return []; // 해당 ID 없음
    }
  } catch (err) {
    console.error('출석 기록 조회 중 오류:', err);
    return null;
  }
}

/**
 * 출석 기록 상세조회(모의고사 이력)
 * @param {string} user_id 사용자 id
 * @param {string} yyyyMMdd 조회 일자
 */
async function selAttDetail(param) {
  try {
    const { user_id, yyyyMMdd } = param;
    const [rows] = await pool.query(
      `SELECT study_id, user_id, note_id, try_count, total_count, ENTDT, ENTTM
        FROM sys.studylog WHERE user_id = ? and ENTDT = ?
        order by ENTTM`,
      [user_id, yyyyMMdd]
    );

    if (rows.length > 0) {
      // 각 row의 note_id 별 title 조회 후 추가
      for (const row of rows) {
        const titles = await getTitlesByNoteIds(row.note_id);
        // titles 배열을 '영어, 한국사, 수학' 형태 문자열로 만들기
        row.titles = titles.map(s => s.title).join(', ');
      }

      return rows;
    } else {
      return null; // 해당 ID 없음
    }
  } catch (err) {
    console.error('출석 기록 상세 조회 중 오류:', err);
    return null;
  }
}

async function getTitlesByNoteIds(noteIdStr) {
  const noteIds = noteIdStr.split('|'); // ['34', '29', '28']

  if (noteIds.length === 0) return [];

  // ? placeholders 개수만큼 생성
  const placeholders = noteIds.map(() => '?').join(',');

  const sql = `SELECT note_id, title FROM sys.note WHERE note_id IN (${placeholders})`;

  try {
    const [rows] = await pool.query(sql, noteIds);
    return rows; // [{note_id: '34', title: '영어'}, ...]
  } catch (err) {
    console.error('note title 조회 중 오류:', err);
    return [];
  }
}

module.exports = {
  selAttInfo, 
  selAttDetail,
};
