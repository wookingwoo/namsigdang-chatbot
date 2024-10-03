# namsigdang-chatbot

- namsigdang kakaotalk chatbot (Eunpyeong campus): <https://pf.kakao.com/_SeKcj>
- namsigdang kakaotalk chatbot (Dongjak campus): <http://pf.kakao.com/_Zhmxkxj>

- contact namsigdang: <contact@wookingwoo.com>

## Get started in local

```bash
npm install
node index.js
```

## Get started with Dockerfile

- docker build [OPTIONS] PATH | URL | -

- docker run -p <host port number>:<container port number>/<protocol> [IMAGE NAME] [OTHER OPTIONS...]

```bash
docker build . -t namsigdang-chatbot:1.0
docker run -i -t -d -p <host port number>:3000 --name namsigdang-chatbot --restart always namsigdang-chatbot:1.0
```

## Get started with docker-compose

- docker-compose up [OPTIONS] [SERVICE...]

```bash
docker-compose up -d
```
