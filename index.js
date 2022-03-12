const express = require("express");
const app = express();
const logger = require("morgan");
const bodyParser = require("body-parser");

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

const serviceAccount = require("./data/firebase-IAM-key/namsigdang-crawler-firebase-adminsdk.json");

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

app.use("/api", apiRouter);

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
apiRouter.post("/menu", function (req, res) {
  console.log("\n<req.body 출력> ");
  console.log(req.body);

  var block_id = req.body.intent.id;
  console.log("block_id: " + block_id);
  console.log("typeof(block_id): " + typeof block_id);

  var real_string_date;

  if (block_id == "5c9766875f38dd476721bbd2") {
    console.log("< main_식단 알림 >");
    var str_body_date = req.body.action.params.date.toString();
    var json_body_date = JSON.parse(str_body_date);
    real_string_date = json_body_date.date;
    console.log("\nreal_string_date 출력: " + real_string_date); // 2019-03-27
  } else if (block_id == "5cb451475f38dd0eeb9c9eaa") {
    console.log("< 날짜 선택 오타 >");
    var str_body_date = req.body.action.params.date.toString();
    var json_body_date = JSON.parse(str_body_date);
    real_string_date = json_body_date.value;
    console.log("\nreal_string_date 출력: " + real_string_date); // 2019-03-27
  } else if (block_id == "5cb464ba5f38dd0eeb9c9efd") {
    console.log("< 플러그인 선택 >");
    var str_body_date = req.body.action.params.date.toString();
    var json_body_date = JSON.parse(str_body_date);
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

  switch (user_id) {
    case "test1":
      var user_name = "test1";
      break;

    case "test2":
      var user_name = "test2";
      break;

    default:
      var user_name = "일반 유저";
  }

  console.log("사용자: " + user_name);
  console.log("사용자 ID: " + user_id);

  // 파일 쓰기
  var fs = require("fs");

  const error_handler2 = function (error) {
    if (error) console.log(error);
    else console.log("user_id.txt 쓰기 성공!");
  };

  fs.appendFile(
    "./data/user_id.txt",
    new Date() +
      "\n사용자: " +
      user_name +
      "\n" +
      "사용자 ID: " +
      user_id +
      "\n\n",
    "utf8",
    error_handler2
  );

  var week_name = new Array(
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일"
  );
  var today_name = new Date(real_string_date).getDay();
  var todayLabel = week_name[today_name];
  var selectedDate = real_string_date + "-" + todayLabel;

  // 파일 쓰기
  var fs = require("fs");

  const error_handler = function (error) {
    if (error) console.log(error);
    else console.log("log.txt 쓰기 성공!");
  };

  fs.appendFile(
    "./log/menu/log.txt",
    "\n\n\n" + JSON.stringify(req.body),
    "utf8",
    error_handler
  );

  var changeNamdoCode =
    "eu" +
    real_string_date.substr(0, 4) +
    real_string_date.substr(5, 2) +
    real_string_date.substr(8, 2);
  console.log("남도 코드: " + changeNamdoCode);

  //파일 읽기
  var path_all_menu_txt = "./data/test_data/all_menu.txt";

  var fs = require("fs");

  fs.readFile(path_all_menu_txt, "utf8", function (err, data) {
    data = data.replace(/\'/gi, '"');
    data = data.replace(/\//gi, "&");
    // 오류나면 path_all_menu_txt 경로를 확인해주세요.

    var menuJson = JSON.parse(data);

    var selectedBreakfastMenu = menuJson[changeNamdoCode + "a"];
    var selectedLunchMenu = menuJson[changeNamdoCode + "b"];
    var selectedDinnerMenu = menuJson[changeNamdoCode + "c"];

    var error_msg_1 = "식단정보가 없습니다.";
    var error_msg_2 = "식단정보를 찾을 수 없습니다.";

    if (selectedBreakfastMenu == "") {
      selectedBreakfastMenu = error_msg_1;
    } else if (selectedBreakfastMenu == null) {
      selectedBreakfastMenu = error_msg_2;
    }

    if (selectedLunchMenu == "") {
      selectedLunchMenu = error_msg_1;
    } else if (selectedLunchMenu == null) {
      selectedLunchMenu = error_msg_2;
    }

    if (selectedDinnerMenu == "") {
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

    res.status(200).send(responseBody);
  });
});

apiRouter.post("/fbtest", async function (req, res) {
  // /menu/Eunpyeong/year_2022/month_03
  const menu_fs = db
    .collection("menu")
    .doc("Eunpyeong")
    .collection("year_2022")
    .doc("month_03");
  const menu_doc = await menu_fs.get();

  var menu_data = {};
  if (!menu_doc.exists) {
    console.log("No such document!");
  } else {
    console.log("Document data:", menu_doc.data());
    menu_data = menu_doc.data();
  }

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: "fbtest!!",
            menu_data: menu_data,
          },
        },
      ],
    },
  };

  res.status(200).send(responseBody);
});

let port_num = 3000;

app.listen(port_num, function () {
  console.log(
    `NamSigDang_kakao_chatbot skill server listening on port ${port_num}!`
  );
});
