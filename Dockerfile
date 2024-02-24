FROM node:20

WORKDIR /app

COPY package*.json ./
COPY src ./src

RUN npm install
RUN npm run ca

EXPOSE 3000

CMD ["npm", "run", "serve", "--", "0.0.0.0:3000"]
