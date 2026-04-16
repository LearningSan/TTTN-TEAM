# Base image
FROM node:22-alpine

# Tạo thư mục app
WORKDIR /app
RUN apk add --no-cache python3 make g++

# Copy package trước để cache tốt hơn
COPY package*.json ./

# Cài dependencies
RUN npm install --legacy-peer-deps

# Copy toàn bộ code
COPY . .

# Build Next.js
RUN npm run build

# Mở port
EXPOSE 3000

# Chạy production
CMD ["npm", "start"]