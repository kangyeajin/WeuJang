const { getUserNoteLists, insertNoteInfo } = require("../models/noteMapper");

/**
 * 사용자 노트 리스트 조회
 */
async function getNoteLists(user_id) {
  return await getUserNoteLists(user_id);
}

/**
 * 노트 생성
 */
async function createNote(req) {
  try {
    const { user_id, title, template } = req;

    // 날짜값 자동 생성여부 확인필요
    const today = new Date();
    const ENTDT = today.toISOString().slice(0, 10).replace(/-/g, "");
    const ENTTM = today.toTimeString().slice(0, 8).replace(/:/g, "");

    const param = { user_id, title, template, ENTDT, ENTTM };
    return insertNoteInfo(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

module.exports = { getNoteLists, createNote };
