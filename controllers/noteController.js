const { getUserNoteLists, insertNoteInfo, getUserCardLists, insertCard, insertCards, } = require("../models/noteMapper");
const { clean } = require('../utils/sanitize');
const { getDate } = require('../utils/date');
const xlsx = require('xlsx');

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
async function getCardLists(note_id, page) {
  return await getUserCardLists(note_id, page, 30);
}

/**
 * 카드 생성
 */
async function addCard(req) {
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

/**
 * 카드 일괄 등록
 */
async function importCardsFromExcel(req) {
  try {

    const { note_id } = req.body;
    const { DT: ENTDT, TM: ENTTM } = getDate();

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);
    const values = [];

    for (const row of rows) {
      // html 태그 제거
      const question = clean(row.question);
      const answer = clean(row.answer?.toString());
      const hint = clean(row.hint || '');

      // 필수값 검증
      if (!note_id || !question || !answer) {
        // 로그만 남기고 continue 또는 전체 실패 처리
        console.warn(`누락된 필수 값 (note_id: ${note_id}, question: ${question}, answer: ${answer})`);
        continue; // 또는 return res.status(400).send('...');
      }

      values.push([
        note_id.toString(),
        question,
        answer,
        hint,
        row['star(0~3)']?.toString() || '0',
        ENTDT,
        ENTTM,
      ]);
    }

    return insertCards(values);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}


module.exports = { getNoteLists, createNote, getCardLists, addCard, importCardsFromExcel };