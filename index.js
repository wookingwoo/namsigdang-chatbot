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
apiRouter.post("/menu", async function (req, res) {
  let eunpyeong_menu_block_id = "5c9766875f38dd476721bbd2";
  let eunpyeong_menu_plugin_id = "5cb464ba5f38dd0eeb9c9efd";

  let dongjak_menu_block_id = "64414f25e40e9c7542d74785";
  let dongjak_menu_plugin_id = "64415080013416338a085398";

  const campus_code = req.query.campus;
  var campus_name;
  var main_menu_block_id;
  var main_menu_plugin_id;

  console.log("campus_code: " + campus_code);

  if (campus_code == "eu") {
    campus_name = "Eunpyeong";
    main_menu_block_id = eunpyeong_menu_block_id;
    menu_plugin_id = eunpyeong_menu_plugin_id;
  } else if (campus_code == "do") {
    campus_name = "Dongjak";
    main_menu_block_id = dongjak_menu_block_id;
    menu_plugin_id = dongjak_menu_plugin_id;
  } else {
    console.log("Query string 'campus' is not valid.");
    res.status(400).send({
      error_msg: "Query string 'campus' is not valid. Use 'eu' or 'do'.",
      campus: campus_code,
    });
    return; // 에러 발생 시 함수 실행 중지
  }

  console.log("\n[req.body 시작]");
  console.log(req.body);
  console.log("[req.body 종료]\n");

  let json_body_date;
  let str_body_date;

  let noMenuMsg = "식단 정보가 없습니다. 다른 날짜를 선택해주세요.";

  let today = new Date();

  let now_year = today.getFullYear(); // 현재 년도
  var now_month = today.getMonth() + 1; // 현재 월
  var now_date = today.getDate(); // 현재 날짜
  let now_day = today.getDay(); // 현재 요일

  now_month = makeTwoNumber(now_month); // 2자리로 표현 (0붙임)
  now_date = makeTwoNumber(now_date); // 2자리로 표현 (0붙임)

  var block_id = req.body.intent.id;
  console.log("block_id: " + block_id);
  console.log("typeof(block_id): " + typeof block_id);

  var real_string_date;

  if (block_id === eunpyeong_menu_block_id) {
    console.log("< main_은평관 식단 알림 >");
    str_body_date = req.body.action.params.date.toString();
    json_body_date = JSON.parse(str_body_date);
    real_string_date = json_body_date.date;
    console.log("\nreal_string_date 출력: " + real_string_date); // 2019-03-27
  } else if (block_id === "5cb451475f38dd0eeb9c9eaa") {
    console.log("< [은평관] 날짜 선택 오타 >");
    str_body_date = req.body.action.params.date.toString();
    json_body_date = JSON.parse(str_body_date);
    real_string_date = json_body_date.value;
    console.log("\nreal_string_date 출력: " + real_string_date); // 2019-03-27
  } else if (block_id === eunpyeong_menu_plugin_id) {
    console.log("< [은평관] 플러그인 선택 >");
    str_body_date = req.body.action.params.date.toString();
    json_body_date = JSON.parse(str_body_date);
    real_string_date = json_body_date.value;
    console.log("\nreal_string_date 출력: " + real_string_date); // 2019-03-27
  } else if (block_id === dongjak_menu_block_id) {
    console.log("< main_동작관 식단 알림 >");
    str_body_date = req.body.action.params.date.toString();
    json_body_date = JSON.parse(str_body_date);
    real_string_date = json_body_date.date;
    console.log("\nreal_string_date 출력: " + real_string_date); // 2019-03-27
  } else if (block_id === dongjak_menu_plugin_id) {
    console.log("< [동작관] 플러그인_날짜 선택하기 >");
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

  let requestDate = new Date(real_string_date);
  const requestDay = requestDate.getDay();
  const todayLabel = week_name[requestDay];
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

  // 최근 3개월 이내의 날짜가 아닌경우 알려주지 않음
  if (isBeforeOrAfterMonths(requestDate, 3)) {
    responseSimpleText(res, "최근 3개월 이내의 날짜만 조회 가능합니다.");
  }

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
    responseSimpleText(res, noMenuMsg);
  } else {
    // console.log("Document data:", menu_doc.data());
    menuJson = menu_doc.data();
  }

  let selectedBreakfastMenu = menuJson[namdo_code + "a"];
  let selectedLunchMenu = menuJson[namdo_code + "b"];
  let selectedDinnerMenu = menuJson[namdo_code + "c"];

  if (selectedBreakfastMenu !== undefined) {
    selectedBreakfastMenu = selectedBreakfastMenu
      .replace(/\//gi, "&")
      .replace(/,/gi, ", ");
  }

  if (selectedLunchMenu !== undefined) {
    selectedLunchMenu = selectedLunchMenu
      .replace(/\//gi, "&")
      .replace(/,/gi, ", ");
  }

  if (selectedDinnerMenu !== undefined) {
    selectedDinnerMenu = selectedDinnerMenu
      .replace(/\//gi, "&")
      .replace(/,/gi, ", ");
  }

  if (!selectedBreakfastMenu && !selectedLunchMenu && !selectedDinnerMenu) {
    responseSimpleText(res, noMenuMsg);
  }

  if (!selectedBreakfastMenu) {
    selectedBreakfastMenu = noMenuMsg;
  }

  if (!selectedLunchMenu) {
    selectedLunchMenu = noMenuMsg;
  }

  if (!selectedDinnerMenu) {
    selectedDinnerMenu = noMenuMsg;
  }

  responseSimpleText(
    res,
    `<${selectedDate}> 식단 정보 \n\n[아침]\n${selectedBreakfastMenu}\n\n[점심]\n${selectedLunchMenu}\n\n[저녁]\n${selectedDinnerMenu}`,
    main_menu_block_id,
    menu_plugin_id
  );
});

function responseSimpleText(
  res,
  responseText,
  main_menu_block_id,
  menu_plugin_id
) {
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: responseText,
          },
        },
      ],

      quickReplies: [
        {
          messageText: "메뉴 보기",
          action: "block",
          label: "메뉴 보기",
          blockId: main_menu_block_id,
        },
        {
          messageText: "달력에서 선택하기",
          action: "block",
          label: "달력에서 선택하기",
          blockId: menu_plugin_id,
        },
      ],
    },
  };
  console.log("responseBody:", responseBody);
  res.status(200).send(responseBody);
}

function makeTwoNumber(variable) {
  variable = Number(variable).toString();
  if (Number(variable) < 10 && variable.length === 1) variable = "0" + variable;
  return variable;
}

function isBeforeOrAfterMonths(requestDate, numMonths) {
  // 현재 날짜 생성
  var currentDate = new Date();

  // 현재 날짜에서 지정된 개월 수 이전의 날짜 생성
  var monthsAgo = new Date();
  monthsAgo.setMonth(currentDate.getMonth() - numMonths);

  // 현재 날짜에서 지정된 개월 수 이후의 날짜 생성
  var monthsLater = new Date();
  monthsLater.setMonth(currentDate.getMonth() + numMonths);

  // 주어진 날짜가 지정된 개월 수 이전의 날짜보다 작으면 "지정된 개월 이전"을 반환
  if (requestDate < monthsAgo) {
    // `${numMonths}개월 이전`;
    return true;
  }

  // 주어진 날짜가 지정된 개월 수 이후의 날짜보다 크면 "지정된 개월 이후"를 반환
  if (requestDate > monthsLater) {
    // `${numMonths}개월 이후`;
    return true;
  }

  // 그 외의 경우는 "지정된 개월 이내"
  return false;
}

const PORT = 3000;

app.listen(PORT, function () {
  console.log(
    `NamSigDang_kakao_chatbot skill server listening on port ${PORT}!`
  );
});
