FROM node:15.1.0-alpine

WORKDIR /usr/src/app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn install

COPY . .

CMD yarn start