FROM node:14.0-alpine AS builder

WORKDIR /home/node
COPY . .
RUN npm install && ./node_modules/webpack/bin/webpack.js -p

FROM httpd:2.4-alpine

COPY --from=builder /home/node/www /usr/local/apache2/htdocs

EXPOSE 80
