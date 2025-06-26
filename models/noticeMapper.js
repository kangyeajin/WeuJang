// 참고용 예시
const pool = require("../dbconfig.js");

/**
 * 공지사항 목록 조회
 */
async function getNoticeInfo() {
  try {
    const [rows] = await pool.query(
      `SELECT notice_id, TITLE, CONTENT, HIT, FIXFG, SHOWFG, ENTDT, ENTTM, ENTID, UPDDT, UPDTM, UPDID
       FROM sys.notice where SHOWFG = '1'
       ORDER BY FIXFG desc, notice_id DESC`
    );

    if (rows.length > 0) {
      return rows;
    } else {
      return null; // 해당 ID 없음
    }
  } catch (err) {
    console.error('공지사항 목록 조회 중 오류:', err);
    return null;
  }
}

/**
 * 공지사항 상세 조회
 * @param {string} notice_id 공지사항 id
 */
async function getNoticeDetail(param) {
  try {
    const { notice_id } = param;
    const [rows] = await pool.query(
      `SELECT notice_id, TITLE, CONTENT, HIT, FIXFG, SHOWFG, ENTDT, ENTTM, ENTID, UPDDT, UPDTM, UPDID FROM sys.notice 
      WHERE notice_id = ? and SHOWFG = '1' `,
      [notice_id]
    );

    if (rows.length > 0) {
      return rows[0];
    } else {
      return null; // 해당 ID 없음
    }
  } catch (err) {
    console.error('공지사항 상세 조회 중 오류:', err);
    return null;
  }
}

module.exports = {
  getNoticeInfo, 
  getNoticeDetail,
};
