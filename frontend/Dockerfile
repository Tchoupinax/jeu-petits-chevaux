FROM node:21-alpine as builder

WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn --network-timeout 200000
COPY . .

RUN NODE_ENV=production yarn build:docker

###

FROM node:21-alpine

COPY --from=builder /app/.output /app/.output

CMD HOST=0.0.0.0 PORT=80 node /app/.output/server/index.mjs
