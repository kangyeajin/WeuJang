require("dotenv").config(); // .env 파일을 로드

const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");
const cors = require("cors");

const app = express();

const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("layout", "main");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 미들웨어 설정
app.use(
    helmet({
      frameguard: false,
    })
  );
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(express.static(path.join(__dirname, "public")));
  app.use(
    session({
      secure: true, // https 환경에서만 session 정보를 주고받음
      secret: process.env.COOKIE_SECRET,
      resave: false, // 세션이 수정될 때만 다시 저장
      saveUninitialized: true, // 처음부터 세션 생성
      cookie: {
        maxAge: 1000 * 60 * 120 , //세션 만료 시간 설정 - 120분
        httpOnly: true, //자바스크립트를 통한 세션 쿠키 사용 불가
      },
      rolling: true, // 새로고침 시 만료시간 갱신
    })
  );


const PORT = parseInt(process.env.PORT);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// 라우터 등록 - 모든 경로는 라우터로 보내 처리
const indexRouter = require("./routes/index.js");
app.use("/", indexRouter);
