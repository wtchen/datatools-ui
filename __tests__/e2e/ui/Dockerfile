# syntax=docker/dockerfile:1
FROM node:12
WORKDIR /datatools-build

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ARG BUGSNAG_KEY

RUN cd /datatools-build
COPY package.json yarn.lock /datatools-build/
RUN yarn
COPY . /datatools-build/ 
COPY configurations/default /datatools-config/
# CMD yarn run start -c /datatools-config
CMD yarn run mastarm build --env dev --serve --proxy http://datatools-server:4000/api # 