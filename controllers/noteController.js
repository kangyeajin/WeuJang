const { getUserNoteLists } = require("../models/noteMapper");

/**
 * 사용자 노트 리스트 조회
 */
async function getNoteLists(user_id) {
  return await getUserNoteLists(user_id);
}

module.exports = { getNoteLists };
