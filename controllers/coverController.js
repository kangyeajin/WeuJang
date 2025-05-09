const { getUserCoverLists, getCoverInfo, insertCoverInfo } = require("../models/coverMapper");
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


module.exports = { getCoverLists, getCoverOption, createCover,};