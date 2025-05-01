const express = require("express");
const router = express.Router();
const { testMethod, testMethod2 } = require("../controllers/infoController");
const { handleLogin } = require('../controllers/authController');

router.use(express.json());

/* 화면 이동 라우터 */

// favicon.ico 호출 차단
router.get("/favicon.ico", function (req, res) {});

router.get("/", (req, res) => {
  res.render("login", { layout: false });
});

// 로그인 처리
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(username + " | " + password);

  // DB에서 회원 아이디/비밀번호 조회 및 로그인 체크 
  await handleLogin(req, res, username, password);
});

// 로그아웃
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
      if (err) return res.send("Error logging out.");
      res.clearCookie("connect.sid");
      res.redirect("/");
  });
});

// main페이지 body 세팅
router.get("/main", (req, res) => {
  res.render("notes/notes", {
    layout: "main", // main.ejs를 레이아웃으로 사용
    title: "외우장",
    cssFile: "/css/notes/notes.css"
  });
});

router.get("/cards_split", (req, res) => {
  res.render("notes/cards_split", {
    layout: "main", // main.ejs를 레이아웃으로 사용
    title: "외우장",
    cssFile: "/css/notes/cards_split.css"
  });
});

router.get("/cards_filp", (req, res) => {
  res.render("notes/cards_filp", {
    layout: "main", // main.ejs를 레이아웃으로 사용
    title: "외우장",
    cssFile: "/css/notes/cards_filp.css",
    jsFile: "/js/notes/cards_filp.js" // JS 파일 경로 추가
  });
});

router.get("/cards_text", (req, res) => {
  res.render("notes/cards_text", {
    layout: "main", // main.ejs를 레이아웃으로 사용
    title: "외우장",
    cssFile: "/css/notes/cards_text.css"
  });
});

// 동적 페이지 렌더링 예시
router.get("/:page", async (req, res) => {
  try {

    var pageData = req.params.page;

    console.log(`${pageData} 화면으로 이동`);
    res.render(`partials/${pageData}`); //페이지 이동

    // res.json({pagename : pageData});
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

/* api 라우터 */
// get/post/동적페이징 렌더링 기본 예시
router.get("/users", async (req, res) => {
  try {
    const data = await testMethod();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/users", async (req, res) => {
  try {
    const data = await testMethod2(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
