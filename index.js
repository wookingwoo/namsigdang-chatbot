const express = require("express");
const app = express();
const logger = require("morgan");
const bodyParser = require("body-parser");
var fs = require("fs");

// firebase 시작
const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");

require("dotenv").config(); // dotenv 패키지 로드

const serviceAccount = {
  // 환경 변수를 사용하여 Firebase 서비스 계정 정보 설정
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // 개행 문자 처리
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// firebase 끝

const apiRouter = express.Router();

app.use(logger("dev", {}));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/api/v1.3", apiRouter);

apiRouter.post("/sayHello", function (req, res) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: "hello I'm Ryan",
          },
        },
      ],
    },
  };

  res.status(200).send(responseBody);
});

apiRouter.post("/showHello", function (req, res) {
  console.log(req.body);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleImage: {
            imageUrl:
              "https://t1.daumcdn.net/friends/prod/category/M001_friends_ryan2.jpg",
            altText: "hello I'm Ryan",
          },
        },
      ],
    },
  };

  res.status(200).send(responseBody);
});

apiRouter.post("/money", function (req, res) {
  console.log(req.body);

  const responseBody = {
    version: "2.0",
    data: {
      msg: "HI",
      name: "Ryan",
      position: "Senior Managing Director",
    },
  };

  res.status(200).send(responseBody);
});

// ============== 남식당 급식봇 ==============
// 에러처리필요: 요청값 날짜 파라미터 없는경우 예외처리하기
apiRouter.post("/menu", async function (req, res) {
  const campus_code = req.query.campus;
  var campus_name;
  console.log("campus_code: " + campus_code);

  if (campus_code == "eu") {
    campus_name = "Eunpyeong";
  } else if (campus_code == "do") {
    campus_name = "Dongjak";
  } else {
    console.log("Query string 'campus' is not valid.");
    res.status(400).send({
      error_msg: "Query string 'campus' is not valid. Use 'eu' or 'do'.",
      campus: campus_code,
    });
    return; // 에러 발생 시 함수 실행 중지
  }

  let json_body_date;
  let str_body_date;
  console.log("\n<req.body 출력> ");

  console.log(req.body);

  let today = new Date();

  let now_year = today.getFullYear(); // 현재 년도
  var now_month = today.getMonth() + 1; // 현재 월
  var now_date = today.getDate(); // 현재 날짜
  let now_day = today.getDay(); // 현재 요일

  now_month = makeTwoNumber(now_month); // 2자리로 표현 (0붙임)
  now_date = makeTwoNumber(now_date); // 2자리로 표현 (0붙임)

  var request_log_dir = "./data";
  check_and_make_dir(request_log_dir);

  request_log_dir = request_log_dir + "/log";
  check_and_make_dir(request_log_dir);

  request_log_dir = request_log_dir + "/" + campus_name;
  check_and_make_dir(request_log_dir);

  request_log_dir = request_log_dir + "/request_body_log";
  check_and_make_dir(request_log_dir);

  request_log_dir = request_log_dir + `/year_${now_year}`;
  check_and_make_dir(request_log_dir);

  request_log_dir = request_log_dir + `/mounth_${now_month}`;
  check_and_make_dir(request_log_dir);

  request_log_dir =
    request_log_dir +
    `/${now_year}.${now_month}.${now_date}_request_body_logs.txt`;

  // 로그 파일 쓰기
  const error_handler = function (error) {
    if (error) console.log(error);
    else console.log("log.txt 쓰기 성공!");
  };

  fs.appendFile(
    request_log_dir,
    "\n\n" + JSON.stringify(req.body),
    "utf8",
    error_handler
  );

  var block_id = req.body.intent.id;
  console.log("block_id: " + block_id);
  console.log("typeof(block_id): " + typeof block_id);

  var real_string_date;

  let eunpyeong_menu_block_id = "5c9766875f38dd476721bbd2";
  let eunpyeong_menu_block_name = "main_은평관 식단 알림";

  if (block_id === eunpyeong_menu_block_id) {
    console.log("< " + eunpyeong_menu_block_name + " >");
    str_body_date = req.body.action.params.date.toString();
    json_body_date = JSON.parse(str_body_date);
    real_string_date = json_body_date.date;
    console.log("\nreal_string_date 출력: " + real_string_date); // 2019-03-27
  } else if (block_id === "5cb451475f38dd0eeb9c9eaa") {
    console.log("< 날짜 선택 오타 >");
    str_body_date = req.body.action.params.date.toString();
    json_body_date = JSON.parse(str_body_date);
    real_string_date = json_body_date.value;
    console.log("\nreal_string_date 출력: " + real_string_date); // 2019-03-27
  } else if (block_id === "5cb464ba5f38dd0eeb9c9efd") {
    console.log("< 플러그인 선택 >");
    str_body_date = req.body.action.params.date.toString();
    json_body_date = JSON.parse(str_body_date);
    real_string_date = json_body_date.value;
    console.log("\nreal_string_date 출력: " + real_string_date); // 2019-03-27
  } else {
    console.log("< 블록을 찾지 못했습니다. >");
    real_string_date = "2000-01-01";
    console.log("\nreal_string_date 출력: " + real_string_date); // 2019-03-27
  }

  var user_id = req.body.userRequest.user.id;
  console.log("user_id: " + user_id);
  console.log("typeof user_id: " + typeof user_id);

  const week_name = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];
  const today_name = new Date(real_string_date).getDay();
  const todayLabel = week_name[today_name];
  const selectedDate = real_string_date + "-" + todayLabel;

  let namdo_code_year = real_string_date.substr(0, 4); // 2022
  let namdo_code_month = real_string_date.substr(5, 2); // 03
  let namdo_code_date = real_string_date.substr(8, 2); // 05

  let namdo_code =
    campus_code + namdo_code_year + namdo_code_month + namdo_code_date;
  console.log("남도 코드: " + namdo_code);

  // 사용자 정보 업데이트
  const user_info = db.collection("chatbot_user").doc(user_id);

  const user_id_doc = await user_info.get();
  if (!user_id_doc.exists) {
    console.log("No such user_id_document, so make new user_info!");

    const res_userinfo_default = await user_info.set(
      {
        user_segmentation: null,
        join_date: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    // console.log("user_id_document data(기존데이터):", user_id_doc.data());
  }

  const res_update_userinfo = await user_info.update({
    usage_count: FieldValue.increment(1),
    recent_visit_date: FieldValue.serverTimestamp(),
    recent_menu_inquiry_date: namdo_code,
  });

  // /menu/Eunpyeong/year_2022/month_03
  const menu_fs = db
    .collection("menu")
    .doc(campus_name)
    .collection("year_" + namdo_code_year)
    .doc("month_" + namdo_code_month);
  const menu_doc = await menu_fs.get();

  let menuJson = {};
  if (!menu_doc.exists) {
    console.log("No such document!");
  } else {
    // console.log("Document data:", menu_doc.data());
    menuJson = menu_doc.data();
  }

  let selectedBreakfastMenu = menuJson[namdo_code + "a"]
    .replace(/\//gi, "&")
    .replace(/,/gi, ", ");
  let selectedLunchMenu = menuJson[namdo_code + "b"]
    .replace(/\//gi, "&")
    .replace(/,/gi, ", ");
  let selectedDinnerMenu = menuJson[namdo_code + "c"]
    .replace(/\//gi, "&")
    .replace(/,/gi, ", ");

  const error_msg_1 = "식단정보가 없습니다.";
  const error_msg_2 = "식단정보를 찾을 수 없습니다.";

  if (selectedBreakfastMenu === "") {
    selectedBreakfastMenu = error_msg_1;
  } else if (selectedBreakfastMenu == null) {
    selectedBreakfastMenu = error_msg_2;
  }

  if (selectedLunchMenu === "") {
    selectedLunchMenu = error_msg_1;
  } else if (selectedLunchMenu == null) {
    selectedLunchMenu = error_msg_2;
  }

  if (selectedDinnerMenu === "") {
    selectedDinnerMenu = error_msg_1;
  } else if (selectedDinnerMenu == null) {
    selectedDinnerMenu = error_msg_2;
  }

  const responseBody = {
    version: "2.0",
    data: {
      selectedDate: selectedDate,

      selectedBreakfastMenu: selectedBreakfastMenu,
      selectedLunchMenu: selectedLunchMenu,
      selectedDinnerMenu: selectedDinnerMenu,
    },
  };

  console.log("responseBody:", responseBody);

  res.status(200).send(responseBody);
});

function check_and_make_dir(dir_path) {
  // 로그 파일 경로 존재여부 체크
  const check_log_dir = fs.existsSync(dir_path);

  // 로그파일 경로가 존재하면 true, 없으면 false
  console.log("로그파일 경로 존재 여부:", check_log_dir);

  // 경로가 존재하지 않는경우 새로 생성
  if (!check_log_dir) fs.mkdirSync(dir_path);
}

function makeTwoNumber(variable) {
  variable = Number(variable).toString();
  if (Number(variable) < 10 && variable.length === 1) variable = "0" + variable;
  return variable;
}

const PORT = 3000;

app.listen(PORT, function () {
  console.log(
    `NamSigDang_kakao_chatbot skill server listening on port ${PORT}!`
  );
});
