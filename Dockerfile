FROM node:16

LABEL maintainer="contact@wookingwoo.com"

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
