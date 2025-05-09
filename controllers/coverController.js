const { insertCoverInfo } = require("../models/coverMapper");
const { getDate } = require('../utils/date');

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


module.exports = { createCover,};