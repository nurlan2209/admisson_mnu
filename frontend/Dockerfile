# 1. Базовый образ
FROM node:18

# 2. Рабочая директория внутри контейнера
WORKDIR /app

# 3. Копируем package.json и package-lock.json
COPY package*.json ./

# 4. Устанавливаем зависимости, включая axios и react-router-dom
RUN npm install

# 5. Копируем остальные файлы
COPY . .

# 6. Команда для запуска (если используется напрямую)
CMD ["npm", "run", "dev"]
