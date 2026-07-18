FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/build /usr/share/nginx/html   

RUN sed -i 's/listen  *80;/listen 8080;/' /etc/nginx/conf.d/default.conf

RUN chown -R 1000:1000 /var/cache/nginx /var/run /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown 1000:1000 /var/run/nginx.pid

USER 1000:1000
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]