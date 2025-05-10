const { getUserNoteLists, insertNoteInfo, getUserCardLists, insertCard, insertCards,
  updateWrongCnt, getUserNoteInfo, getCardBookMark, setCardBookMark, deleteCard, updateCard } = require("../models/noteMapper");
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
    const { note_id, question, answer, hint } = req;

    // html 태그 제거
    const [cleanQuestion, cleanAnswer, cleanHint] =
      [question, answer, hint].map(val => clean(val));

    // 기본 입력 검증
    if (!note_id || !cleanQuestion || !cleanAnswer) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const { DT: ENTDT, TM: ENTTM } = getDate();
    const param = { note_id, cleanQuestion, cleanAnswer, cleanHint, ENTDT, ENTTM };

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
        // 전체 실패 처리
        return res.status(400).send('누락된 값이 존재합니다. 파일을 확인해주세요.');
        // console.send(`누락된 필수 값 (note_id: ${note_id}, question: ${question}, answer: ${answer})`);
        // continue;
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

/**
 * 틀린갯수 카운트
 */
async function setWrongCnt(req) {
  try {
    const { card_id, wrongCnt } = req;
    // 기본 입력 검증
    if (!card_id) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = { card_id, wrongCnt };

    return updateWrongCnt(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 사용자 노트 개별 조회
 */
async function getNoteInfo(req) {
  try {
    const { user_id, note_id } = req;
    // 기본 입력 검증
    if (!user_id || !note_id) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = { user_id, note_id };

    return getUserNoteInfo(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 노트 북마크 내역 조회
 */
async function getCardBookMarkList(req) {
  try {
    const { note_id, user_id } = req;
    // 기본 입력 검증
    if (!user_id || !note_id) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = { user_id, note_id };

    return getCardBookMark(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 북마크 설정
 */
async function setCardBookMarkUpd(req) {
  try {
    const { card_id, bookmark } = req;
    // 기본 입력 검증
    if (!card_id) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = { card_id, bookmark };

    return setCardBookMark(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 카드 삭제
 */
async function delCard(req) {
  try {
    const { card_id, bookmark } = req;
    // 기본 입력 검증
    if (!card_id) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = { card_id, bookmark };

    return deleteCard(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 카드 수정
 */
async function updCard(req) {
  try {
    const { card_id, question, answer, hint } = req;
    const { DT: UPDDT, TM: UPDTM } = getDate();
    // 기본 입력 검증
    if (!card_id || !question || !answer) {
      return res.status(400).send('필수 입력값이 누락되었습니다.');
    }
    const param = { card_id, question, answer, hint, UPDDT, UPDTM };

    return updateCard(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}



module.exports = {
  getNoteLists, createNote, getCardLists, addCard,
  importCardsFromExcel, setWrongCnt, getNoteInfo, getCardBookMarkList, setCardBookMarkUpd, delCard, updCard
};