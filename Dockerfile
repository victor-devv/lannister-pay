FROM node:latest

RUN mkdir -p /usr/src/lannister-pay

WORKDIR /usr/src/lannister-pay

COPY package.json /usr/src/lannister-pay/

RUN npm install

COPY . /usr/src/lannister-pay

EXPOSE 3500

VOLUME [ "/usr/src/lannister-pay" ]

CMD ["npm", "start"]