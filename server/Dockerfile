FROM node:20-alpine
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.js ./
USER node
EXPOSE 8080
CMD ["npm","start"]
