FROM node:20

WORKDIR /app

COPY package*.json ./
COPY src ./src

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start", "--", "0.0.0.0:3000"]
