const express = require("express");
const router = express.Router();
const { getNoteLists } = require("../controllers/noteController");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

/* 화면별 api */
// 화면에서 사용할 api의 라우터를 아래에 추가해주세요

// /user/.. 경로의 사용자 관련 기능 라우터
router.use("/user", require("./auth"));

/* 화면 이동 라우터 */
// get방식의 페이지 이동관련 라우터를 아래에 추가해주세요

// 로그인 화면
router.get("/", function (req, res) {
  if (req.session.user) {
    req.session.destroy(function (err) {
      // 세션이 남아있는 경우 제거한다.
      if (err) {
        console.error("세션 제거 중 에러:", err);
        return res.send("Error logging out.");
      }
      res.clearCookie("connect.sid");

      // 세션 제거와 쿠키 삭제가 완료된 후에 렌더링
      return res.render("login", { layout: false });
    });
  } else {
    res.render("login", { layout: false });
  }
});

// main페이지 body 세팅
router.get("/main", async (req, res) => {
  // 사용자 노트 정보
  console.log(req.session.user.id);
  const noteList = await getNoteLists(req.session.user.id);
  // console.log(noteList[0]);

  res.render("notes/notes", {
    layout: "main", // main.ejs를 레이아웃으로 사용
    title: "외우장",
    cssFile: "/css/notes/notes.css",
    notes: noteList,
  });
});

router.get("/cards_split", (req, res) => {
  res.render("notes/cards_split", {
    layout: "main", // main.ejs를 레이아웃으로 사용
    title: "외우장",
    cssFile: "/css/notes/cards_split.css",
  });
});

router.get("/cards_filp", (req, res) => {
  res.render("notes/cards_filp", {
    layout: "main", // main.ejs를 레이아웃으로 사용
    title: "외우장",
    cssFile: "/css/notes/cards_filp.css",
    jsFile: "/js/notes/cards_filp.js", // JS 파일 경로 추가
  });
});

router.get("/cards_text", (req, res) => {
  res.render("notes/cards_text", {
    layout: "main", // main.ejs를 레이아웃으로 사용
    title: "외우장",
    cssFile: "/css/notes/cards_text.css",
  });
});

// favicon.ico 호출 차단
router.get("/favicon.ico", function (req, res) {});

// layout을 사용하지 않는 화면(회원가입, 아이디/비밀번호 조회)
// **이동할 페이지와 경로의 이름이 동일해야한다.
router.get("/:page", async (req, res) => {
  try {
    var pageData = req.params.page;
    console.log(`${pageData} 화면으로 이동`);
    res.render(`${pageData}`, { layout: false });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
