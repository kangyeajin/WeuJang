const { getUserCoverLists, getCoverInfo, insertCoverInfo, updateCoverId } = require("../models/coverMapper");
const { getDate } = require('../utils/date');

/**
 * 가림판 목록 조회
 */
async function getCoverLists(user_id) {
  try {
    return getUserCoverLists(user_id);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 가림판 상세 조회
 */
async function getCoverOption(cover_id) {
  try {
    return getCoverInfo(cover_id);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 가림판 생성
 */
async function createCover(req) {
  try {
    const { user_id, title, imgUrl, backgroundColor, backgroundOpacity, text, textSize, textColor } = req;
    const { DT: ENTDT, TM: ENTTM } = getDate();

    const param = { user_id, title, imgUrl, backgroundColor, backgroundOpacity, text, textSize, textColor, ENTDT, ENTTM };
    return insertCoverInfo(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

/**
 * 사용자의 가림판 기본값 변경
 */
async function setUserCoverId(req) {
  try {
    const { user_id, cover_id } = req;
    const { DT: UPDDT, TM: UPDTM } = getDate();
    const param = { user_id, cover_id, UPDDT, UPDTM };
    return updateCoverId(param);
  } catch (error) {
    console.log("error : ", error);
  }
  return false;
}

module.exports = { getCoverLists, getCoverOption, createCover, setUserCoverId };