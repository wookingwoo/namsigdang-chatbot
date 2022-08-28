FROM node:16

MAINTAINER wookingwoo <contact@wookingwoo.com>

RUN mkdir -p /namsigdang_chatbot
WORKDIR /namsigdang_chatbot

# 현재 Dockerfile 있는 경로의 모든 파일을 /namsigdang_chatbot 에 복사
ADD . /namsigdang_chatbot

RUN npm install

RUN npm install forever -g

#가상 머신에 오픈할 포트
EXPOSE 3000

#컨테이너에서 실행될 명령을 지정
#CMD [ "node", "index.js" ]
CMD [ "forever", "index.js" ]

# docker build . -t namsigdang-chatbot:1.0
# docker run -i -t -d -p 3000:3000 --name namsigdang-chatbot namsigdang-chatbot:1.0
# docker run -p <host port number>:<container port number>/<protocol> [IMAGE NAME] [OTHER OPTIONS...]
