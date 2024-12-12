FROM node:20
WORKDIR ./
COPY package.json ./
RUN npm install
COPY . ./

CMD ["node","server.js"]