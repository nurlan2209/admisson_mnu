# frontend/Dockerfile
FROM node:18 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Сборка продакшен-версии
RUN npm run build

# Второй этап - только для запуска
FROM nginx:alpine

# Копируем собранные файлы в директорию Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Настройка Nginx для работы с React Router и проксирования API
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]