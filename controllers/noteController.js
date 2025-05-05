const { getUserNoteLists, insertNoteInfo, getUserCardLists, insertCard } = require("../models/noteMapper");
const { clean } = require('../utils/sanitize');
const { getDate } = require('../utils/date');

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
    const { DT: ENTDT, TM: ENTTM } = getDate();
    const param = { user_id, title, template, ENTDT, ENTTM };
    return insertNoteInfo(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 노트별 카드 리스트 조회
 */
async function getCardLists(note_id) {
  return await getUserCardLists(note_id);
}

/**
 * 카드 생성
 */
async function createCard(req) {
  try {
    const { note_id, question, answer, hint, star } = req;

    // html 태그 제거
    const [cleanQuestion, cleanAnswer, cleanHint] =
      [question, answer, hint].map(val => clean(val));

    // 기본 입력 검증
    if (!note_id || !cleanQuestion || !cleanAnswer) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const { DT: ENTDT, TM: ENTTM } = getDate();
    const param = { note_id, cleanQuestion, cleanAnswer, cleanHint, star, ENTDT, ENTTM };

    return insertCard(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

module.exports = { getNoteLists, createNote, getCardLists, createCard };