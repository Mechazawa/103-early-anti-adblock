FROM node:24

RUN apt-get update \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g npm@11.21.2

WORKDIR /app

COPY package*.json ./
COPY src ./src

RUN npm install
RUN npm run certs

EXPOSE 3000

CMD ["npm", "run", "serve", "--", "0.0.0.0:3000"]
