FROM node:21-alpine as builder

WORKDIR /app

COPY package.json yarn.lock .

RUN yarn --network-timeout 200000

COPY . .

RUN yarn build

###

FROM node:21-alpine

WORKDIR /app

COPY config package.json yarn.lock .

RUN yarn --production --network-timeout 200000

COPY --from=builder /app/dist /app/dist
COPY config config

CMD node dist/main.js
