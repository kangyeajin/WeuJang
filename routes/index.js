const express = require("express");
const router = express.Router();
const { getNoteLists, getCardLists } = require("../controllers/noteController");

/* API 라우터 */
// 사용자 관련 기능
router.use("/user", require("./auth"));

// 노트 관련 기능
router.use("/note", require("./note"))
/* 페이지 라우터 */

// 로그인 화면
router.get("/", (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.error("세션 제거 중 에러:", err);
        return res.send("Error logging out.");
      }
      res.clearCookie("connect.sid");
      return res.render("login", { layout: false });
    });
  } else {
    res.render("login", { layout: false });
  }
});

// 메인 노트 페이지
router.get("/main", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect("/");

    const noteList = await getNoteLists(userId);
    res.render("notes/notes", {
      page: "main",
      layout: "main",
      title: "외우장",
      cssFile: "/css/notes/notes.css",
      notes: noteList || [],
    });
  } catch (err) {
    console.error("메인 페이지 렌더링 오류:", err);
    res.status(500).send("Internal Server Error");
  }
});

// 카드 형식 페이지들
const cardPages = [
  { path: "cards_split", css: "cards_split.css", js: "cards_split.js"  },
  { path: "cards_filp", css: "cards_filp.css", js: "cards_filp.js" },
  { path: "cards_text", css: "cards_text.css", js: "cards_text.js"  },
  { path: "add_note", css: "add_note.css", js: "add_note.js" },
];

cardPages.forEach(({ path, css, js }) => {
  router.get(`/${path}`, async (req, res) => {
    const noteId = req.query.note_id; // 쿼리 파라미터에서 note_id를 가져옴
    if (!noteId) return res.redirect("/");

    const cardList = await getCardLists(noteId);
    res.render(`notes/${path}`, {
      layout: "main",
      title: "외우장",
      cssFile: `/css/notes/${css}`,
      cards: cardList || [],
      ...(js ? { jsFile: `/js/notes/${js}` } : {}),
    });
  });
});

// favicon.ico 무시
router.get("/favicon.ico", (req, res) => res.sendStatus(204));

// layout 없이 렌더링되는 페이지 (ex: 회원가입, 비밀번호 찾기 등)
// 화이트리스트 방식으로 보안 유지
const staticPages = ["register",]; // 필요한 페이지 추가

router.get("/:page", (req, res) => {
  const page = req.params.page;
  if (staticPages.includes(page)) {
    console.log(`${page} 화면으로 이동`);
    res.render(page, { layout: false });
  } else {
    res.status(404).send("Page not found");
  }
});

module.exports = router;
