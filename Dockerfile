FROM node:12.19.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV PATH=/usr/src/app/node_modules/.bin:$PATH

COPY package*.json ./

RUN npm install

RUN chmod 777 /usr/src/app/node_modules

CMD ["npm", "start"]
